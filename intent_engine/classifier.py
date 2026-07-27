"""
Intent Classifier - Core pattern matching and classification logic.
"""

import logging
from typing import Dict, List, Optional, Tuple
from .models import IntentRule, IntentResult
from .rule_loader import load_rules

logger = logging.getLogger("intent_engine")


class IntentClassifier:
    """
    Core intent classification engine with pattern matching and confidence scoring.
    """
    
    def __init__(self):
        """
        Initialize the classifier with rule cache and fallback intent.
        """
        # Cache for loaded rules by region
        self._rule_cache: Dict[str, List[IntentRule]] = {}
        
        # Fallback intent for unmatched text
        self._fallback_intent = IntentResult(
            intent_code="GENERIC_MESSAGE",
            original_text="",
            severity="generic",
            category="general",
            description="Unclassified message",
            confidence=0.5,
            rule_name=None
        )
        
        logger.debug("IntentClassifier initialized")
    
    def classify(self, text: str, region: str = "base") -> IntentResult:
        """
        Classify input text into an intent.
        
        Args:
            text: Natural language input to classify
            region: Regional rule set to use (default: "base")
        
        Returns:
            IntentResult with classification details
        """
        # Load/cache rules for the region
        rules = self._load_rules(region)
        
        # Normalize input text
        normalized_text = self._normalize_text(text)
        
        # Find best matching rule
        match_result = self._match_patterns(normalized_text, rules)
        
        if match_result:
            rule, confidence = match_result
            # Construct IntentResult from matched rule
            return IntentResult(
                intent_code=rule.intent_code,
                original_text=text,
                severity=rule.severity,
                category=rule.category,
                description=rule.description,
                confidence=confidence,
                rule_name=rule.name
            )
        else:
            # Return fallback intent
            fallback = self._fallback_intent.model_copy(update={"original_text": text})
            logger.debug(f"No pattern match for '{text}', returning fallback")
            return fallback
    
    def _load_rules(self, region: str) -> List[IntentRule]:
        """
        Load and cache rules for a region.
        
        Args:
            region: Region identifier for rule file
        
        Returns:
            List of IntentRule objects
        """
        # Check cache first
        if region in self._rule_cache:
            logger.debug(f"Using cached rules for region '{region}'")
            return self._rule_cache[region]
        
        # Load rules from file
        logger.info(f"Loading rules for region '{region}'")
        rules = load_rules(region)
        
        # Cache the rules
        self._rule_cache[region] = rules
        logger.debug(f"Cached {len(rules)} rules for region '{region}'")
        
        return rules
    
    def _normalize_text(self, text: str) -> str:
        """
        Normalize text for pattern matching.
        
        Args:
            text: Input text to normalize
        
        Returns:
            Normalized text (lowercase, stripped whitespace)
        """
        return text.lower().strip()
    
    def _match_patterns(self, text: str, rules: List[IntentRule]) -> Optional[Tuple[IntentRule, float]]:
        """
        Find best matching rule and confidence score.
        
        Args:
            text: Normalized input text
            rules: List of rules to match against
        
        Returns:
            Tuple of (matched_rule, confidence) or None if no match
        """
        best_match: Optional[Tuple[IntentRule, float]] = None
        best_confidence = 0.0
        
        for rule in rules:
            for pattern in rule.patterns:
                confidence = self._calculate_confidence(text, pattern, rule.weight)
                
                if confidence > best_confidence:
                    best_confidence = confidence
                    best_match = (rule, confidence)
                    logger.debug(f"New best match: rule='{rule.name}', pattern='{pattern}', confidence={confidence:.3f}")
        
        return best_match
    
    def _calculate_confidence(self, text: str, pattern: str, weight: float) -> float:
        """
        Calculate confidence score for a pattern match.
        
        Args:
            text: Normalized input text
            pattern: Pattern to match against
            weight: Rule weight multiplier
        
        Returns:
            Confidence score between 0.0 and 1.0
        """
        normalized_pattern = pattern.lower()
        
        # Check for exact match
        if text == normalized_pattern:
            base_confidence = 0.8
            logger.debug(f"Exact match: '{pattern}' == '{text}'")
        # Check for substring match
        elif normalized_pattern in text:
            # Base confidence for substring match
            base_confidence = 0.6
            
            # Bonus for longer patterns (more specific)
            pattern_length_ratio = len(normalized_pattern) / len(text)
            length_bonus = pattern_length_ratio * 0.1
            base_confidence += length_bonus
            
            logger.debug(f"Substring match: '{pattern}' in '{text}' (ratio={pattern_length_ratio:.2f})")
        else:
            # No match
            return 0.0
        
        # Apply weight multiplier and normalize to max 1.0
        final_confidence = min(base_confidence * weight, 1.0)
        
        return final_confidence
