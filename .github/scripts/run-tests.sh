#!/bin/bash

# GitHub Actions Test Runner Script
# Runs tests with proper error handling and minimal output

set -e  # Exit on any error

echo "🧪 Starting test suite..."

# Go back to project root
cd "$(dirname "$0")/../.."

echo "🔧 Running CI environment tests..."
python -m pytest tests/test_ci_environment.py -q --tb=short || {
    echo "❌ CI environment tests failed"
    exit 1
}

echo "📊 Running database connection tests..."
python -m pytest tests/database/test_connection.py -q --tb=short || {
    echo "❌ Database tests failed"
    exit 1
}

echo "🔄 Running data processing tests..."
python -m pytest tests/pipeline/test_data_processing.py -q --tb=short || {
    echo "❌ Data processing tests failed"
    exit 1
}

echo "🚀 Running full pipeline integration test..."
python -m pytest tests/pipeline/test_full_pipeline.py -q --tb=short || {
    echo "❌ Pipeline integration test failed"
    exit 1
}

echo "🎨 Running visualization tests..."
python -m pytest tests/visualization/ -q --tb=short || {
    echo "❌ Visualization tests failed"
    exit 1
}

echo "🏗️ Running project structure tests..."
python -m pytest tests/test_project_structure.py -q --tb=short || {
    echo "❌ Project structure tests failed"
    exit 1
}

echo "✅ All tests passed successfully!"