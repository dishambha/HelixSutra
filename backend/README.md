# HelixSutra Backend - PharmaGuard API

AI-powered Pharmacogenomics Risk Analyzer backend service. This API processes VCF files, applies CPIC guidelines, and uses LLMs to generate clinical explanations for drug-gene interactions.

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- `pip`

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd HelixSutra/backend
    ```

2.  **Create a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory:
    ```env
    GROQ_API_KEY=your_groq_api_key_here
    FRONTEND_URL=http://localhost:3000
    BACKEND_DOMAIN=helixsutra.debugninjas.tech
    ```

### Running Locally

```bash
uvicorn main:app --reload
```
The API will be available at `http://127.0.0.1:8000`.

## 📦 Deployment

This project is configured for deployment on **Render.com**.

1.  Connect your GitHub repository to Render.
2.  Select "New Web Service".
3.  Render will automatically detect `render.yaml` or you can configure manually:
    -   **Build Command:** `pip install -r requirements.txt`
    -   **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 10000`
4.  **Environment Variables:**
    -   Add `GROQ_API_KEY` in the Render dashboard.

## 📂 Project Structure

-   `main.py`: FastAPI entry point.
-   `models.py`: Pydantic data models.
-   `services/`: Business logic (VCF parsing, Rule Engine, LLM integration).
-   `data/`: Static knowledge base (Drug-Gene mappings, Guidelines).
