import os
import uuid
import logging
from datetime import datetime
from telegram import Update, ForceReply
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    ConversationHandler,
    ContextTypes,
    filters,
)
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import PharmaGuard services
from services.vcf_parcer import PharmaGuardVCFParser
from services.rule_engine import CPICRuleEngine
from services.llm_service import PharmaGuardLLMService
from services.response_builder import PharmaGuardResponseBuilder

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

# Conversation states
WAITING_FOR_DRUG = 1

# Temporary upload directory
UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Store user data temporarily
user_sessions = {}


# ========================================
# Command Handlers
# ========================================

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    user = update.effective_user
    welcome_message = f"""
👋 Hello {user.first_name}!

Welcome to **PharmaGuard** - AI-Powered Pharmacogenomics Risk Analyzer

🧬 **How it works:**
1. Send me your VCF file (.vcf format)
2. Tell me which drug you're interested in
3. Get personalized pharmacogenomic insights

📤 **Upload your VCF file now to get started!**

Use /help for more information.
Use /cancel to cancel current analysis.
"""
    await update.message.reply_text(welcome_message)


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /help is issued."""
    help_text = """
🆘 **PharmaGuard Help**

**Commands:**
/start - Start the bot
/help - Show this help message
/cancel - Cancel current analysis

**How to use:**
1️⃣ Upload your VCF file (must be .vcf format, max 5MB)
2️⃣ Enter the drug name you want to analyze
3️⃣ Wait for the analysis results

**Supported file format:**
- VCF (Variant Call Format) files only
- Maximum file size: 5MB

**Example drugs:**
- Warfarin
- Clopidogrel
- Codeine
- Simvastatin
- and many more...

For technical support, contact your administrator.
"""
    await update.message.reply_text(help_text)


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Cancel and end the conversation."""
    user_id = update.effective_user.id
    if user_id in user_sessions:
        del user_sessions[user_id]
    
    await update.message.reply_text(
        "❌ Analysis cancelled. Send /start to begin a new analysis."
    )
    return ConversationHandler.END


# ========================================
# File and Analysis Handlers
# ========================================

