from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import json
import random

app = FastAPI(title="Healthcare AI API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class SymptomInput(BaseModel):
    symptoms: List[str]
    age: Optional[int] = None
    gender: Optional[str] = None

class DiseaseResult(BaseModel):
    disease: str
    probability: float
    description: str
    recommendations: List[str]

class ChatMessage(BaseModel):
    message: str
    context: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    suggestions: List[str]

class VitalSigns(BaseModel):
    heart_rate: Optional[int] = None
    blood_pressure: Optional[str] = None
    temperature: Optional[float] = None
    oxygen_saturation: Optional[int] = None

class HealthRecommendation(BaseModel):
    category: str
    title: str
    description: str
    priority: str

# Mock data for demonstration
DISEASES_DB = {
    "fever": [
        {"disease": "Common Cold", "probability": 0.7, "description": "Viral infection of the upper respiratory tract"},
        {"disease": "Influenza", "probability": 0.6, "description": "Viral infection affecting the respiratory system"},
        {"disease": "COVID-19", "probability": 0.4, "description": "Coronavirus disease affecting respiratory system"}
    ],
    "headache": [
        {"disease": "Tension Headache", "probability": 0.8, "description": "Most common type of headache"},
        {"disease": "Migraine", "probability": 0.5, "description": "Severe headache with additional symptoms"},
        {"disease": "Cluster Headache", "probability": 0.2, "description": "Severe headache occurring in clusters"}
    ],
    "cough": [
        {"disease": "Bronchitis", "probability": 0.6, "description": "Inflammation of the bronchial tubes"},
        {"disease": "Pneumonia", "probability": 0.4, "description": "Infection of the lungs"},
        {"disease": "Asthma", "probability": 0.5, "description": "Chronic respiratory condition"}
    ]
}

@app.get("/")
async def root():
    return {"message": "Healthcare AI API is running"}

@app.post("/api/symptom-checker", response_model=List[DiseaseResult])
async def check_symptoms(symptom_input: SymptomInput):
    """Symptom checker endpoint - analyzes symptoms and returns possible diseases"""
    try:
        results = []
        
        for symptom in symptom_input.symptoms:
            symptom_lower = symptom.lower()
            if symptom_lower in DISEASES_DB:
                for disease_info in DISEASES_DB[symptom_lower]:
                    # Adjust probability based on age and gender (mock logic)
                    probability = disease_info["probability"]
                    if symptom_input.age and symptom_input.age > 60:
                        probability *= 1.2
                    
                    result = DiseaseResult(
                        disease=disease_info["disease"],
                        probability=min(probability, 1.0),
                        description=disease_info["description"],
                        recommendations=[
                            "Consult with a healthcare professional",
                            "Monitor symptoms closely",
                            "Rest and stay hydrated"
                        ]
                    )
                    results.append(result)
        
        # Sort by probability
        results.sort(key=lambda x: x.probability, reverse=True)
        return results[:5]  # Return top 5 results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=ChatResponse)
async def medical_chat(message: ChatMessage):
    """Medical chatbot endpoint"""
    try:
        # Mock AI response - in production, this would use a proper AI model
        responses = [
            "Based on your symptoms, I recommend consulting with a healthcare professional for proper diagnosis.",
            "It's important to monitor your symptoms and seek medical attention if they worsen.",
            "Here are some general health tips that might help with your condition.",
            "I understand your concern. Let me provide some information about your symptoms."
        ]
        
        suggestions = [
            "Tell me more about your symptoms",
            "When did these symptoms start?",
            "Have you taken any medication?",
            "Do you have any allergies?"
        ]
        
        return ChatResponse(
            response=random.choice(responses),
            suggestions=suggestions
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-image")
async def analyze_medical_image(file: UploadFile = File(...)):
    """Medical image analysis endpoint"""
    try:
        # Mock analysis - in production, this would use computer vision models
        analysis_results = [
            {"finding": "Normal chest X-ray", "confidence": 0.85},
            {"finding": "Possible pneumonia", "confidence": 0.65},
            {"finding": "Fracture detected", "confidence": 0.92}
        ]
        
        return {
            "filename": file.filename,
            "analysis": random.choice(analysis_results),
            "recommendations": [
                "Further examination recommended",
                "Consult with radiologist",
                "Follow-up in 2 weeks"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/vitals-analysis")
async def analyze_vitals(vitals: VitalSigns):
    """Analyze vital signs and provide health insights"""
    try:
        insights = []
        
        if vitals.heart_rate:
            if vitals.heart_rate > 100:
                insights.append("Heart rate is elevated - consider rest and hydration")
            elif vitals.heart_rate < 60:
                insights.append("Heart rate is low - monitor closely")
            else:
                insights.append("Heart rate is within normal range")
        
        if vitals.temperature:
            if vitals.temperature > 38.0:
                insights.append("Fever detected - consider medical consultation")
            else:
                insights.append("Temperature is normal")
        
        return {
            "vitals": vitals.dict(),
            "insights": insights,
            "overall_status": "Monitor" if len(insights) > 1 else "Normal"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health-recommendations", response_model=List[HealthRecommendation])
async def get_health_recommendations():
    """Get personalized health recommendations"""
    try:
        recommendations = [
            HealthRecommendation(
                category="Exercise",
                title="Daily Walking",
                description="Aim for 30 minutes of brisk walking daily",
                priority="High"
            ),
            HealthRecommendation(
                category="Nutrition",
                title="Balanced Diet",
                description="Include fruits, vegetables, and whole grains",
                priority="High"
            ),
            HealthRecommendation(
                category="Sleep",
                title="Sleep Hygiene",
                description="Maintain 7-9 hours of quality sleep",
                priority="Medium"
            ),
            HealthRecommendation(
                category="Preventive Care",
                title="Regular Checkups",
                description="Schedule annual health screenings",
                priority="Medium"
            )
        ]
        
        return recommendations
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)