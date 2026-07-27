import yaml
import logging
from pathlib import Path
from typing import List
from .models import IntentRule

logger = logging.getLogger("intent_engine")
CONFIG_PATH = Path(__file__).parent / "config"

def load_rules(region: str = "base") -> List[IntentRule]:
    """
    Load intent rules from YAML configuration.
    
    Args:
        region: Region identifier for rule file
    
    Returns:
        List of validated IntentRule objects
    
    Raises:
        FileNotFoundError: If no rule file found
        ValueError: If YAML is malformed or rules invalid
    """
    file = CONFIG_PATH / f"{region}.yaml"
    
    # Fallback to base.yaml if regional file doesn't exist
    if not file.exists():
        if region != "base":
            logger.warning(f"Regional file {region}.yaml not found, falling back to base.yaml")
        file = CONFIG_PATH / "base.yaml"
    
    # Check if base.yaml exists
    if not file.exists():
        raise FileNotFoundError(f"Rule configuration file not found: {file}")
    
    try:
        with open(file, "r") as f:
            data = yaml.safe_load(f)
    except yaml.YAMLError as e:
        raise ValueError(f"Failed to parse YAML file {file}: {e}")
    
    if not isinstance(data, dict) or "rules" not in data:
        raise ValueError(f"Invalid YAML structure in {file}: missing 'rules' key")
    
    rules_data = data.get("rules", [])
    if not isinstance(rules_data, list):
        raise ValueError(f"Invalid YAML structure in {file}: 'rules' must be a list")
    
    # Validate and create IntentRule objects
    rules = []
    for idx, rule_dict in enumerate(rules_data):
        try:
            # Pydantic will validate required fields
            rule = IntentRule(**rule_dict)
            rules.append(rule)
        except Exception as e:
            raise ValueError(f"Invalid rule at index {idx} in {file}: {e}")
    
    logger.info(f"Loaded {len(rules)} rules from {file}")
    return rules
