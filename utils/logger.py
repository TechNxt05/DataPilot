import logging
import sys

# Configure a basic logger for the application
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

def get_logger(name: str):
    """Returns a configured logger instance."""
    return logging.getLogger(name)
