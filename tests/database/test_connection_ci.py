"""CI-friendly database connection tests"""

import pytest
import psycopg2
import os


class TestDatabaseConnectionCI:
    """Basic database connection tests for CI environment"""
    
    def test_database_connection_available(self):
        """Test that database connection is available in CI"""
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            pytest.skip("DATABASE_URL not set - this test only runs in CI environment")
        
        try:
            conn = psycopg2.connect(database_url)
            assert conn is not None
            assert not conn.closed
            
            # Test basic query
            cursor = conn.cursor()
            cursor.execute("SELECT 1 as test_value")
            result = cursor.fetchone()
            assert result[0] == 1
            
            cursor.close()
            conn.close()
            
        except psycopg2.OperationalError as e:
            pytest.fail(f"Database connection failed: {e}")
    
    def test_database_can_create_table(self):
        """Test that we can create and drop a test table"""
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            pytest.skip("DATABASE_URL not set")
        
        try:
            conn = psycopg2.connect(database_url)
            cursor = conn.cursor()
            
            # Create test table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS test_ci_table (
                    id SERIAL PRIMARY KEY,
                    test_data VARCHAR(100)
                )
            """)
            
            # Insert test data
            cursor.execute(
                "INSERT INTO test_ci_table (test_data) VALUES (%s)",
                ("CI test data",)
            )
            
            # Query test data
            cursor.execute("SELECT test_data FROM test_ci_table WHERE test_data = %s", ("CI test data",))
            result = cursor.fetchone()
            assert result[0] == "CI test data"
            
            # Clean up
            cursor.execute("DROP TABLE test_ci_table")
            
            conn.commit()
            cursor.close()
            conn.close()
            
        except psycopg2.Error as e:
            pytest.fail(f"Database operation failed: {e}")
    
    def test_database_environment_variables(self):
        """Test that required database environment variables are set"""
        # Only run in CI
        if not (os.getenv("CI") == "true" or os.getenv("GITHUB_ACTIONS") == "true"):
            pytest.skip("This test only runs in CI environment")
        
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            pytest.skip("DATABASE_URL not set - this test only runs in CI environment")
            
        assert "postgresql://" in database_url, "DATABASE_URL should be PostgreSQL"
        assert "test_db" in database_url, "Should be using test database"