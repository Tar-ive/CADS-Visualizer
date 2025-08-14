# Technology Stack & Build System

## Core Technologies

### Backend (Python)
- **Python 3.8+** - Core language for data processing pipeline
- **pandas/numpy** - Data manipulation and numerical computing
- **scikit-learn** - Machine learning utilities
- **sentence-transformers** - Semantic embedding generation (all-MiniLM-L6-v2)
- **UMAP** - Dimensionality reduction for visualization
- **HDBSCAN** - Density-based clustering algorithm
- **SQLAlchemy/psycopg2** - Database ORM and PostgreSQL connectivity

### Frontend (JavaScript)
- **Vanilla JavaScript** - No framework dependencies, pure JS
- **Deck.gl** - WebGL-powered data visualization framework
- **CSS3** - Modern styling with custom properties
- **HTML5** - Semantic markup structure

### Database
- **PostgreSQL** - Primary database with vector extensions
- **Supabase** - Hosted PostgreSQL with pgvector support
- **pgvector** - Vector similarity search for embeddings

### Deployment & Infrastructure
- **Vercel** - Static site hosting and deployment
- **JSON + gzip** - Data format for visualization files
- **Environment variables** - Configuration management via .env files

## Development Dependencies

### Python Requirements
```bash
# Core ML stack
pandas>=1.5.0, numpy>=1.21.0, scikit-learn>=1.1.0
sentence-transformers>=2.2.0, umap-learn>=0.5.3, hdbscan>=0.8.28

# Database connectivity  
psycopg2-binary>=2.9.0, sqlalchemy>=1.4.0

# Development tools
pytest>=7.0.0, black>=22.0.0, flake8>=5.0.0
```

### Code Style
- **Python**: Follow PEP 8, use Black for formatting, Flake8 for linting
- **JavaScript**: Vanilla JS patterns, no transpilation needed
- **SQL**: Standard PostgreSQL syntax with vector extensions

## Common Commands

### Environment Setup
```bash
# Copy environment template
cp cads/.env.example cads/.env

# Install Python dependencies
cd cads && pip install -r requirements.txt
```

### Database Operations
```bash
# Create database tables
python3 scripts/migration/execute_cads_migration.py

# Verify database setup
python3 scripts/utilities/check_cads_data_location.py
```

### Data Processing Pipeline
```bash
# Process research data from OpenAlex
python3 scripts/processing/process_cads_with_openalex_ids.py

# Migrate data to CADS tables
python3 scripts/processing/migrate_cads_data_to_cads_tables.py

# Run complete ML pipeline (UMAP + HDBSCAN)
python3 cads/process_data.py
```

### Testing & Validation
```bash
# Test repository structure
python3 cads/tests/test_basic_structure.py

# Test database connectivity
python3 cads/tests/test_connection.py

# Run full pipeline test (requires ML dependencies)
python3 cads/tests/test_full_pipeline.py
```

### Local Development
```bash
# Start local web server for visualization
cd visuals/public && python3 -m http.server 8000

# Access at http://localhost:8000
```

### Deployment
```bash
# Vercel deployment (automatic via Git)
# Configuration in vercel.json handles:
# - Gzip compression for .gz files
# - CORS headers for data files
# - Cache control for static assets
```

## Performance Considerations

### Data Processing
- **Pipeline runtime**: ~5-10 minutes for complete dataset
- **Embedding generation**: ~2 minutes for missing embeddings  
- **UMAP reduction**: ~45 seconds for 2,454 works
- **HDBSCAN clustering**: ~15 seconds for 2D coordinates

### Visualization
- **WebGL rendering** via Deck.gl for smooth interactions
- **Data compression** using gzip for faster loading
- **Lazy loading** of visualization components
- **Caching** of computed label sizes and cluster centers

## Environment Variables

### Required
```bash
DATABASE_URL=postgresql://user:pass@host:port/db
OPENALEX_EMAIL=your_email@domain.com
```

### Optional
```bash
GROQ_API_KEY=your_groq_api_key  # For AI theme generation
EMBEDDING_MODEL=all-MiniLM-L6-v2  # Default embedding model
UMAP_N_NEIGHBORS=15  # UMAP parameter
HDBSCAN_MIN_CLUSTER_SIZE=5  # Clustering parameter
```