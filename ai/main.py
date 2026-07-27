from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional, List
import uuid
import os
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
import intent_engine
from database import create_device_store
from ml_models import (
    traffic_predictor, risk_assessor, behavioral_analyzer, route_optimizer,
    TrafficPrediction, RiskAssessment
)
from analytics import analytics_engine, get_dashboard_data, start_analytics_service
from blockchain.blockchain_integration import (
    blockchain_manager, DataCategory, initialize_blockchain,
    secure_data_storage, verify_data_integrity
)
from emergency.emergency_coordination import (
    emergency_coordinator, EmergencyType, EmergencySeverity,
    initialize_emergency_system, report_emergency, dispatch_emergency_responders
)


app = FastAPI(title="Looma AI + Identity Engine", version="0.3.0")

# Get allowed origins from environment (default to wildcard for dev)
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Configurable via environment
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database store
device_store = create_device_store()

# ---------- MODELS ----------

class IntentRequest(BaseModel):
    text: str


class DeviceRegisterRequest(BaseModel):
    public_key: str       # hex string from @noble/ed25519
    car_model: Optional[str] = None
    nickname: Optional[str] = None

class TrafficPredictionRequest(BaseModel):
    latitude: float
    longitude: float
    time_horizon: int = 30  # minutes

class RiskAssessmentRequest(BaseModel):
    vehicle_id: str
    latitude: float
    longitude: float
    speed: float
    weather: str = "clear"

class BehaviorAnalysisRequest(BaseModel):
    vehicle_id: str
    recent_events: List[Dict]

class RouteOptimizationRequest(BaseModel):
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float
    preferences: Optional[Dict] = None

class AnalyticsDashboardRequest(BaseModel):
    time_window: int = 3600  # seconds

class BlockchainDataRequest(BaseModel):
    data: Dict
    category: str
    device_id: str
    metadata: Dict = None

class BlockchainVerificationRequest(BaseModel):
    data_hash: str
    original_data: Dict = None

class EmergencyReportRequest(BaseModel):
    type: str
    severity: str
    latitude: float
    longitude: float
    description: str
    device_id: str
    reporter_info: Dict = None
    casualties: Dict = None
    affected_radius: float = 0.5
    estimated_duration: int = 60

class EmergencyDispatchRequest(BaseModel):
    emergency_id: str
    auto_dispatch: bool = True


class Device(BaseModel):
    device_id: str
    public_key: str
    car_model: Optional[str] = None
    nickname: Optional[str] = None


# ---------- EXISTING HEALTH & INTENT ----------

@app.get("/health")
def health():
    return {"status": "ok", "service": "Looma AI + Identity Engine"}


@app.post("/intent")
def intent(req: IntentRequest):
    """
    Classify message intent using rule-based engine.
    
    Returns IntentResult with classification details.
    """
    try:
        # Validate input
        if not req.text or not req.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Classify using intent engine
        result = intent_engine.classify(text=req.text, region="base")
        
        # Return result as dict
        return result.model_dump()
    
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Log error
        print(f"Intent classification error: {e}")
        raise HTTPException(status_code=500, detail="Classification failed")


# ---------- DEVICE IDENTITY ENDPOINTS ----------

@app.post("/identity/register", response_model=Device)
async def register_device(req: DeviceRegisterRequest):
    """
    Registers a device given its public key.

    - If public key already known → returns same device_id
    - If new key → creates a new device_id
    """
    pub = req.public_key.lower()

    # Check if device exists
    existing = await device_store.get_device_by_pubkey(pub)
    if existing:
        return Device(**existing)

    # Create new device
    device_id = str(uuid.uuid4())
    device_data = await device_store.register_device(
        device_id=device_id,
        public_key=pub,
        car_model=req.car_model,
        nickname=req.nickname
    )

    return Device(**device_data)


