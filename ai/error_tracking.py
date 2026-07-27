"""
Error tracking and monitoring setup for Looma.sh AI Service

Supports: Sentry, Custom logging, Health checks
"""

import os
import logging
from typing import Optional
from contextlib import contextmanager

# Lazy import for Sentry (optional dependency)
try:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.asyncio import AsyncioIntegration
    SENTRY_AVAILABLE = True
except ImportError:
    SENTRY_AVAILABLE = False


def setup_error_tracking(
    app_name: str = "looma-ai-service",
    environment: str = "production",
    enable_sentry: bool = True,
    sentry_dsn: Optional[str] = None,
    log_level: str = "INFO"
):
    """
    Initialize error tracking and monitoring

    Args:
        app_name: Application name for logging
        environment: Environment (production, staging, development)
        enable_sentry: Enable Sentry error tracking
        sentry_dsn: Sentry DSN (or use SENTRY_DSN env var)
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """

    # Setup structured logging
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    logger = logging.getLogger(app_name)
    logger.info(f"Initializing error tracking for {app_name} in {environment} mode")

    # Setup Sentry if available and configured
    if enable_sentry and SENTRY_AVAILABLE:
        dsn = sentry_dsn or os.getenv("SENTRY_DSN")

        if dsn:
            sentry_sdk.init(
                dsn=dsn,
                environment=environment,
                traces_sample_rate=1.0 if environment == "development" else 0.1,
                profiles_sample_rate=1.0 if environment == "development" else 0.1,
                integrations=[
                    FastApiIntegration(transaction_style="endpoint"),
                    AsyncioIntegration(),
                ],
                # Don't capture personally identifiable information
                send_default_pii=False,
                # Useful metadata
                release=os.getenv("GIT_COMMIT", "unknown"),
            )
            logger.info(f"Sentry initialized for {environment}")
        else:
            logger.warning("Sentry DSN not configured, skipping Sentry setup")
    elif enable_sentry and not SENTRY_AVAILABLE:
        logger.warning("Sentry SDK not installed (pip install sentry-sdk[fastapi])")

    return logger


@contextmanager
def capture_exception(logger: logging.Logger, context: Optional[dict] = None):
    """
    Context manager to capture exceptions with additional context

    Usage:
        with capture_exception(logger, {"user_id": "123"}):
            # code that might fail
            risky_operation()
    """
    try:
        yield
    except Exception as e:
        logger.error(f"Exception caught: {e}", extra=context or {})

        if SENTRY_AVAILABLE:
            if context:
                sentry_sdk.set_context("custom", context)
            sentry_sdk.capture_exception(e)

        raise


def log_performance(logger: logging.Logger, operation: str, duration_ms: float):
    """Log performance metrics"""
    logger.info(f"Performance: {operation} took {duration_ms:.2f}ms")

    if SENTRY_AVAILABLE:
        sentry_sdk.set_measurement(operation, duration_ms, "millisecond")


def set_user_context(user_id: str, email: Optional[str] = None):
    """Set user context for error tracking"""
    if SENTRY_AVAILABLE:
        sentry_sdk.set_user({
            "id": user_id,
            "email": email
        })
