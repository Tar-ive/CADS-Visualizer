#!/bin/bash

# GitHub Actions Test Runner Script
# Runs tests with proper error handling and minimal output

set -e  # Exit on any error

echo "🧪 Starting test suite..."

# Change to cads directory
cd cads

echo "📊 Running database connection tests..."
python -m pytest tests/test_connection.py -q --tb=short || {
    echo "❌ Database tests failed"
    exit 1
}

echo "🔄 Running data processing tests..."
python -m pytest tests/test_data_processing.py -q --tb=short || {
    echo "❌ Data processing tests failed"
    exit 1
}

echo "🚀 Running full pipeline integration test..."
python -m pytest tests/test_full_pipeline.py -q --tb=short || {
    echo "❌ Pipeline integration test failed"
    exit 1
}

echo "🎨 Running visualization tests..."
cd ../visuals
python -m pytest tests/test_html_structure.py -q --tb=short || {
    echo "❌ Visualization tests failed"
    exit 1
}

echo "✅ All tests passed successfully!"