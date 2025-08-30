import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import json

class PersonalizedHealthcareAI:
    def __init__(self):
        self.treatment_model = None
        self.risk_model = None
        self.drug_interaction_model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.patient_profiles = []
        self.treatment_outcomes = []
        
    def create_sample_data(self):
        """Create sample training data for ML models"""
        # Sample patient data
        patients = []
        treatments = []
        outcomes = []
        
        # Generate synthetic data
        for i in range(1000):
            age = np.random.randint(18, 80)
            gender = np.random.choice(['male', 'female'])
            bmi = np.random.normal(25, 5)
            bp_systolic = np.random.normal(120, 20)
            glucose = np.random.normal(100, 30)
            
            # Medical conditions
            diabetes = 1 if glucose > 126 else 0
            hypertension = 1 if bp_systolic > 140 else 0
            heart_disease = 1 if (age > 50 and (diabetes or hypertension)) else 0
            
            patient = {
                'age': age,
                'gender': gender,
                'bmi': bmi,
                'bp_systolic': bp_systolic,
                'glucose': glucose,
                'diabetes': diabetes,
                'hypertension': hypertension,
                'heart_disease': heart_disease,
                'smoking': np.random.choice([0, 1]),
                'alcohol': np.random.choice([0, 1])
            }
            
            # Treatment recommendations based on conditions
            if diabetes:
                treatment = 'metformin' if age < 65 else 'insulin'
                outcome = np.random.choice([0, 1], p=[0.2, 0.8])  # 80% success
            elif hypertension:
                treatment = 'lisinopril' if not heart_disease else 'amlodipine'
                outcome = np.random.choice([0, 1], p=[0.3, 0.7])  # 70% success
            else:
                treatment = 'lifestyle_only'
                outcome = np.random.choice([0, 1], p=[0.4, 0.6])  # 60% success
            
            patients.append(patient)
            treatments.append(treatment)
            outcomes.append(outcome)
        
        return pd.DataFrame(patients), treatments, outcomes
    
    def train_models(self):
        """Train ML models for personalized recommendations"""
        # Create sample data
        df, treatments, outcomes = self.create_sample_data()
        
        # Encode categorical variables
        le_gender = LabelEncoder()
        df['gender_encoded'] = le_gender.fit_transform(df['gender'])
        self.label_encoders['gender'] = le_gender
        
        le_treatment = LabelEncoder()
        treatment_encoded = le_treatment.fit_transform(treatments)
        self.label_encoders['treatment'] = le_treatment
        
        # Prepare features
        feature_cols = ['age', 'gender_encoded', 'bmi', 'bp_systolic', 'glucose', 
                       'diabetes', 'hypertension', 'heart_disease', 'smoking', 'alcohol']
        X = df[feature_cols]
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train treatment recommendation model
        self.treatment_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.treatment_model.fit(X_scaled, treatment_encoded)
        
        # Train risk prediction model
        # Create risk labels (high risk if multiple conditions)
        risk_labels = (df['diabetes'] + df['hypertension'] + df['heart_disease'] >= 2).astype(int)
        self.risk_model = XGBClassifier(random_state=42)
        self.risk_model.fit(X_scaled, risk_labels)
        
        # Save models
        joblib.dump(self.treatment_model, 'treatment_model.pkl')
        joblib.dump(self.risk_model, 'risk_model.pkl')
        joblib.dump(self.scaler, 'scaler.pkl')
        
        print("Models trained and saved successfully!")
    
    def load_models(self):
        """Load pre-trained models"""
        try:
            self.treatment_model = joblib.load('treatment_model.pkl')
            self.risk_model = joblib.load('risk_model.pkl')
            self.scaler = joblib.load('scaler.pkl')
            return True
        except:
            return False
    
    def predict_treatment(self, patient_data):
        """Predict best treatment for patient"""
        if not self.treatment_model:
            if not self.load_models():
                self.train_models()
        
        # Prepare patient data
        features = [
            patient_data.get('age', 30),
            1 if patient_data.get('gender') == 'male' else 0,
            patient_data.get('bmi', 25),
            patient_data.get('bp_systolic', 120),
            patient_data.get('glucose', 100),
            1 if patient_data.get('diabetes', False) else 0,
            1 if patient_data.get('hypertension', False) else 0,
            1 if patient_data.get('heart_disease', False) else 0,
            1 if patient_data.get('smoking', False) else 0,
            1 if patient_data.get('alcohol', False) else 0
        ]
        
        features_scaled = self.scaler.transform([features])
        prediction = self.treatment_model.predict(features_scaled)[0]
        confidence = np.max(self.treatment_model.predict_proba(features_scaled))
        
        treatment_name = self.label_encoders['treatment'].inverse_transform([prediction])[0]
        
        return {
            'treatment': treatment_name,
            'confidence': float(confidence),
            'explanation': self.get_treatment_explanation(patient_data, treatment_name)
        }
    
    def predict_risk(self, patient_data):
        """Predict disease risk for patient"""
        if not self.risk_model:
            if not self.load_models():
                self.train_models()
        
        features = [
            patient_data.get('age', 30),
            1 if patient_data.get('gender') == 'male' else 0,
            patient_data.get('bmi', 25),
            patient_data.get('bp_systolic', 120),
            patient_data.get('glucose', 100),
            1 if patient_data.get('diabetes', False) else 0,
            1 if patient_data.get('hypertension', False) else 0,
            1 if patient_data.get('heart_disease', False) else 0,
            1 if patient_data.get('smoking', False) else 0,
            1 if patient_data.get('alcohol', False) else 0
        ]
        
        features_scaled = self.scaler.transform([features])
        risk_prob = self.risk_model.predict_proba(features_scaled)[0][1]
        
        return {
            'risk_score': float(risk_prob),
            'risk_level': 'High' if risk_prob > 0.7 else 'Medium' if risk_prob > 0.4 else 'Low',
            'risk_factors': self.identify_risk_factors(patient_data)
        }
    
    def get_treatment_explanation(self, patient_data, treatment):
        """Provide explanation for treatment recommendation"""
        explanations = {
            'metformin': f"Recommended for diabetes management in patients under 65. Your glucose level ({patient_data.get('glucose', 100)}) indicates diabetes risk.",
            'insulin': f"Recommended for older diabetic patients or severe cases. Age {patient_data.get('age', 30)} with diabetes requires insulin therapy.",
            'lisinopril': f"ACE inhibitor for hypertension. Your BP ({patient_data.get('bp_systolic', 120)}) indicates hypertension without heart complications.",
            'amlodipine': f"Calcium channel blocker for hypertension with heart disease. Safer for cardiac patients.",
            'lifestyle_only': "No medication needed. Focus on diet, exercise, and lifestyle modifications."
        }
        return explanations.get(treatment, "Treatment based on your medical profile.")
    
    def identify_risk_factors(self, patient_data):
        """Identify key risk factors for patient"""
        factors = []
        
        if patient_data.get('age', 30) > 50:
            factors.append("Age over 50 increases cardiovascular risk")
        if patient_data.get('smoking', False):
            factors.append("Smoking significantly increases disease risk")
        if patient_data.get('bmi', 25) > 30:
            factors.append("Obesity (BMI > 30) increases multiple disease risks")
        if patient_data.get('bp_systolic', 120) > 140:
            factors.append("High blood pressure increases heart disease risk")
        if patient_data.get('glucose', 100) > 126:
            factors.append("High glucose levels indicate diabetes risk")
        
        return factors
    
    def get_diet_recommendations(self, patient_data):
        """Get personalized diet recommendations"""
        recommendations = []
        
        if patient_data.get('diabetes', False):
            recommendations.extend([
                "Low glycemic index foods (whole grains, vegetables)",
                "Limit refined sugars and processed foods",
                "Regular meal timing to control blood sugar"
            ])
        
        if patient_data.get('hypertension', False):
            recommendations.extend([
                "DASH diet - low sodium, high potassium",
                "Limit processed foods and restaurant meals",
                "Increase fruits and vegetables"
            ])
        
        if patient_data.get('bmi', 25) > 30:
            recommendations.extend([
                "Calorie-controlled diet for weight loss",
                "Portion control and mindful eating",
                "Increase protein and fiber intake"
            ])
        
        return recommendations
    
    def get_exercise_recommendations(self, patient_data):
        """Get personalized exercise recommendations"""
        age = patient_data.get('age', 30)
        conditions = []
        
        if patient_data.get('heart_disease', False):
            conditions.append('heart_disease')
        if patient_data.get('diabetes', False):
            conditions.append('diabetes')
        
        if age > 65 or 'heart_disease' in conditions:
            return [
                "Low-impact exercises: walking, swimming",
                "30 minutes daily, moderate intensity",
                "Strength training 2x per week with light weights"
            ]
        elif 'diabetes' in conditions:
            return [
                "Aerobic exercise 150 minutes per week",
                "Resistance training 2-3 times per week",
                "Monitor blood sugar before/after exercise"
            ]
        else:
            return [
                "Mix of cardio and strength training",
                "150 minutes moderate or 75 minutes vigorous weekly",
                "Include flexibility and balance exercises"
            ]

# Global instance
healthcare_ai = PersonalizedHealthcareAI()