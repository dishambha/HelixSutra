import os
import uuid
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from models import PharmaGuardResponse
from services.vcf_parcer import PharmaGuardVCFParser  # ✅ fixed typo
from services.rule_engine import CPICRuleEngine
from services.llm_service import PharmaGuardLLMService
from services.response_builder import PharmaGuardResponseBuilder


# -----------------------------
# FastAPI App Initialization
# -----------------------------
app = FastAPI(
    title="PharmaGuard API",
    description="AI-powered Pharmacogenomics Risk Analyzer",
    version="1.0.0",
)

# -----------------------------
# CORS Configuration (Render Ready)
# -----------------------------
frontend_url = os.getenv("FRONTEND_URL", "")
backend_domain = os.getenv("BACKEND_DOMAIN", "helixsutra.debugninjas.tech")

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://localhost:3000",
    "https://127.0.0.1:5173",
]

# Add production domains
if backend_domain:
    ALLOWED_ORIGINS.extend([
        f"https://{backend_domain}",
        f"http://{backend_domain}",
        f"https://www.{backend_domain}",
    ])

if frontend_url:
    ALLOWED_ORIGINS.extend([
        frontend_url,
        frontend_url.replace("https://", "http://"),
    ])

# For development/testing - allow all origins (TEMPORARY)
# Comment this out in production and use specific origins above
ALLOWED_ORIGINS = ["*"]

print(f"🔒 CORS Allowed Origins: {ALLOWED_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Temporary Upload Directory
# -----------------------------
UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


# -----------------------------
# Health Check
# -----------------------------
@app.get("/")
def health_check():
    return {"status": "PharmaGuard API is running"}


# -----------------------------
# Main Analysis Endpoint
# -----------------------------
@app.post("/analyze", response_model=PharmaGuardResponse)
async def analyze_pharmacogenomics(file: UploadFile = File(...), drug: str = Form(...)):

    # Validate file extension
    if not file.filename.endswith(".vcf"):
        raise HTTPException(status_code=400, detail="Only .vcf files are allowed.")

    # Read file to check size
    file_content = await file.read()

    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 5MB limit.")

    # Save temporarily
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.vcf")

    with open(file_path, "wb") as buffer:
        buffer.write(file_content)

    try:
        # 1️⃣ Parse VCF
        parsed_variants = PharmaGuardVCFParser.parse_vcf(file_path)

        if not parsed_variants:
            raise HTTPException(
                status_code=400, detail="No pharmacogenomic variants detected."
            )

        # 2️⃣ Apply Rule Engine
        engine_output = CPICRuleEngine.evaluate(parsed_variants, drug)

        if not engine_output.get("evaluations"):
            raise HTTPException(
                status_code=400, detail="Drug not supported or no relevant gene found."
            )

        # 3️⃣ Generate LLM Explanation
        llm_service = PharmaGuardLLMService()
        explanation = llm_service.generate_explanation(engine_output)

        # 4️⃣ Build Final Structured Response
        builder = PharmaGuardResponseBuilder()

        final_response = builder.build_final_response(
            patient_id="PATIENT_" + file_id[:8],
            parsed_variants=parsed_variants,
            rule_engine_output=engine_output,
            llm_output=explanation,
        )

        return final_response

    # 🔥 Correct HTTP error handling
    except HTTPException as http_exc:
        raise http_exc

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Cleanup file
        if os.path.exists(file_path):
            os.remove(file_path)

