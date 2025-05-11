from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from sklearn.tree import DecisionTreeRegressor
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load and process data
def load_data():
    try:
        # Get the absolute path to the data directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(current_dir, 'data', 'dump.csv')
        
        print(f"Loading data from: {data_path}")  # Debug log
        
        if not os.path.exists(data_path):
            print(f"Error: File not found at {data_path}")
            return None
            
        df = pd.read_csv(data_path)
        print(f"Data loaded successfully. Shape: {df.shape}")  # Debug log
        
        # Rename columns for consistency
        df = df.rename(columns={
            'index_name': 'company',
            'index_date': 'date',
            'open_index_value': 'open',
            'high_index_value': 'high',
            'low_index_value': 'low',
            'closing_index_value': 'close'
        })
        return df
    except Exception as e:
        print(f"Error loading data: {str(e)}")
        return None

# Initialize data
df = load_data()

@app.route('/api/companies', methods=['GET'])
def get_companies():
    if df is not None:
        companies = df['company'].unique().tolist()
        print(f"Found {len(companies)} companies")  # Debug log
        return jsonify(companies)
    return jsonify([]), 500

@app.route('/api/stock-data/<company>', methods=['GET'])
def get_stock_data(company):
    if df is not None:
        company_data = df[df['company'] == company].sort_values('date')
        if not company_data.empty:
            print(f"Found {len(company_data)} records for {company}")  # Debug log
            return jsonify(company_data.to_dict('records'))
        print(f"No data found for company: {company}")  # Debug log
    return jsonify([]), 404

@app.route('/api/predict/<company>', methods=['POST'])
def predict_price(company):
    if df is not None:
        company_data = df[df['company'] == company].sort_values('date')
        if not company_data.empty:
            try:
                # Prepare features for prediction
                features = ['open', 'high', 'low', 'close', 'volume']
                X = company_data[features].values
                y = company_data['close'].values

                # Train model
                model = DecisionTreeRegressor(max_depth=5, min_samples_split=5)
                model.fit(X, y)

                # Predict next day using the last available data point
                last_data = X[-1].reshape(1, -1)
                prediction = model.predict(last_data)[0]

                return jsonify({
                    'prediction': float(prediction),
                    'last_price': float(company_data['close'].iloc[-1])
                })
            except Exception as e:
                print(f"Error in prediction for {company}: {str(e)}")  # Debug log
                return jsonify({'error': str(e)}), 500
        print(f"No data found for company: {company}")  # Debug log
    return jsonify({'error': 'Company not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000) 