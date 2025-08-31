class HealthcareAI:
    def predict_treatment(self, patient_data):
        return {
            'treatment': 'lifestyle modification',
            'confidence': 0.85,
            'explanation': 'Based on patient profile, lifestyle changes recommended'
        }
    
    def predict_risk(self, patient_data):
        return {
            'risk_level': 'Low',
            'risk_score': 0.15,
            'risk_factors': ['Monitor blood pressure', 'Maintain healthy weight']
        }
    
    def get_diet_recommendations(self, patient_data):
        return [
            'Include more fruits and vegetables',
            'Reduce processed foods',
            'Stay hydrated'
        ]
    
    def get_exercise_recommendations(self, patient_data):
        return [
            '30 minutes daily walking',
            'Strength training 2x per week',
            'Flexibility exercises'
        ]

healthcare_ai = HealthcareAI()