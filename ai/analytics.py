"""
Advanced Analytics Dashboard for V2V Communication Platform
Real-time metrics, insights, and predictive analytics
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import pandas as pd
import numpy as np
from collections import defaultdict, deque
import statistics

class MetricType(Enum):
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    TIMER = "timer"

@dataclass
class MetricPoint:
    timestamp: datetime
    value: float
    labels: Dict[str, str] = None

@dataclass
class Alert:
    id: str
    severity: str
    message: str
    timestamp: datetime
    resolved: bool = False
    acknowledged: bool = False

class MetricsCollector:
    """Real-time metrics collection and aggregation"""

    def __init__(self):
        self.metrics = defaultdict(lambda: deque(maxlen=10000))  # Keep last 10k points
        self.counters = defaultdict(int)
        self.gauges = defaultdict(float)
        self.histograms = defaultdict(list)
        self.timers = defaultdict(list)
        self.alerts = []

    def increment_counter(self, name: str, value: float = 1.0, labels: Dict = None):
        """Increment a counter metric"""
        key = self._make_key(name, labels)
        self.counters[key] += value
        self._record_metric(name, self.counters[key], labels)

    def set_gauge(self, name: str, value: float, labels: Dict = None):
        """Set a gauge metric"""
        key = self._make_key(name, labels)
        self.gauges[key] = value
        self._record_metric(name, value, labels)

    def record_histogram(self, name: str, value: float, labels: Dict = None):
        """Record a histogram metric"""
        key = self._make_key(name, labels)
        self.histograms[key].append(value)
        self._record_metric(name, value, labels)

    def record_timer(self, name: str, duration: float, labels: Dict = None):
        """Record a timer metric"""
        key = self._make_key(name, labels)
        self.timers[key].append(duration)
        self._record_metric(name, duration, labels)

    def _make_key(self, name: str, labels: Dict = None) -> str:
        """Create a unique key for metric with labels"""
        if not labels:
            return name
        label_str = ",".join(f"{k}={v}" for k, v in sorted(labels.items()))
        return f"{name}{{{label_str}}}"

    def _record_metric(self, name: str, value: float, labels: Dict = None):
        """Record a metric point"""
        point = MetricPoint(
            timestamp=datetime.now(),
            value=value,
            labels=labels or {}
        )
        self.metrics[name].append(point)

    def get_metric_summary(self, name: str, time_window: int = 3600) -> Dict:
        """Get summary statistics for a metric"""
        if name not in self.metrics:
            return {}

        cutoff_time = datetime.now() - timedelta(seconds=time_window)
        recent_points = [p for p in self.metrics[name] if p.timestamp > cutoff_time]

        if not recent_points:
            return {}

        values = [p.value for p in recent_points]
        return {
            'count': len(values),
            'min': min(values),
            'max': max(values),
            'avg': statistics.mean(values),
            'median': statistics.median(values),
            'p95': np.percentile(values, 95),
            'p99': np.percentile(values, 99),
            'time_window': time_window
        }

class AnalyticsEngine:
    """Advanced analytics engine for V2V platform"""

    def __init__(self):
        self.metrics_collector = MetricsCollector()
        self.user_sessions = {}
        self.message_analytics = defaultdict(list)
        self.geographic_data = defaultdict(int)
        self.performance_data = {}
        self.alert_rules = []

    async def track_message(self, message_data: Dict):
        """Track message analytics"""
        self.metrics_collector.increment_counter('messages_total', labels={
            'type': message_data.get('type', 'unknown'),
            'region': message_data.get('region', 'unknown')
        })

        # Track message latency
        if 'latency' in message_data:
            self.metrics_collector.record_timer('message_latency', message_data['latency'])

        # Geographic tracking
        if 'location' in message_data:
            lat = int(message_data['location'][0] * 10) / 10  # Round to 0.1 degree
            lon = int(message_data['location'][1] * 10) / 10
            region_key = f"{lat},{lon}"
            self.geographic_data[region_key] += 1

        # Store detailed message data
        self.message_analytics[message_data.get('type', 'unknown')].append({
            'timestamp': datetime.now(),
            'data': message_data
        })

    async def track_user_session(self, user_id: str, event: str, data: Dict = None):
        """Track user session analytics"""
        if user_id not in self.user_sessions:
            self.user_sessions[user_id] = {
                'start_time': datetime.now(),
                'events': [],
                'last_activity': datetime.now()
            }

        session = self.user_sessions[user_id]
        session['events'].append({
            'timestamp': datetime.now(),
            'event': event,
            'data': data or {}
        })
        session['last_activity'] = datetime.now()

        # Track user metrics
        self.metrics_collector.increment_counter('user_events', labels={
            'event_type': event
        })

        # Track active users
        active_users = len([s for s in self.user_sessions.values()
                          if (datetime.now() - s['last_activity']).seconds < 1800])
        self.metrics_collector.set_gauge('active_users', active_users)

    async def track_performance(self, operation: str, duration: float, success: bool = True):
        """Track performance metrics"""
        self.metrics_collector.record_timer('operation_duration', duration, labels={
            'operation': operation,
            'success': str(success).lower()
        })

        if not success:
            self.metrics_collector.increment_counter('operation_errors', labels={
                'operation': operation
            })

    async def generate_insights(self) -> Dict:
        """Generate real-time insights from collected data"""
        insights = {}

        # Message insights
        message_stats = self.metrics_collector.get_metric_summary('messages_total')
        if message_stats:
            insights['messages'] = {
                'total_volume': message_stats['count'],
                'rate_per_minute': message_stats['count'] / 60,
                'trend': 'increasing' if message_stats['avg'] > message_stats['median'] else 'stable'
            }

        # Performance insights
        latency_stats = self.metrics_collector.get_metric_summary('message_latency')
        if latency_stats:
            insights['performance'] = {
                'avg_latency': latency_stats['avg'],
                'p95_latency': latency_stats['p95'],
                'sla_compliance': latency_stats['p95'] < 1.0  # 1 second SLA
            }

        # Geographic insights
        if self.geographic_data:
            top_regions = sorted(self.geographic_data.items(),
                               key=lambda x: x[1], reverse=True)[:5]
            insights['geography'] = {
                'top_regions': [{'location': loc, 'message_count': count}
                              for loc, count in top_regions],
                'total_regions': len(self.geographic_data)
            }

        # User insights
        total_sessions = len(self.user_sessions)
        active_sessions = len([s for s in self.user_sessions.values()
                             if (datetime.now() - s['last_activity']).seconds < 1800])

        if total_sessions > 0:
            insights['users'] = {
                'total_sessions': total_sessions,
                'active_sessions': active_sessions,
                'engagement_rate': active_sessions / total_sessions
            }

        # System health insights
        error_rate = 0
        if 'operation_errors' in self.metrics_collector.counters and 'user_events' in self.metrics_collector.counters:
            errors = self.metrics_collector.counters['operation_errors']
            total = self.metrics_collector.counters['user_events']
            error_rate = errors / total if total > 0 else 0

        insights['system_health'] = {
            'error_rate': error_rate,
            'health_status': 'healthy' if error_rate < 0.01 else 'degraded'
        }

        return insights

    async def create_alert(self, severity: str, message: str, condition_check: callable = None):
        """Create and manage alerts"""
        alert_id = f"alert_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        alert = Alert(
            id=alert_id,
            severity=severity,
            message=message,
            timestamp=datetime.now()
        )

        self.alerts.append(alert)
        self.metrics_collector.increment_counter('alerts_total', labels={
            'severity': severity
        })

        # Log alert
        print(f"ALERT [{severity.upper()}]: {message}")
        return alert

    async def check_alert_conditions(self):
        """Check conditions and create alerts if necessary"""
        # High latency alert
        latency_stats = self.metrics_collector.get_metric_summary('message_latency')
        if latency_stats and latency_stats['p95'] > 2.0:  # 2 seconds
            await self.create_alert(
                'high',
                f"High latency detected: P95 = {latency_stats['p95']:.2f}s"
            )

        # High error rate alert
        error_stats = self.metrics_collector.get_metric_summary('operation_errors')
        if error_stats and error_stats['count'] > 100:  # 100 errors in last hour
            await self.create_alert(
                'critical',
                f"High error rate: {error_stats['count']} errors in last hour"
            )

        # Low active users alert
        active_users = self.metrics_collector.gauges.get('active_users', 0)
        if active_users < 10 and len(self.user_sessions) > 100:
            await self.create_alert(
                'medium',
                f"Low user activity: {active_users} active users"
            )

class PredictiveAnalytics:
    """Predictive analytics for traffic and system performance"""

    def __init__(self):
        self.historical_data = []
        self.prediction_models = {}

    async def predict_traffic_volume(self, time_horizon: int = 60) -> Dict:
        """Predict traffic volume for the next time_horizon minutes"""
        current_time = datetime.now()

        # Get recent message rates
        recent_messages = []
        for i in range(10):  # Last 10 minutes
            # This would be calculated from actual metrics
            rate = 100 + np.random.normal(0, 20)
            recent_messages.append(rate)

        if len(recent_messages) < 2:
            return {'prediction': 100, 'confidence': 0.5, 'trend': 'stable'}

        # Simple linear regression for prediction
        x = np.arange(len(recent_messages))
        y = np.array(recent_messages)

        # Calculate trend
        if len(x) > 1:
            slope = np.polyfit(x, y, 1)[0]
            predicted_rate = recent_messages[-1] + slope * time_horizon
            trend = 'increasing' if slope > 0 else 'decreasing' if slope < 0 else 'stable'
        else:
            predicted_rate = recent_messages[-1]
            trend = 'stable'

        # Calculate confidence based on variance
        variance = np.var(recent_messages)
        confidence = max(0.3, min(0.9, 1.0 - variance / 1000))

        return {
            'prediction': max(0, predicted_rate),
            'confidence': confidence,
            'trend': trend,
            'time_horizon_minutes': time_horizon
        }

    async def predict_system_load(self) -> Dict:
        """Predict system load and resource requirements"""
        # Get current metrics
        current_users = analytics_engine.metrics_collector.gauges.get('active_users', 0)
        message_rate = analytics_engine.metrics_collector.counters.get('messages_total', 0) / 3600

        # Predictions based on historical patterns
        predicted_users = current_users * 1.2  # 20% growth estimate
        predicted_message_rate = message_rate * 1.15  # 15% growth estimate

        # Resource predictions
        cpu_utilization = min(95, predicted_message_rate * 0.1)  # Simple model
        memory_usage = min(90, predicted_users * 0.05)

        return {
            'predicted_users': predicted_users,
            'predicted_message_rate': predicted_message_rate,
            'resource_predictions': {
                'cpu_utilization_percent': cpu_utilization,
                'memory_usage_percent': memory_usage,
                'recommended_scaling': 'scale_up' if cpu_utilization > 80 else 'maintain'
            },
            'confidence': 0.75
        }

# Global analytics instance
analytics_engine = AnalyticsEngine()
predictive_analytics = PredictiveAnalytics()

async def get_dashboard_data() -> Dict:
    """Get comprehensive dashboard data"""
    # Get real-time insights
    insights = await analytics_engine.generate_insights()

    # Get predictive analytics
    traffic_prediction = await predictive_analytics.predict_traffic_volume()
    system_prediction = await predictive_analytics.predict_system_load()

    # Get recent alerts
    recent_alerts = [alert for alert in analytics_engine.alerts
                    if not alert.resolved and (datetime.now() - alert.timestamp).seconds < 3600]

    # Compile dashboard data
    dashboard_data = {
        'timestamp': datetime.now().isoformat(),
        'real_time_metrics': {
            'active_users': analytics_engine.metrics_collector.gauges.get('active_users', 0),
            'messages_per_minute': insights.get('messages', {}).get('rate_per_minute', 0),
            'avg_latency_ms': insights.get('performance', {}).get('avg_latency', 0) * 1000,
            'error_rate_percent': insights.get('system_health', {}).get('error_rate', 0) * 100
        },
        'insights': insights,
        'predictions': {
            'traffic': traffic_prediction,
            'system_load': system_prediction
        },
        'alerts': [asdict(alert) for alert in recent_alerts[-10:]],  # Last 10 alerts
        'health_status': insights.get('system_health', {}).get('health_status', 'unknown')
    }

    return dashboard_data

async def start_analytics_service():
    """Start the analytics service background tasks"""
    print("Starting analytics service...")

    async def periodic_tasks():
        while True:
            # Check alert conditions
            await analytics_engine.check_alert_conditions()

            # Clean up old sessions
            cutoff_time = datetime.now() - timedelta(hours=24)
            expired_sessions = [uid for uid, session in analytics_engine.user_sessions.items()
                               if session['start_time'] < cutoff_time]
            for uid in expired_sessions:
                del analytics_engine.user_sessions[uid]

            await asyncio.sleep(60)  # Run every minute

    # Start background task
    asyncio.create_task(periodic_tasks())
    print("Analytics service started successfully")

if __name__ == "__main__":
    async def demo_analytics():
        # Initialize analytics
        await start_analytics_service()

        # Simulate some activity
        for i in range(100):
            await analytics_engine.track_message({
                'type': 'hazard_alert',
                'region': 'us-east',
                'latency': 0.1 + np.random.exponential(0.05),
                'location': (40.7128 + np.random.normal(0, 0.01),
                           -74.0060 + np.random.normal(0, 0.01))
            })

            await analytics_engine.track_user_session(f"user_{i % 10}", "message_sent")
            await asyncio.sleep(0.1)

        # Get dashboard data
        dashboard = await get_dashboard_data()
        print("Dashboard data:", json.dumps(dashboard, indent=2, default=str))

    asyncio.run(demo_analytics())