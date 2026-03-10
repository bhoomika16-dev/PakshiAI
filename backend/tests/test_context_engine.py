from core.context_engine import ContextEngine

def test_context_engine_migration_boost():
    # Setup
    pred_in_season = {"scientific_name": "Pitta brachyura", "confidence": 0.5, "common_name": "Test", "species_id": 1}
    # Indian Pitta migrates in summer (May-Oct -> 5-10)
    context_in_season = {"date": type('obj', (object,), {'month': 6}), "habitat": "forest"}
    
    results = ContextEngine.adjust_probabilities([pred_in_season], context_in_season)
    
    assert results[0]['adjusted_score'] > 0.5
    assert "current season" in results[0]['context_reasoning']

def test_context_engine_migration_penalty():
    pred_out_season = {"scientific_name": "Pitta brachyura", "confidence": 0.5, "common_name": "Test", "species_id": 1}
    # Winter month (Jan -> 1)
    context_out_season = {"date": type('obj', (object,), {'month': 1}), "habitat": "forest"}
    
    results = ContextEngine.adjust_probabilities([pred_out_season], context_out_season)
    
    assert results[0]['adjusted_score'] < 0.5
    assert "Uncharacteristic" in results[0]['context_reasoning']

def test_context_engine_habitat_boost():
    pred = {"scientific_name": "Pavo cristatus", "confidence": 0.5, "common_name": "Peafowl", "species_id": 1}
    # Peafowl likes forest/agri
    context = {"date": type('obj', (object,), {'month': 1}), "habitat": "forest"}
    
    results = ContextEngine.adjust_probabilities([pred], context)
    
    assert results[0]['adjusted_score'] > 0.5
    assert "habitat preference" in results[0]['context_reasoning']
