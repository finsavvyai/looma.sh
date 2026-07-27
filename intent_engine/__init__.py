"""
Intent Engine - Rule-based intent classification system.

Public API:
    classify(text, region) -> IntentResult
"""

import logging
from .models import IntentResult
from .classifier import IntentClassifier

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger("intent_engine")

# Singleton classifier instance
_classifier: IntentClassifier = None


def classify(text: str, region: str = "base") -> IntentResult:
    """
    Classify input text into an intent.
    
    Args:
        text: Natural language input to classify
        region: Regional rule set to use (default: "base")
    
    Returns:
        IntentResult with classification details
    
    Raises:
        ValueError: If text is empty or None
        FileNotFoundError: If rule file doesn't exist
    """
    global _classifier
    
    # Lazy initialization
    if _classifier is None:
        logger.info("Initializing Intent Engine")
        _classifier = IntentClassifier()
    
    # Validate input
    if not isinstance(text, str):
        raise ValueError("Text must be a string")

    if not text or not text.strip():
        raise ValueError("Text must be a non-empty string")
    
    # Classify
    try:
        result = _classifier.classify(text, region)
        logger.debug(f"Classified '{text}' as {result.intent_code} (confidence: {result.confidence:.2f})")
        return result
    except Exception as e:
        logger.error(f"Classification failed: {e}")
        raise


# Export public API
__all__ = ["classify", "IntentResult"]
