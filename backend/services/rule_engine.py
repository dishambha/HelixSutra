import os
import json
from collections import defaultdict
from typing import List, Dict


class CPICRuleEngine:
    """
    Data-driven Pharmacogenomics Rule Engine.
    Loads CPIC mappings from backend/data folder.
    """

    # -----------------------------
    # Load JSON Data (Deployment Safe)
    # -----------------------------
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.join(BASE_DIR, "data")

    try:
        with open(os.path.join(DATA_DIR, "drug_gene_map.json"), "r") as f:
            DRUG_GENE_MAP = json.load(f)

        with open(os.path.join(DATA_DIR, "gene_phenotypes.json"), "r") as f:
            PHENOTYPE_MAP = json.load(f)

        with open(os.path.join(DATA_DIR, "drug_guidelines.json"), "r") as f:
            DRUG_GUIDELINES = json.load(f)

    except Exception as e:
        raise RuntimeError(f"Failed to load CPIC data files: {e}")

    # -----------------------------
    # MAIN EVALUATION FUNCTION
    # -----------------------------
    @classmethod
    def evaluate(cls, parsed_variants: List[Dict], drug_name: str) -> Dict:

        drug_name = drug_name.upper().strip()

        # Validate drug
        if drug_name not in cls.DRUG_GENE_MAP:
            return {
                "drug": drug_name,
                "evaluations": [],
                "message": "Drug not supported by CPIC rule engine.",
            }

        relevant_genes = cls.DRUG_GENE_MAP[drug_name]

        # Group star alleles by gene
        gene_star_map = defaultdict(list)

        for variant in parsed_variants:
            gene = variant.get("primary_gene")
            star = variant.get("star_allele")

            if gene in relevant_genes and star:
                gene_star_map[gene].append(star)

        results = []

        # Evaluate each relevant gene
        for gene in relevant_genes:
            stars = sorted(gene_star_map.get(gene, []))

            if not stars:
                results.append(
                    {
                        "gene": gene,
                        "diplotype": "Unknown",
                        "phenotype": "Unknown",
                        "drug": drug_name,
                        "risk_label": "Unknown",
                        "recommendation": "No variant detected for this gene.",
                    }
                )
                continue

            # Construct diplotype
            if len(stars) == 1:
                diplotype = f"{stars[0]}/{stars[0]}"
            else:
                diplotype = f"{stars[0]}/{stars[1]}"

            # Map to phenotype (short codes PM/IM/NM/etc.)
            phenotype = cls.PHENOTYPE_MAP.get(gene, {}).get(diplotype, "Unknown")

            # Map phenotype to drug recommendation
            drug_info = cls.DRUG_GUIDELINES.get(drug_name, {}).get(
                phenotype,
                {
                    "risk_label": "Unknown",
                    "severity": "low",
                    "recommendation": "No CPIC guideline available for this genotype.",
                },
            )

            results.append(
                {
                    "gene": gene,
                    "diplotype": diplotype,
                    "phenotype": phenotype,
                    "drug": drug_name,
                    "risk_label": drug_info.get("risk_label", "Unknown"),
                    "severity": drug_info.get("severity", "low"),
                    "recommendation": drug_info.get("recommendation"),
                }
            )

        return {"drug": drug_name, "evaluations": results}
