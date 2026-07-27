"""
Advanced Machine Learning Models for V2V Communication
Includes traffic prediction, risk assessment, and behavioral analysis
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import asyncio
import json

class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class EventType(Enum):
    ACCIDENT = "accident"
    HAZARD = "hazard"
    CONGESTION = "congestion"
    WEATHER = "weather"
    CONSTRUCTION = "construction"
    EMERGENCY = "emergency"

@dataclass
class TrafficData:
    timestamp: datetime
    location: Tuple[float, float]  # (lat, lon)
    speed: float
    vehicle_count: int
    weather_condition: str
    road_type: str

@dataclass
class TrafficPrediction:
    location: Tuple[float, float]
    predicted_speed: float
    congestion_risk: float
    accident_risk: float
    optimal_speed: float
    time_horizon: int  # minutes
    confidence: float

@dataclass
class RiskAssessment:
    vehicle_id: str
    location: Tuple[float, float]
    risk_level: RiskLevel
    risk_factors: List[str]
    recommended_actions: List[str]
    emergency_contacts: List[str]

class TrafficPredictor:
    """ML-based traffic prediction system"""

    def __init__(self):
        self.model_weights = {
            'historical_patterns': 0.3,
            'real_time_data': 0.4,
            'weather_impact': 0.2,
            'events_impact': 0.1
        }
        self.traffic_history = []
        self.prediction_cache = {}

    async def train_on_historical_data(self, data: List[TrafficData]):
        """Train the model with historical traffic patterns"""
        self.traffic_history.extend(data)

        # Simulate ML training - in production, this would use actual ML libraries
        print(f"Training on {len(data)} historical traffic data points")

    async def predict_traffic(self,
                            location: Tuple[float, float],
                            time_horizon: int = 30) -> TrafficPrediction:
        """Predict traffic conditions for a specific location"""

        # Check cache first
        cache_key = f"{location}_{time_horizon}"
        if cache_key in self.prediction_cache:
            return self.prediction_cache[cache_key]

        # Simulate ML prediction
        base_speed = np.random.normal(45, 15)  # km/h
        congestion_factor = np.random.beta(2, 5)
        accident_probability = np.random.beta(1, 100)

        prediction = TrafficPrediction(
            location=location,
            predicted_speed=max(10, base_speed * (1 - congestion_factor)),
            congestion_risk=congestion_factor,
            accident_risk=accident_probability,
            optimal_speed=min(80, base_speed * 1.2),
            time_horizon=time_horizon,
            confidence=0.85
        )

        # Cache prediction
        self.prediction_cache[cache_key] = prediction
        return prediction

class RiskAssessmentEngine:
    """AI-powered risk assessment for vehicles"""

    def __init__(self):
        self.risk_factors = {
            'speed': 0.25,
            'weather': 0.20,
            'traffic_density': 0.20,
            'time_of_day': 0.15,
            'location_history': 0.10,
            'vehicle_condition': 0.10
        }

    async def assess_vehicle_risk(self,
                                vehicle_id: str,
                                location: Tuple[float, float],
                                speed: float,
                                weather: str,
                                time_of_day: datetime) -> RiskAssessment:
        """Comprehensive risk assessment for a vehicle"""

        # Calculate risk scores
        risk_scores = []

        # Speed risk
        if speed > 120:
            speed_risk = 0.8
            risk_scores.append(("Excessive speed", speed_risk))
        elif speed > 100:
            speed_risk = 0.5
            risk_scores.append(("High speed", speed_risk))
        else:
            speed_risk = 0.1

        # Weather risk
        weather_risks = {
            'clear': 0.0,
            'rain': 0.3,
            'snow': 0.6,
            'fog': 0.7,
            'ice': 0.9
        }
        weather_risk = weather_risks.get(weather.lower(), 0.2)
        if weather_risk > 0.3:
            risk_scores.append((f"Poor weather: {weather}", weather_risk))

        # Time of day risk
        hour = time_of_day.hour
        if 22 <= hour or hour <= 5:  # Night hours
            time_risk = 0.4
            risk_scores.append(("Night driving", time_risk))
        elif 17 <= hour <= 19:  # Rush hour
            time_risk = 0.3
            risk_scores.append(("Rush hour", time_risk))
        else:
            time_risk = 0.1

        # Calculate overall risk
        total_risk = (
            self.risk_factors['speed'] * speed_risk +
            self.risk_factors['weather'] * weather_risk +
            self.risk_factors['time_of_day'] * time_risk
        )

        # Determine risk level
        if total_risk >= 0.7:
            risk_level = RiskLevel.CRITICAL
        elif total_risk >= 0.5:
            risk_level = RiskLevel.HIGH
        elif total_risk >= 0.3:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.LOW

        # Generate recommendations
        recommendations = []
        if speed_risk > 0.3:
            recommendations.append("Reduce speed to safe levels")
        if weather_risk > 0.3:
            recommendations.append("Increase following distance")
            recommendations.append("Use appropriate lights")
        if time_risk > 0.3:
            recommendations.append("Stay alert for other vehicles")

        assessment = RiskAssessment(
            vehicle_id=vehicle_id,
            location=location,
            risk_level=risk_level,
            risk_factors=[factor[0] for factor in risk_scores],
            recommended_actions=recommendations,
            emergency_contacts=["911", "local_hospital", "roadside_assistance"]
        )

        return assessment

class BehavioralAnalyzer:
    """Analyzes driver behavior patterns"""

    def __init__(self):
        self.behavior_patterns = {}
        self.anomaly_threshold = 0.7

    async def analyze_driving_pattern(self,
                                    vehicle_id: str,
                                    recent_events: List[Dict]) -> Dict:
        """Analyze recent driving behavior for patterns and anomalies"""

        # Extract behavioral features
        speed_changes = []
        brake_events = []
        acceleration_events = []

        for event in recent_events:
            if event['type'] == 'speed_change':
                speed_changes.append(abs(event['magnitude']))
            elif event['type'] == 'brake':
                brake_events.append(event['severity'])
            elif event['type'] == 'acceleration':
                acceleration_events.append(event['severity'])

        # Calculate behavioral metrics
        avg_speed_change = np.mean(speed_changes) if speed_changes else 0
        harsh_braking = len([b for b in brake_events if b > 0.7])
        aggressive_acceleration = len([a for a in acceleration_events if a > 0.7])

        # Detect anomalies
        anomaly_score = 0
        if avg_speed_change > 20:
            anomaly_score += 0.3
        if harsh_braking > 3:
            anomaly_score += 0.4
        if aggressive_acceleration > 2:
            anomaly_score += 0.3

        is_anomalous = anomaly_score > self.anomaly_threshold

        # Driver profile
        if harsh_braking == 0 and aggressive_acceleration == 0:
            driving_style = "Safe"
        elif harsh_braking <= 2 and aggressive_acceleration <= 1:
            driving_style = "Normal"
        else:
            driving_style = "Aggressive"

        analysis = {
            'vehicle_id': vehicle_id,
            'driving_style': driving_style,
            'anomaly_detected': is_anomalous,
            'anomaly_score': anomaly_score,
            'metrics': {
                'average_speed_change': avg_speed_change,
                'harsh_braking_count': harsh_braking,
                'aggressive_acceleration_count': aggressive_acceleration
            },
            'recommendations': self._generate_behavioral_recommendations(
                driving_style, is_anomalous, anomaly_score
            )
        }

        return analysis

    def _generate_behavioral_recommendations(self,
                                           driving_style: str,
                                           is_anomalous: bool,
                                           anomaly_score: float) -> List[str]:
        """Generate personalized recommendations based on behavior"""
        recommendations = []

        if driving_style == "Aggressive":
            recommendations.extend([
                "Practice smooth acceleration and braking",
                "Maintain safe following distances",
                "Consider defensive driving course"
            ])
        elif is_anomalous:
            recommendations.extend([
                "Recent driving pattern may indicate fatigue or distraction",
                "Consider taking a break if driving long distances",
                "Review recent trip for improvement opportunities"
            ])
        else:
            recommendations.append("Continue maintaining safe driving practices")

        return recommendations

class RouteOptimizer:
    """AI-powered route optimization for vehicles"""

    def __init__(self):
        self.optimization_factors = {
            'travel_time': 0.4,
            'safety': 0.3,
            'fuel_efficiency': 0.2,
            'traffic_conditions': 0.1
        }

    async def optimize_route(self,
                           start: Tuple[float, float],
                           end: Tuple[float, float],
                           preferences: Dict = None) -> Dict:
        """Optimize route based on multiple factors"""

        # Simulate route generation
        routes = [
            {
                'id': 'fastest',
                'name': 'Fastest Route',
                'estimated_time': 25,  # minutes
                'distance': 15.2,  # km
                'safety_score': 0.7,
                'fuel_efficiency': 0.6
            },
            {
                'id': 'safest',
                'name': 'Safest Route',
                'estimated_time': 32,
                'distance': 18.5,
                'safety_score': 0.95,
                'fuel_efficiency': 0.8
            },
            {
                'id': 'efficient',
                'name': 'Most Fuel Efficient',
                'estimated_time': 28,
                'distance': 14.8,
                'safety_score': 0.8,
                'fuel_efficiency': 0.95
            }
        ]

        # Calculate overall scores based on preferences
        if preferences:
            # Customize weights based on user preferences
            weights = self.optimization_factors.copy()
            if preferences.get('prioritize_safety'):
                weights['safety'] = 0.5
                weights['travel_time'] = 0.2
            if preferences.get('prioritize_efficiency'):
                weights['fuel_efficiency'] = 0.4
                weights['travel_time'] = 0.2
        else:
            weights = self.optimization_factors

        # Score each route
        for route in routes:
            route['overall_score'] = (
                weights['travel_time'] * (1 - route['estimated_time'] / 40) +
                weights['safety'] * route['safety_score'] +
                weights['fuel_efficiency'] * route['fuel_efficiency'] +
                weights['traffic_conditions'] * 0.8
            )

        # Sort by score and select best
        routes.sort(key=lambda x: x['overall_score'], reverse=True)
        best_route = routes[0]

        optimization = {
            'recommended_route': best_route,
            'alternative_routes': routes[1:],
            'estimated_savings': {
                'time': f"{routes[0]['estimated_time'] - routes[1]['estimated_time']} min",
                'fuel': f"{(routes[0]['fuel_efficiency'] - routes[1]['fuel_efficiency']) * 100:.1f}%"
            },
            'route_highlights': self._generate_route_highlights(best_route)
        }

        return optimization

    def _generate_route_highlights(self, route: Dict) -> List[str]:
        """Generate highlights for the recommended route"""
        highlights = []

        if route['safety_score'] > 0.9:
            highlights.append("Very safe route with excellent road conditions")
        if route['fuel_efficiency'] > 0.9:
            highlights.append("Optimized for maximum fuel efficiency")
        if route['estimated_time'] < 20:
            highlights.append("Quick route for time-sensitive trips")

        return highlights

# Global ML model instances
traffic_predictor = TrafficPredictor()
risk_assessor = RiskAssessmentEngine()
behavioral_analyzer = BehavioralAnalyzer()
route_optimizer = RouteOptimizer()

async def initialize_ml_models():
    """Initialize all ML models with training data"""
    print("Initializing ML models...")

    # Generate some mock historical data for training
    historical_data = []
    for i in range(1000):
        data = TrafficData(
            timestamp=datetime.now() - timedelta(hours=i),
            location=(40.7128 + np.random.normal(0, 0.1),
                     -74.0060 + np.random.normal(0, 0.1)),
            speed=np.random.normal(50, 20),
            vehicle_count=np.random.randint(10, 100),
            weather_condition=np.random.choice(['clear', 'rain', 'snow', 'fog']),
            road_type=np.random.choice(['highway', 'city', 'rural'])
        )
        historical_data.append(data)

    await traffic_predictor.train_on_historical_data(historical_data)
    print("ML models initialized successfully")

    return {
        'traffic_predictor': traffic_predictor,
        'risk_assessor': risk_assessor,
        'behavioral_analyzer': behavioral_analyzer,
        'route_optimizer': route_optimizer
    }