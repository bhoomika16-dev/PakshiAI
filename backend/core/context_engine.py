from datetime import datetime

class ContextEngine:
    MIGRATION_CALENDAR = {
      "Pitta brachyura": {"months": [5, 6, 7, 8, 9, 10], "type": "Summer Visitor"}, # Indian Pitta
      "Anser indicus": {"months": [11, 12, 1, 2], "type": "Winter Visitor"}, # Bar-headed Goose
      # Add more realistic data
    }

    HABITAT_PREFERENCES = {
        "Pavo cristatus": ["forest", "scrub", "agricultural"],
        "Corvus splendens": ["urban", "agricultural"],
        "Ardea alba": ["wetland", "coastal"],
    }
    
    @staticmethod
    def adjust_probabilities(predictions, context_data):
        """
        Adjusts raw model probabilities based on location, season, and habitat.
        :param predictions: List of dicts {species_id, common_name, scientific_name, confidence}
        :param context_data: Dict {latitude, longitude, date, habitat}
        :return: Adjusted predictions list with reasoning
        """
        current_month = context_data.get('date', datetime.now()).month
        habitat = context_data.get('habitat', '').lower()
        
        adjusted_predictions = []
        
        for pred in predictions:
            sci_name = pred['scientific_name']
            orig_score = pred['confidence']
            new_score = orig_score
            reasoning = []
            
            # 1. Season Check
            if sci_name in ContextEngine.MIGRATION_CALENDAR:
                mig_data = ContextEngine.MIGRATION_CALENDAR[sci_name]
                if current_month in mig_data['months']:
                    new_score *= 1.2 # Boost
                    reasoning.append(f"Highly likely in current season ({mig_data['type']}).")
                else:
                    new_score *= 0.3 # Penalize heavily if out of season
                    reasoning.append(f"Uncharacteristic for current season.")

            # 2. Habitat Check
            if habitat and sci_name in ContextEngine.HABITAT_PREFERENCES:
                if habitat in ContextEngine.HABITAT_PREFERENCES[sci_name]:
                    new_score *= 1.15
                    reasoning.append(f"Matching habitat preference ({habitat}).")
                else:
                    new_score *= 0.6
                    reasoning.append(f"Uncommon in {habitat} habitat.")
            
            # simple clipping
            new_score = min(0.99, max(0.01, new_score))
            
            pred['adjusted_score'] = new_score
            pred['context_reasoning'] = "; ".join(reasoning) if reasoning else "No significant contextual factors."
            adjusted_predictions.append(pred)
            
        return sorted(adjusted_predictions, key=lambda x: x['adjusted_score'], reverse=True)
