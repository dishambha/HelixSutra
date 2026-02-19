import os

class PharmaGuardVCFParser:
    """
    Parses VCF v4.2 files to extract pharmacogenomic variants.
    """
    # The 6 critical genes required for the RIFT 2026 hackathon
    TARGET_GENES = {"CYP2D6", "CYP2C19", "CYP2C9", "SLCO1B1", "TPMT", "DPYD"}

    @staticmethod
    def parse_vcf(file_path: str) -> list[dict]:
        """
        Reads a VCF file and returns a list of dictionaries containing
        the parsed target variants.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"VCF file not found at: {file_path}")

        detected_variants = []

        with open(file_path, 'r', encoding='utf-8') as file:
            for line in file:
                # 1. Skip metadata and header lines
                if line.startswith('#'):
                    continue

                # 2. Split the data row by tabs (VCFs are tab-delimited)
                columns = line.strip().split('\t')

                # Ensure the row has at least the 8 standard columns (up to INFO)
                if len(columns) < 8:
                    continue

                # 3. Isolate the 8th column (index 7), which is the INFO column
                info_column = columns[7]

                # 4. Parse the INFO column into a dictionary
                # INFO tags are separated by semicolons (e.g., GENE=CYP2C19;STAR=*2)
                info_dict = {}
                for item in info_column.split(';'):
                    if '=' in item:
                        key, value = item.split('=', 1)
                        info_dict[key] = value
                    else:
                        # Handle boolean flags in INFO (tags without an '=' sign)
                        info_dict[item] = True

                # 5. Extract our specific target tags
                gene = info_dict.get('GENE')
                star_allele = info_dict.get('STAR')

                # If RS tag isn't in INFO, fallback to the 3rd column (ID)
                rsid = info_dict.get('RS') or columns[2]

                # 6. Filter only the genes we care about
                if gene in PharmaGuardVCFParser.TARGET_GENES:
                    variant_data = {
                        "primary_gene": gene,
                        "star_allele": star_allele,
                        "rsid": rsid if rsid != "." else "Unknown",
                        "chromosome": columns[0],
                        "position": columns[1],
                        "raw_info": info_column # Helpful for debugging
                    }
                    detected_variants.append(variant_data)

        return detected_variants

# --- Example Usage for Testing ---
if __name__ == "__main__":
    # Assuming you saved the sample VCF from earlier as 'sample.vcf'
    # parser = PharmaGuardVCFParser()
    # results = parser.parse_vcf("sample.vcf")
    # import json
    # print(json.dumps(results, indent=2))
    pass