import pytest
from intent_engine.classifier import IntentClassifier
from intent_engine.models import IntentRule


class TestIntentClassifier:
    """Unit tests for IntentClassifier."""
    
    @pytest.fixture
    def classifier(self):
        """Create a fresh classifier instance for each test."""
        return IntentClassifier()
    
    @pytest.fixture
    def sample_rules(self):
        """Sample rules for testing."""
        return [
            IntentRule(
                name="test_brake",
                intent_code="HARD_BRAKE_AHEAD",
                severity="danger",
                category="brake",
                description="Hard braking",
                patterns=["hard brake", "emergency brake"],
                weight=1.0
            ),
            IntentRule(
                name="test_merge",
                intent_code="MERGE_SOON",
                severity="warning",
                category="merge",
                description="Merging",
                patterns=["merge", "lane change"],
                weight=0.9
            )
        ]
    
    # Pattern Matching Tests
    
    def test_exact_match(self, classifier):
        """Test exact phrase match returns high confidence."""
        result = classifier.classify("hard brake", region="base")
        assert result.intent_code == "HARD_BRAKE_AHEAD"
        assert result.confidence >= 0.8
    
    def test_substring_match(self, classifier):
        """Test substring match returns moderate confidence."""
        result = classifier.classify("there is hard brake ahead", region="base")
        assert result.intent_code == "HARD_BRAKE_AHEAD"
        assert 0.6 <= result.confidence < 0.8
    
    def test_no_match_returns_fallback(self, classifier):
        """Test no match returns GENERIC_MESSAGE."""
        result = classifier.classify("hello world", region="base")
        assert result.intent_code == "GENERIC_MESSAGE"
        assert result.confidence == 0.5
        assert result.rule_name is None
    
    def test_case_insensitive_matching(self, classifier):
        """Test pattern matching is case-insensitive."""
        result1 = classifier.classify("HARD BRAKE", region="base")
        result2 = classifier.classify("hard brake", region="base")
        result3 = classifier.classify("Hard Brake", region="base")
        
        assert result1.intent_code == result2.intent_code == result3.intent_code
        assert result1.intent_code == "HARD_BRAKE_AHEAD"
    
    # Confidence Calculation Tests
    
    def test_confidence_exact_match(self, classifier, sample_rules):
        """Test exact match confidence is 0.8 * weight."""
        confidence = classifier._calculate_confidence("hard brake", "hard brake", 1.0)
        assert confidence == 0.8
    
    def test_confidence_substring_match(self, classifier, sample_rules):
        """Test substring match confidence is 0.6+ * weight."""
        confidence = classifier._calculate_confidence("hard brake ahead", "hard brake", 1.0)
        assert 0.6 <= confidence < 0.8
    
    def test_confidence_with_weight(self, classifier, sample_rules):
        """Test weight multiplier is applied correctly."""
        confidence = classifier._calculate_confidence("merge", "merge", 0.9)
        assert confidence == 0.8 * 0.9  # exact match * weight
    
    def test_confidence_capped_at_one(self, classifier, sample_rules):
        """Test confidence is capped at 1.0."""
        confidence = classifier._calculate_confidence("test", "test", 2.0)
        assert confidence == 1.0
    
    def test_longer_patterns_score_higher(self, classifier, sample_rules):
        """Test longer patterns get higher confidence."""
        text = "emergency brake now"
        short_conf = classifier._calculate_confidence(text, "brake", 1.0)
        long_conf = classifier._calculate_confidence(text, "emergency brake", 1.0)
        assert long_conf > short_conf
    
    # Rule Loading and Caching Tests
    
    def test_rules_loaded_from_base(self, classifier):
        """Test rules are loaded from base.yaml."""
        rules = classifier._load_rules("base")
        assert len(rules) > 0
        assert any(r.intent_code == "HARD_BRAKE_AHEAD" for r in rules)
    
    def test_rules_cached(self, classifier):
        """Test rules are cached after first load."""
        rules1 = classifier._load_rules("base")
        rules2 = classifier._load_rules("base")
        assert rules1 is rules2  # Same object reference
    
    def test_fallback_to_base_for_missing_region(self, classifier):
        """Test fallback to base.yaml when regional file missing."""
        rules = classifier._load_rules("nonexistent_region")
        assert len(rules) > 0  # Should load base.yaml
    
    # Text Normalization Tests
    
    def test_normalize_lowercase(self, classifier):
        """Test text is converted to lowercase."""
        normalized = classifier._normalize_text("HELLO WORLD")
        assert normalized == "hello world"
    
    def test_normalize_strip_whitespace(self, classifier):
        """Test leading/trailing whitespace is stripped."""
        normalized = classifier._normalize_text("  hello world  ")
        assert normalized == "hello world"
    
    def test_normalize_preserves_special_chars(self, classifier):
        """Test special characters are preserved."""
        normalized = classifier._normalize_text("hello-world!")
        assert normalized == "hello-world!"
    
    # Multiple Pattern Matching Tests
    
    def test_best_match_selected(self, classifier):
        """Test best matching rule is selected."""
        result = classifier.classify("emergency brake", region="base")
        assert result.intent_code == "HARD_BRAKE_AHEAD"
        assert result.confidence > 0.6
    
    def test_multiple_patterns_in_rule(self, classifier):
        """Test all patterns in a rule are checked."""
        result1 = classifier.classify("hard brake", region="base")
        result2 = classifier.classify("emergency brake", region="base")
        
        assert result1.intent_code == result2.intent_code == "HARD_BRAKE_AHEAD"
    
    def test_highest_confidence_wins(self, classifier):
        """Test rule with highest confidence is selected."""
        # "merge" should match MERGE_SOON exactly
        result = classifier.classify("merge", region="base")
        assert result.intent_code == "MERGE_SOON"
    
    # Input Validation Tests
    
    def test_empty_text_returns_fallback(self, classifier):
        """Test empty text returns fallback intent (classifier doesn't validate)."""
        # Classifier's classify method doesn't validate, returns fallback
        result = classifier.classify("", region="base")
        assert result.intent_code == "GENERIC_MESSAGE"

    def test_whitespace_only_returns_fallback(self, classifier):
        """Test whitespace-only text returns fallback intent."""
        # After normalization, whitespace becomes empty and returns fallback
        result = classifier.classify("   ", region="base")
        assert result.intent_code == "GENERIC_MESSAGE"
    
    # Result Structure Tests
    
    def test_result_contains_all_fields(self, classifier):
        """Test IntentResult contains all required fields."""
        result = classifier.classify("hard brake", region="base")
        
        assert hasattr(result, "intent_code")
        assert hasattr(result, "original_text")
        assert hasattr(result, "severity")
        assert hasattr(result, "category")
        assert hasattr(result, "description")
        assert hasattr(result, "confidence")
        assert hasattr(result, "rule_name")
    
    def test_result_preserves_original_text(self, classifier):
        """Test original text is preserved in result."""
        original = "HARD BRAKE AHEAD"
        result = classifier.classify(original, region="base")
        assert result.original_text == original
    
    def test_result_includes_rule_name(self, classifier):
        """Test result includes the matched rule name."""
        result = classifier.classify("hard brake", region="base")
        assert result.rule_name == "hard_brake"