@app.get("/identity/{device_id}", response_model=Device)
async def get_device(device_id: str):
    device = await device_store.get_device_by_id(device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return Device(**device)


# ---------- ADVANCED AI ENDPOINTS ----------

@app.post("/ml/traffic-prediction")
async def predict_traffic(req: TrafficPredictionRequest):
    """
    Predict traffic conditions for a specific location
    Returns congestion risk, accident probability, and optimal speed
    """
    try:
        prediction = await traffic_predictor.predict_traffic(
            location=(req.latitude, req.longitude),
            time_horizon=req.time_horizon
        )

        # Track analytics
        await analytics_engine.track_performance('traffic_prediction', 0.5, True)

        return {
            "location": prediction.location,
            "predicted_speed": prediction.predicted_speed,
            "congestion_risk": prediction.congestion_risk,
            "accident_risk": prediction.accident_risk,
            "optimal_speed": prediction.optimal_speed,
            "time_horizon_minutes": prediction.time_horizon,
            "confidence": prediction.confidence,
            "recommendations": [
                "Maintain speed of {:.0f} km/h for optimal flow".format(prediction.optimal_speed),
                "Exercise caution" if prediction.congestion_risk > 0.7 else "Normal conditions"
            ]
        }
    except Exception as e:
        await analytics_engine.track_performance('traffic_prediction', 1.0, False)
        raise HTTPException(status_code=500, detail=f"Traffic prediction failed: {str(e)}")


@app.post("/ml/risk-assessment")
async def assess_risk(req: RiskAssessmentRequest):
    """
    Comprehensive risk assessment for a vehicle
    Analyzes speed, weather, location, and time factors
    """
    try:
        assessment = await risk_assessor.assess_vehicle_risk(
            vehicle_id=req.vehicle_id,
            location=(req.latitude, req.longitude),
            speed=req.speed,
            weather=req.weather,
            time_of_day=datetime.now()
        )

        # Track analytics
        await analytics_engine.track_performance('risk_assessment', 0.3, True)

        return {
            "vehicle_id": assessment.vehicle_id,
            "location": assessment.location,
            "risk_level": assessment.risk_level.value,
            "risk_score": {"low": 0.2, "medium": 0.5, "high": 0.7, "critical": 0.9}[assessment.risk_level.value],
            "risk_factors": assessment.risk_factors,
            "recommended_actions": assessment.recommended_actions,
            "emergency_contacts": assessment.emergency_contacts,
            "assessment_time": datetime.now().isoformat()
        }
    except Exception as e:
        await analytics_engine.track_performance('risk_assessment', 1.0, False)
        raise HTTPException(status_code=500, detail=f"Risk assessment failed: {str(e)}")


@app.post("/ml/behavior-analysis")
async def analyze_behavior(req: BehaviorAnalysisRequest):
    """
    Analyze driver behavior patterns and detect anomalies
    Returns driving style, anomaly detection, and personalized recommendations
    """
    try:
        analysis = await behavioral_analyzer.analyze_driving_pattern(
            vehicle_id=req.vehicle_id,
            recent_events=req.recent_events
        )

        # Track analytics
        await analytics_engine.track_performance('behavior_analysis', 0.4, True)

        return {
            "vehicle_id": analysis['vehicle_id'],
            "driving_style": analysis['driving_style'],
            "anomaly_detected": analysis['anomaly_detected'],
            "anomaly_score": analysis['anomaly_score'],
            "metrics": analysis['metrics'],
            "recommendations": analysis['recommendations'],
            "analysis_time": datetime.now().isoformat()
        }
    except Exception as e:
        await analytics_engine.track_performance('behavior_analysis', 1.0, False)
        raise HTTPException(status_code=500, detail=f"Behavior analysis failed: {str(e)}")


@app.post("/ml/route-optimization")
async def optimize_route(req: RouteOptimizationRequest):
    """
    Optimize route based on multiple factors: time, safety, efficiency
    Returns recommended route with alternatives and savings estimates
    """
    try:
        optimization = await route_optimizer.optimize_route(
            start=(req.start_lat, req.start_lon),
            end=(req.end_lat, req.end_lon),
            preferences=req.preferences
        )

        # Track analytics
        await analytics_engine.track_performance('route_optimization', 0.6, True)

        return {
            "recommended_route": optimization['recommended_route'],
            "alternative_routes": optimization['alternative_routes'],
            "estimated_savings": optimization['estimated_savings'],
            "route_highlights": optimization['route_highlights'],
            "optimization_time": datetime.now().isoformat()
        }
    except Exception as e:
        await analytics_engine.track_performance('route_optimization', 1.0, False)
        raise HTTPException(status_code=500, detail=f"Route optimization failed: {str(e)}")


@app.get("/analytics/dashboard")
async def get_analytics_dashboard(time_window: int = 3600):
    """
    Get comprehensive analytics dashboard data
    Includes real-time metrics, insights, predictions, and alerts
    """
    try:
        dashboard_data = await get_dashboard_data()

        # Track analytics request
        await analytics_engine.track_user_session('system', 'dashboard_accessed', {
            'time_window': time_window
        })

        return dashboard_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard generation failed: {str(e)}")


@app.post("/analytics/track")
async def track_event(event_data: Dict):
    """
    Track custom analytics events
    Useful for client-side analytics tracking
    """
    try:
        event_type = event_data.get('type', 'unknown')

        if event_type == 'message':
            await analytics_engine.track_message(event_data)
        elif event_type == 'user_session':
            await analytics_engine.track_user_session(
                event_data.get('user_id', 'anonymous'),
                event_data.get('event', 'unknown'),
                event_data.get('data', {})
            )
        elif event_type == 'performance':
            await analytics_engine.track_performance(
                event_data.get('operation', 'unknown'),
                event_data.get('duration', 0),
                event_data.get('success', True)
            )

        return {"status": "tracked", "event_type": event_type, "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Event tracking failed: {str(e)}")


# ---------- SYSTEM HEALTH & MONITORING ----------

@app.get("/system/status")
async def get_system_status():
    """
    Get comprehensive system status
    Includes health checks for all services and components
    """
    try:
        # Check intent engine
        intent_status = "healthy"
        try:
            intent_engine.classify("test", "base")
        except:
            intent_status = "unhealthy"

        # Check analytics
        analytics_status = "healthy"
        try:
            await analytics_engine.generate_insights()
        except:
            analytics_status = "degraded"

        # Check ML models
        ml_status = "healthy"
        try:
            await traffic_predictor.predict_traffic((40.7128, -74.0060), 10)
        except:
            ml_status = "degraded"

        # Check blockchain
        blockchain_status = "healthy"
        try:
            blockchain_analytics = await blockchain_manager.get_blockchain_analytics()
        except:
            blockchain_status = "degraded"

        # Check emergency system
        emergency_status = "healthy"
        try:
            emergency_count = len(emergency_coordinator.active_emergencies)
        except:
            emergency_status = "degraded"

        overall_status = "healthy" if all(
            status == "healthy" for status in [intent_status, analytics_status, ml_status, blockchain_status, emergency_status]
        ) else "degraded"

        return {
            "overall_status": overall_status,
            "components": {
                "intent_engine": intent_status,
                "analytics": analytics_status,
                "ml_models": ml_status,
                "blockchain": blockchain_status,
                "emergency_system": emergency_status,
                "database": "healthy"  # Assume healthy for now
            },
            "metrics": {
                "active_emergencies": len(emergency_coordinator.active_emergencies),
                "blockchain_records": len(blockchain_manager.data_cache),
                "active_users": analytics_engine.metrics_collector.gauges.get('active_users', 0)
            },
            "uptime_seconds": (datetime.now() - app.state.start_time).total_seconds() if hasattr(app.state, 'start_time') else 0,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")


# ---------- BLOCKCHAIN ENDPOINTS ----------

@app.post("/blockchain/store")
async def store_blockchain_data(req: BlockchainDataRequest):
    """
    Store data hash on blockchain for immutability and verification
    Returns blockchain transaction and proof of storage
    """
    try:
        category = DataCategory(req.category)

        # Store data on blockchain
        blockchain_data = await secure_data_storage(
            data=req.data,
            category=category,
            device_id=req.device_id,
            metadata=req.metadata
        )

        # Track analytics
        await analytics_engine.track_performance('blockchain_store', 1.0, True)

        return {
            "success": True,
            "data_hash": blockchain_data.data_hash,
            "category": blockchain_data.category.value,
            "timestamp": blockchain_data.timestamp,
            "proof": blockchain_data.proof,
            "transaction_id": f"0x{blockchain_data.data_hash[:32]}",
            "storage_time": datetime.now().isoformat()
        }
    except Exception as e:
        await analytics_engine.track_performance('blockchain_store', 1.0, False)
        raise HTTPException(status_code=500, detail=f"Blockchain storage failed: {str(e)}")


@app.post("/blockchain/verify")
async def verify_blockchain_data(req: BlockchainVerificationRequest):
    """
    Verify data integrity using blockchain records
    Returns verification status and blockchain proof
    """
    try:
        # Verify data integrity
        verification = await verify_data_integrity(req.data_hash, req.original_data)

        # Track analytics
        await analytics_engine.track_performance('blockchain_verify', 0.5, True)

        return {
            "data_hash": req.data_hash,
            "verified": verification["verified"],
            "verification_time": verification.get("verification_time"),
            "blockchain_record": verification.get("blockchain_record"),
            "reason": verification.get("reason"),
            "verified_at": datetime.now().isoformat()
        }
    except Exception as e:
        await analytics_engine.track_performance('blockchain_verify', 1.0, False)
        raise HTTPException(status_code=500, detail=f"Blockchain verification failed: {str(e)}")


@app.get("/blockchain/analytics")
async def get_blockchain_analytics():
    """
    Get blockchain usage analytics and performance metrics
    """
    try:
        analytics = await blockchain_manager.get_blockchain_analytics()

        return {
            "blockchain_analytics": analytics,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blockchain analytics failed: {str(e)}")


# ---------- EMERGENCY RESPONSE ENDPOINTS ----------

@app.post("/emergency/report")
async def report_emergency_event(req: EmergencyReportRequest):
    """
    Report a new emergency event
    Creates emergency record and triggers automated response workflow
    """
    try:
        # Convert emergency type and severity
        emergency_type = EmergencyType(req.type)
        emergency_severity = EmergencySeverity(req.severity)

        # Create emergency data
        emergency_data = {
            "type": req.type,
            "severity": req.severity,
            "location": (req.latitude, req.longitude),
            "description": req.description,
            "device_id": req.device_id,
            "reporter_info": req.reporter_info or {},
            "casualties": req.casualties or {},
            "affected_radius": req.affected_radius,
            "estimated_duration": req.estimated_duration
        }

        # Report emergency
        emergency = await report_emergency(emergency_data)

        # Track analytics
        await analytics_engine.track_message({
            "type": "emergency_reported",
            "emergency_id": emergency.id,
            "emergency_type": req.type,
            "severity": req.severity,
            "location": (req.latitude, req.longitude)
        })

        # Get AI predictions for the emergency
        predictions = emergency_coordinator.ai_predictions.get(emergency.id, {})

        return {
            "emergency_id": emergency.id,
            "type": emergency.type.value,
            "severity": emergency.severity.value,
            "location": emergency.location,
            "description": emergency.description,
            "timestamp": emergency.timestamp.isoformat(),
            "predictions": predictions,
            "auto_dispatch_recommended": emergency.severity in [EmergencySeverity.HIGH, EmergencySeverity.CRITICAL, EmergencySeverity.CATASTROPHIC]
        }
    except Exception as e:
        await analytics_engine.track_performance('emergency_report', 1.0, False)
        raise HTTPException(status_code=500, detail=f"Emergency report failed: {str(e)}")


@app.post("/emergency/dispatch")
async def dispatch_emergency_services(req: EmergencyDispatchRequest):
    """
    Dispatch emergency responders to an emergency event
    Automatically assigns appropriate resources based on emergency type
    """
    try:
        # Dispatch responders
        assignments = await dispatch_emergency_responders(req.emergency_id, req.auto_dispatch)

        # Convert assignments to response format
        assignment_list = []
        for assignment in assignments:
            assignment_list.append({
                "assignment_id": assignment.id,
                "responder_id": assignment.responder_id,
                "responder_type": emergency_coordinator.responders[assignment.responder_id].type.value,
                "responder_name": emergency_coordinator.responders[assignment.responder_id].name,
                "status": assignment.status.value,
                "priority": assignment.priority,
                "estimated_arrival": assignment.estimated_arrival.isoformat(),
                "instructions": assignment.instructions
            })

        # Track analytics
        await analytics_engine.track_performance('emergency_dispatch', 2.0, True)

        return {
            "emergency_id": req.emergency_id,
            "assignments": assignment_list,
            "total_responders": len(assignments),
            "dispatch_time": datetime.now().isoformat(),
            "auto_dispatch": req.auto_dispatch
        }
    except Exception as e:
        await analytics_engine.track_performance('emergency_dispatch', 1.0, False)
        raise HTTPException(status_code=500, detail=f"Emergency dispatch failed: {str(e)}")


@app.get("/emergency/status/{emergency_id}")
async def get_emergency_status(emergency_id: str):
    """
    Get comprehensive status of an emergency event
    Includes responder status, predictions, and impact assessment
    """
    try:
        status = await emergency_coordinator.get_emergency_status(emergency_id)

        # Track analytics access
        await analytics_engine.track_user_session('system', 'emergency_status_checked', {
            'emergency_id': emergency_id
        })

        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Emergency status check failed: {str(e)}")


@app.get("/emergency/active")
async def get_active_emergencies():
    """
    Get list of all currently active emergencies
    """
    try:
        active_emergencies = []
        for emergency_id, emergency in emergency_coordinator.active_emergencies.items():
            active_emergencies.append({
                "emergency_id": emergency.id,
                "type": emergency.type.value,
                "severity": emergency.severity.value,
                "location": emergency.location,
                "description": emergency.description,
                "timestamp": emergency.timestamp.isoformat()
            })

        return {
            "active_emergencies": active_emergencies,
            "total_count": len(active_emergencies),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get active emergencies: {str(e)}")


# Initialize the service on startup
@app.on_event("startup")
async def startup_event():
    """Initialize AI services on startup"""
    app.state.start_time = datetime.now()

    print("🚀 Starting Looma AI + Identity Engine...")

    # Start analytics service
    await start_analytics_service()
    print("📊 Analytics service started")

    # Initialize ML models
    from ml_models import initialize_ml_models
    await initialize_ml_models()
    print("🤖 ML models initialized")

    # Initialize blockchain system
    await initialize_blockchain()
    print("⛓️ Blockchain integration initialized")

    # Initialize emergency coordination system
    await initialize_emergency_system()
    print("🚨 Emergency coordination system initialized")

    print("✅ Looma AI + Identity Engine started successfully")
    print("🚀 All advanced systems ready for V2V communication processing")
    print("📡 Platform now includes:")
    print("   • AI-powered intent classification")
    print("   • Real-time traffic prediction")
    print("   • Driver behavior analysis")
    print("   • Route optimization")
    print("   • Advanced analytics dashboard")
    print("   • Blockchain data verification")
    print("   • Emergency response coordination")
    print("   • Mobile & IoT device integration")