from flask import Flask, request, jsonify
from main_new_1 import StartupKPIAgent

app = Flask(__name__)

# Initialize the KPI Agent
agent = StartupKPIAgent()

@app.route('/generate-insights', methods=['POST'])
def generate_insights():
    try:
        print("Received request to generate insights")
        data = request.get_json()
        company_data = data.get('company_data', {})
        kpi_data = data.get('kpi_data', {})

        # Validate input
        if not company_data or not kpi_data:
            return jsonify({'error': 'Missing company_data or kpi_data in request'}), 400

        # Generate insights using the AI agent
        insights = agent.generate_startup_insights(company_data, kpi_data)
        insights = agent.render_insights_with_hyperlinks(insights)
        agent.save_insights(company_data.get('name', 'company'), insights)
        return jsonify(insights), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Run the Flask app on port 5001