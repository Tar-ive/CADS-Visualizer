"""
Database connection tests for CADS Research Visualization System
"""

import pytest
import psycopg2
import pandas as pd
from unittest.mock import patch, MagicMock

from tests.fixtures.test_helpers import mock_database_connection, assert_dataframe_structure


class TestDatabaseConnection:
    """Test database connectivity and basic operations"""
    
    @pytest.mark.database
    def test_database_connection_success(self, database_url):
        """Test successful database connection"""
        try:
            conn = psycopg2.connect(database_url)
            assert conn is not None
            assert not conn.closed
            conn.close()
        except psycopg2.OperationalError:
            pytest.skip("Database not available for testing")
    
    @pytest.mark.database
    def test_database_connection_failure(self):
        """Test handling of database connection failure"""
        invalid_url = "postgresql://invalid:invalid@localhost:5432/invalid"
        
        with pytest.raises(psycopg2.OperationalError):
            psycopg2.connect(invalid_url)
    
    @pytest.mark.database
    def test_fetch_works_table(self, database_url):
        """Test fetching data from cads_works table"""
        try:
            conn = psycopg2.connect(database_url)
            
            query = "SELECT id, title, researcher_id FROM cads_works LIMIT 5"
            df = pd.read_sql(query, conn)
            
            assert_dataframe_structure(df, ["id", "title", "researcher_id"], min_rows=0)
            
            conn.close()
        except psycopg2.OperationalError:
            pytest.skip("Database not available for testing")
    
    @pytest.mark.database
    def test_fetch_researchers_table(self, database_url):
        """Test fetching data from cads_researchers table"""
        try:
            conn = psycopg2.connect(database_url)
            
            query = "SELECT id, full_name, department FROM cads_researchers LIMIT 5"
            df = pd.read_sql(query, conn)
            
            assert_dataframe_structure(df, ["id", "full_name", "department"], min_rows=0)
            
            conn.close()
        except psycopg2.OperationalError:
            pytest.skip("Database not available for testing")
    
    @pytest.mark.database
    def test_table_counts(self, database_url):
        """Test getting record counts from tables"""
        try:
            conn = psycopg2.connect(database_url)
            cursor = conn.cursor()
            
            # Test works count
            cursor.execute("SELECT COUNT(*) FROM cads_works")
            works_count = cursor.fetchone()[0]
            assert isinstance(works_count, int)
            assert works_count >= 0
            
            # Test researchers count
            cursor.execute("SELECT COUNT(*) FROM cads_researchers")
            researchers_count = cursor.fetchone()[0]
            assert isinstance(researchers_count, int)
            assert researchers_count >= 0
            
            cursor.close()
            conn.close()
        except psycopg2.OperationalError:
            pytest.skip("Database not available for testing")
    
    def test_mock_database_connection(self):
        """Test mock database connection for unit tests"""
        mock_conn = mock_database_connection()
        
        assert mock_conn is not None
        assert not mock_conn.closed
        
        cursor = mock_conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM test_table")
        result = cursor.fetchone()
        
        assert result == (100,)
        
        cursor.close()
        mock_conn.close()
        assert mock_conn.closed


class TestEmbeddingsFormat:
    """Test pgvector embeddings format parsing"""
    
    @pytest.mark.database
    def test_embeddings_parsing(self, database_url):
        """Test parsing of pgvector embeddings format"""
        try:
            conn = psycopg2.connect(database_url)
            
            query = "SELECT id, title, embedding FROM cads_works WHERE embedding IS NOT NULL LIMIT 3"
            df = pd.read_sql(query, conn)
            
            for _, record in df.iterrows():
                if record['embedding']:
                    embedding_str = str(record['embedding'])
                    
                    # Test that embedding is in expected format
                    assert embedding_str.startswith('[') or embedding_str.startswith('(')
                    assert embedding_str.endswith(']') or embedding_str.endswith(')')
                    
                    # Test parsing
                    if embedding_str.startswith('[') and embedding_str.endswith(']'):
                        values = embedding_str.strip('[]').split(',')
                        assert len(values) > 0
                        
                        # Test that values can be converted to float
                        float_values = [float(v.strip()) for v in values[:5]]  # Test first 5
                        assert all(isinstance(v, float) for v in float_values)
            
            conn.close()
        except psycopg2.OperationalError:
            pytest.skip("Database not available for testing")
    
    def test_mock_embeddings_format(self):
        """Test embeddings format with mock data"""
        # Test different embedding formats
        test_embeddings = [
            "[0.1, 0.2, 0.3, 0.4, 0.5]",
            "(0.1, 0.2, 0.3, 0.4, 0.5)",
            "0.1,0.2,0.3,0.4,0.5"
        ]
        
        for embedding_str in test_embeddings:
            if embedding_str.startswith('[') and embedding_str.endswith(']'):
                values = embedding_str.strip('[]').split(',')
                float_values = [float(v.strip()) for v in values]
                assert len(float_values) == 5
                assert all(isinstance(v, float) for v in float_values)


class TestDatabaseIntegrity:
    """Test database data integrity"""
    
    @pytest.mark.database
    def test_foreign_key_relationships(self, database_url):
        """Test that foreign key relationships are maintained"""
        try:
            conn = psycopg2.connect(database_url)
            
            # Test that all works have valid researcher_ids
            query = """
            SELECT COUNT(*) FROM cads_works w 
            LEFT JOIN cads_researchers r ON w.researcher_id = r.id 
            WHERE r.id IS NULL
            """
            
            df = pd.read_sql(query, conn)
            orphaned_works = df.iloc[0, 0]
            
            # Should have no orphaned works
            assert orphaned_works == 0, f"Found {orphaned_works} works without valid researchers"
            
            conn.close()
        except psycopg2.OperationalError:
            pytest.skip("Database not available for testing")
    
    @pytest.mark.database
    def test_data_completeness(self, database_url):
        """Test that required fields are not null"""
        try:
            conn = psycopg2.connect(database_url)
            
            # Test works table completeness
            query = """
            SELECT 
                COUNT(*) as total,
                COUNT(title) as has_title,
                COUNT(researcher_id) as has_researcher_id
            FROM cads_works
            """
            
            df = pd.read_sql(query, conn)
            row = df.iloc[0]
            
            assert row['total'] == row['has_title'], "Some works missing titles"
            assert row['total'] == row['has_researcher_id'], "Some works missing researcher_id"
            
            conn.close()
        except psycopg2.OperationalError:
            pytest.skip("Database not available for testing")