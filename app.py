import os
import json
import logging
from flask import Flask, render_template, request, jsonify

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "ecobeach-guriri-2025-secret-key")

# Google Maps API Key
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "AIzaSyCYoi-eoTqK0PC5qSEDoEju4WDqVFCxKu4")

# Helper function to load JSON data
def load_json_data(filename):
    try:
        with open(f'data/{filename}', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        logging.error(f"Data file {filename} not found")
        return []

@app.route('/')
def index():
    """Página inicial do EcoBeach"""
    return render_template('index.html')

@app.route('/historia')
def historia():
    """História de Guriri e São Mateus"""
    return render_template('historia.html')

@app.route('/biodiversidade')
def biodiversidade():
    """Biodiversidade local com quiz interativo"""
    especies_data = load_json_data('biodiversidade.json')
    return render_template('biodiversidade.html', especies=especies_data)

@app.route('/cultura')
def cultura():
    """Culinária e cultura caiçara"""
    return render_template('cultura.html')

@app.route('/mapa')
def mapa():
    """Mapa interativo com pontos de interesse"""
    pontos_data = load_json_data('pontos_turisticos.json')
    return render_template('mapa.html', pontos=pontos_data, google_maps_key=GOOGLE_MAPS_API_KEY)

@app.route('/emergencia')
def emergencia():
    """Central de denúncia e emergência"""
    return render_template('emergencia.html')

@app.route('/educativo')
def educativo():
    """Área educativa com materiais didáticos"""
    return render_template('educativo.html')

@app.route('/preserve')
def preserve():
    """Dicas de preservação e sustentabilidade"""
    return render_template('preserve.html')

@app.route('/api/quiz-score', methods=['POST'])
def quiz_score():
    """API para processar resultados do quiz"""
    try:
        data = request.get_json()
        score = data.get('score', 0)
        total = data.get('total', 0)
        
        # Calcular porcentagem
        percentage = (score / total * 100) if total > 0 else 0
        
        # Determinar mensagem baseada na pontuação
        if percentage >= 80:
            message = "Excelente! Você tem um ótimo conhecimento sobre a biodiversidade de Guriri!"
        elif percentage >= 60:
            message = "Muito bom! Continue aprendendo sobre nossa rica biodiversidade marinha."
        elif percentage >= 40:
            message = "Bom começo! Explore mais nossa área educativa para aprender mais."
        else:
            message = "Continue explorando! A natureza de Guriri tem muito a ensinar."
        
        return jsonify({
            'success': True,
            'score': score,
            'total': total,
            'percentage': round(percentage, 1),
            'message': message
        })
    except Exception as e:
        logging.error(f"Error processing quiz score: {e}")
        return jsonify({'success': False, 'error': 'Erro ao processar resultado'}), 500

@app.route('/tamar')
def tamar():
    """Página sobre o Centro Tamar em São Mateus"""
    return render_template('tamar.html', title="Centro Tamar", api_key=GOOGLE_MAPS_API_KEY)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
