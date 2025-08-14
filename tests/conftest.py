"""
Pytest configuration and shared fixtures for CADS Research Visualization System tests
"""

import os
import sys
import pytest
import tempfile
import json
from pathlib import Path
from dotenv import load_dotenv

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / "cads"))

# Load environment variables
load_dotenv()

@pytest.fixture(scope="session")
def database_url():
    """Provide database URL from environment"""
    url = os.getenv("DATABASE_URL")
    if not url:
        pytest.skip("DATABASE_URL not configured")
    return url

@pytest.fixture(scope="session")
def sample_data_dir():
    """Provide path to sample test data"""
    return Path(__file__).parent / "fixtures" / "sample_data"

@pytest.fixture
def temp_dir():
    """Provide temporary directory for test outputs"""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)

@pytest.fixture(scope="session")
def sample_embeddings():
    """Provide sample embedding data for testing"""
    # Create a small sample of 384-dimensional embeddings
    import numpy as np
    np.random.seed(42)  # For reproducible tests
    return np.random.rand(10, 384).astype(np.float32)

@pytest.fixture(scope="session")
def sample_works_data():
    """Provide sample works data for testing"""
    return [
        {
            "id": 1,
            "title": "Sample Research Paper 1",
            "researcher_id": 1,
            "publication_year": 2023,
            "embedding": "[0.1, 0.2, 0.3]"  # Simplified for testing
        },
        {
            "id": 2,
            "title": "Sample Research Paper 2", 
            "researcher_id": 2,
            "publication_year": 2022,
            "embedding": "[0.4, 0.5, 0.6]"
        }
    ]

@pytest.fixture(scope="session")
def sample_researchers_data():
    """Provide sample researchers data for testing"""
    return [
        {
            "id": 1,
            "full_name": "Dr. Jane Smith",
            "department": "Computer Science"
        },
        {
            "id": 2,
            "full_name": "Dr. John Doe",
            "department": "Computer Science"
        }
    ]

@pytest.fixture
def mock_data_processor():
    """Provide a mock DataProcessor for testing"""
    class MockDataProcessor:
        def __init__(self):
            self.connected = True
            
        def fetch_research_data(self):
            return {
                "works": sample_works_data(),
                "researchers": sample_researchers_data()
            }
            
        def parse_embeddings(self, embeddings):
            import numpy as np
            # Mock parsing - return simple array
            return np.random.rand(len(embeddings), 384).astype(np.float32)
            
    return MockDataProcessor()

# Test configuration
def pytest_configure(config):
    """Configure pytest with custom markers"""
    config.addinivalue_line(
        "markers", "database: marks tests as requiring database connection"
    )
    config.addinivalue_line(
        "markers", "slow: marks tests as slow running"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "visualization: marks tests as visualization tests"
    )

def pytest_collection_modifyitems(config, items):
    """Automatically mark tests based on their location"""
    for item in items:
        # Mark database tests
        if "database" in str(item.fspath):
            item.add_marker(pytest.mark.database)
        
        # Mark integration tests
        if "integration" in str(item.fspath) or "full_pipeline" in str(item.fspath):
            item.add_marker(pytest.mark.integration)
            item.add_marker(pytest.mark.slow)
            
        # Mark visualization tests
        if "visualization" in str(item.fspath) or "html" in str(item.fspath):
            item.add_marker(pytest.mark.visualization)