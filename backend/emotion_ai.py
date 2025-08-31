class EmotionAI:
    def analyze_text_sentiment(self, text):
        positive_words = ['happy', 'good', 'great', 'excellent', 'wonderful']
        negative_words = ['sad', 'bad', 'terrible', 'awful', 'depressed']
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            sentiment = 'positive'
            confidence = 0.8
        elif negative_count > positive_count:
            sentiment = 'negative'
            confidence = 0.7
        else:
            sentiment = 'neutral'
            confidence = 0.6
        
        return {
            'sentiment': sentiment,
            'confidence': confidence,
            'stress_level': 3 if sentiment == 'negative' else 1,
            'recommendations': ['Practice deep breathing', 'Consider meditation']
        }
    
    def analyze_voice_features(self):
        return {
            'emotion': 'neutral',
            'confidence': 0.75,
            'stress_level': 2,
            'recommendations': ['Take a break', 'Practice relaxation']
        }
    
    def analyze_face_image(self, image_data):
        return {
            'emotion': 'neutral',
            'confidence': 0.75,
            'stress_indicators': ['slight tension'],
            'recommendations': ['Take a short break']
        }

emotion_ai = EmotionAI()