async def handle_vcf_file(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handle VCF file upload."""
    user_id = update.effective_user.id
    document = update.message.document
    
    # Validate file extension
    if not document.file_name.endswith('.vcf'):
        await update.message.reply_text(
            "❌ Invalid file format. Please send a .vcf file."
        )
        return ConversationHandler.END
    
    # Check file size (5MB limit)
    if document.file_size > 5 * 1024 * 1024:
        await update.message.reply_text(
            "❌ File too large. Maximum size is 5MB."
        )
        return ConversationHandler.END
    
    # Download the file
    await update.message.reply_text("⏳ Downloading your VCF file...")
    
    file = await context.bot.get_file(document.file_id)
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.vcf")
    
    await file.download_to_drive(file_path)
    
    # Store file path in user session
    user_sessions[user_id] = {
        'file_path': file_path,
        'file_id': file_id,
        'file_name': document.file_name
    }
    
    await update.message.reply_text(
        "✅ File received!\n\n💊 Please enter the drug name you want to analyze:"
    )
    
    return WAITING_FOR_DRUG


async def handle_drug_name(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handle drug name input and perform analysis."""
    user_id = update.effective_user.id
    drug = update.message.text.strip()
    
    if user_id not in user_sessions:
        await update.message.reply_text(
            "❌ No VCF file found. Please start over with /start"
        )
        return ConversationHandler.END
    
    session = user_sessions[user_id]
    file_path = session['file_path']
    file_id = session['file_id']
    
    await update.message.reply_text(
        f"🔬 Analyzing {drug}...\nPlease wait, this may take a moment..."
    )
    
    try:
        # 1️⃣ Parse VCF
        parsed_variants = PharmaGuardVCFParser.parse_vcf(file_path)
        
        if not parsed_variants:
            await update.message.reply_text(
                "❌ No pharmacogenomic variants detected in the VCF file."
            )
            cleanup_session(user_id, file_path)
            return ConversationHandler.END
        
        # 2️⃣ Apply Rule Engine
        engine_output = CPICRuleEngine.evaluate(parsed_variants, drug)
        
        if not engine_output.get("evaluations"):
            await update.message.reply_text(
                f"❌ Drug '{drug}' is not supported or no relevant genes found."
            )
            cleanup_session(user_id, file_path)
            return ConversationHandler.END
        
        # 3️⃣ Generate LLM Explanation
        llm_service = PharmaGuardLLMService()
        explanation = llm_service.generate_explanation(engine_output)
        
        # 4️⃣ Build Final Structured Response
        builder = PharmaGuardResponseBuilder()
        final_response = builder.build_final_response(
            patient_id=f"TG_{file_id[:8]}",
            parsed_variants=parsed_variants,
            rule_engine_output=engine_output,
            llm_output=explanation,
        )
        
        # 5️⃣ Format and send results
        formatted_message = format_response(final_response, drug)
        
        # Send in chunks if too long
        if len(formatted_message) > 4096:
            # Split message into chunks
            chunks = split_message(formatted_message, 4096)
            for chunk in chunks:
                await update.message.reply_text(chunk, parse_mode='Markdown')
        else:
            await update.message.reply_text(formatted_message, parse_mode='Markdown')
        
        await update.message.reply_text(
            "\n✅ Analysis complete!\n\nSend another VCF file to analyze or /start to begin again."
        )
        
    except Exception as e:
        logger.error(f"Error during analysis: {str(e)}")
        await update.message.reply_text(
            f"❌ An error occurred during analysis:\n{str(e)}\n\nPlease try again with /start"
        )
    
    finally:
        # Cleanup
        cleanup_session(user_id, file_path)
    
    return ConversationHandler.END


# ========================================
# Helper Functions
# ========================================

def cleanup_session(user_id: int, file_path: str):
    """Clean up user session and temporary files."""
    if user_id in user_sessions:
        del user_sessions[user_id]
    
    if os.path.exists(file_path):
        os.remove(file_path)


def format_response(response, drug: str) -> str:
    """Format the PharmaGuard response for Telegram."""
    risk = response.risk_assessment
    profile = response.pharmacogenomic_profile
    recommendation = response.clinical_recommendation
    explanation = response.llm_generated_explanation
    
    # Risk emoji
    risk_emoji = {
        "Safe": "✅",
        "Adjust Dosage": "⚠️",
        "Toxic": "🔴",
        "Ineffective": "❌",
        "Unknown": "❓"
    }
    
    message = f"""
🧬 **PharmaGuard Analysis Report**

📋 **Patient ID:** `{response.patient_id}`
💊 **Drug:** {drug}
⏰ **Date:** {response.timestamp}

━━━━━━━━━━━━━━━━━━━━━
🎯 **RISK ASSESSMENT**
━━━━━━━━━━━━━━━━━━━━━

{risk_emoji.get(risk.risk_label, "❓")} **Risk Level:** {risk.risk_label}
📊 **Confidence:** {risk.confidence_score:.2%}
🔥 **Severity:** {risk.severity.upper()}

━━━━━━━━━━━━━━━━━━━━━
🧬 **GENETIC PROFILE**
━━━━━━━━━━━━━━━━━━━━━

**Gene:** {profile.primary_gene}
**Diplotype:** {profile.diplotype}
**Phenotype:** {profile.phenotype}

**Detected Variants:**
"""
    
    for i, variant in enumerate(profile.detected_variants, 1):
        message += f"\n{i}. {variant.primary_gene}"
        if variant.star_allele:
            message += f" ({variant.star_allele})"
        if variant.rsid:
            message += f" - {variant.rsid}"
        if variant.chromosome and variant.position:
            message += f"\n   Chr{variant.chromosome}:{variant.position}"
    
    message += f"""

━━━━━━━━━━━━━━━━━━━━━
💡 **CLINICAL RECOMMENDATION**
━━━━━━━━━━━━━━━━━━━━━

{recommendation.recommendation_text}

━━━━━━━━━━━━━━━━━━━━━
🤖 **AI EXPLANATION**
━━━━━━━━━━━━━━━━━━━━━

**Summary:**
{explanation.summary}

**Mechanism:**
{explanation.mechanism}

**Confidence:** {explanation.confidence}

━━━━━━━━━━━━━━━━━━━━━
📊 **QUALITY METRICS**
━━━━━━━━━━━━━━━━━━━━━

VCF Parsing: {'✅' if response.quality_metrics.vcf_parsing_success else '❌'}
Gene Detection: {'✅' if response.quality_metrics.gene_detected else '❌'}
Rule Engine: {'✅' if response.quality_metrics.rule_engine_applied else '❌'}
LLM Explanation: {'✅' if response.quality_metrics.llm_explanation_generated else '❌'}

━━━━━━━━━━━━━━━━━━━━━

⚠️ **Disclaimer:** This analysis is for informational purposes only. Always consult with healthcare professionals before making any medical decisions.
"""
    
    return message


def split_message(message: str, max_length: int = 4096) -> list:
    """Split a long message into chunks."""
    chunks = []
    current_chunk = ""
    
    lines = message.split('\n')
    
    for line in lines:
        if len(current_chunk) + len(line) + 1 <= max_length:
            current_chunk += line + '\n'
        else:
            if current_chunk:
                chunks.append(current_chunk)
            current_chunk = line + '\n'
    
    if current_chunk:
        chunks.append(current_chunk)
    
    return chunks


# ========================================
# Main Bot Setup
# ========================================

def create_telegram_bot() -> Application:
    """Create and configure the Telegram bot."""
    
    # Get bot token from environment
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    
    if not token:
        raise ValueError(
            "TELEGRAM_BOT_TOKEN not found in environment variables. "
            "Please set it up using BotFather."
        )
    
    # Create the Application
    application = Application.builder().token(token).build()
    
    # Conversation handler for VCF analysis flow
    conv_handler = ConversationHandler(
        entry_points=[
            MessageHandler(filters.Document.FileExtension("vcf"), handle_vcf_file)
        ],
        states={
            WAITING_FOR_DRUG: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, handle_drug_name)
            ],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )
    
    # Add handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(conv_handler)
    
    # Also handle VCF files outside conversation for convenience
    # This allows files to be uploaded at any time
    
    logger.info("✅ Telegram bot configured successfully")
    
    return application


async def run_telegram_bot():
    """Run the Telegram bot (v20+ compatible)."""
    application = create_telegram_bot()
    
    logger.info("🤖 Starting PharmaGuard Telegram Bot...")
    logger.info("✅ Bot is running. Press Ctrl+C to stop.")
    
    # ✅ CORRECT for python-telegram-bot v20+
    # run_polling() handles initialize, start, and polling automatically
    await application.run_polling(
        allowed_updates=Update.ALL_TYPES,
        drop_pending_updates=True,  # Ignore old messages on restart
    )
