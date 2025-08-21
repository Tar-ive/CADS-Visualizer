# Implementation Plan

- [x] 1. Fix critical DataFrame schema mismatch causing test failure
  - Update empty DataFrame mock in test_handle_empty_pipeline_input to include all required columns ('citations', 'abstract', 'publication_year', 'embedding')
  - Modify DataProcessor.validate_data method to handle missing columns gracefully with try/catch blocks
  - Fix the test to use proper DataFrame schema that matches production data structure
  - _Requirements: 6.1, 6.3, 10.1_

- [x] 2. Resolve pandas SQLAlchemy deprecation warnings in database tests
  - Replace direct psycopg2 connections with SQLAlchemy engine connections in all database test files
  - Update all pd.read_sql calls to use SQLAlchemy connectable objects instead of raw DBAPI connections
  - Create database connection utility that returns proper SQLAlchemy engine for consistent testing
  - _Requirements: 2.2, 7.1_