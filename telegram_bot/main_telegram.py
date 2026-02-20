import asyncio
import os
import uvicorn
import logging
from threading import Thread
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)


def run_fastapi():
    """Run the FastAPI application."""
    logger.info("🚀 Starting FastAPI server...")
    
    # Get port from environment or use default
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    # Import here to avoid circular imports
    from main import app
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )


async def run_telegram():
    """Run the Telegram bot."""
    logger.info("🤖 Starting Telegram bot...")
    
    from services.telegram_bot import run_telegram_bot
    
    try:
        await run_telegram_bot()
    except Exception as e:
        logger.error(f"❌ Telegram bot error: {e}")
        raise


def start_fastapi_thread():
    """Start FastAPI in a separate thread."""
    fastapi_thread = Thread(target=run_fastapi, daemon=True)
    fastapi_thread.start()
    logger.info("✅ FastAPI thread started")
    return fastapi_thread


async def main():
    """Main function to run both FastAPI and Telegram bot."""
    
    print("""
╔═══════════════════════════════════════════════════╗
║                                                   ║
║          🧬 PharmaGuard Platform 🧬               ║
║                                                   ║
║   AI-Powered Pharmacogenomics Risk Analyzer       ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
    """)
    
    # Check for required environment variables
    telegram_token = os.getenv("TELEGRAM_BOT_TOKEN")
    openai_key = os.getenv("OPENAI_API_KEY")
    
    if not telegram_token:
        logger.warning("⚠️  TELEGRAM_BOT_TOKEN not found. Telegram bot will not start.")
        logger.warning("    Please set up your bot with BotFather and add the token to .env")
    
    if not openai_key:
        logger.warning("⚠️  OPENAI_API_KEY not found. LLM features may not work.")
    
    # Start FastAPI in a separate thread
    logger.info("=" * 50)
    logger.info("Starting services...")
    logger.info("=" * 50)
    
    fastapi_thread = start_fastapi_thread()
    
    # Give FastAPI a moment to start
    await asyncio.sleep(2)
    
    # Start Telegram bot (if token is available)
    if telegram_token:
        try:
            await run_telegram()
        except KeyboardInterrupt:
            logger.info("\n⚠️  Shutdown signal received")
        except Exception as e:
            logger.error(f"❌ Error: {e}")
    else:
        logger.info("⏸️  Telegram bot disabled. Only FastAPI is running.")
        logger.info("   To enable Telegram bot, add TELEGRAM_BOT_TOKEN to .env file")
        
        # Keep the program running
        try:
            while True:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            logger.info("\n⚠️  Shutdown signal received")
    
    logger.info("👋 Shutting down PharmaGuard...")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("\n✅ PharmaGuard stopped successfully")
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")
        raise
