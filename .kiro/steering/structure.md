# Project Structure & Organization

## Repository Architecture

The CADS Research Visualization System follows a clear separation of concerns with distinct modules for data processing, visualization, database management, and utilities.

## Directory Structure

```
CADS-Research-Visualization/
├── 📊 cads/                          # Core data processing pipeline
├── 🎨 visuals/                       # Interactive visualization dashboard  
├── 🗄️ database/                      # Database schema and migrations
├── 🔧 scripts/                       # Organized utility scripts
├── 📚 docs/                          # Centralized documentation
├── 📦 data/                          # Processed data storage
└── [config files]                   # .env, vercel.json, etc.
```

## Core Modules

### `cads/` - Data Processing Pipeline
**Purpose**: Core ML pipeline for research data processing
**Pattern**: Modular Python package with clear separation of concerns

```
cads/
├── data_loader.py          # DataProcessor class - database & embeddings
├── process_data.py         # Pipeline orchestration - UMAP & HDBSCAN  
├── requirements.txt        # Python dependencies
├── .env.example           # Environment template
├── data/                  # Generated data files (JSON)
├── models/                # Trained ML models (PKL files)
└── tests/                 # Comprehensive test suite
```

**Key Classes**:
- `DataProcessor` - Main data loading and embedding generation
- Pipeline functions for UMAP reduction and HDBSCAN clustering

### `visuals/` - Visualization Dashboard
**Purpose**: Interactive web-based research exploration
**Pattern**: Static web application with modular JavaScript

```
visuals/
├── public/                # Web interface files
│   ├── index.html        # Main dashboard interface
│   ├── app.js           # Visualization logic & state management
│   └── data/            # Visualization data files (JSON + gzip)
├── data/                 # Raw visualization data
├── models/              # Visualization ML models
└── tests/               # Visualization-specific tests
```

**JavaScript Architecture**:
- Single global `app` object for state management
- Modular functions for filtering, search, and visualization
- Event-driven UI updates with DOM manipulation

### `database/` - Schema Management
**Purpose**: PostgreSQL schema definitions and migrations
**Pattern**: SQL-first database design with vector extensions

```
database/
├── schema/              # Table definitions
│   ├── create_cads_tables.sql      # Complete CADS schema
│   └── create_cads_tables_simple.sql
└── migrations/          # Future database migrations
```

**Schema Design**:
- `cads_researchers` - Faculty profiles with OpenAlex integration
- `cads_works` - Research papers with 384-dimensional embeddings
- `cads_topics` - Hierarchical topic classifications
- Vector indexes for semantic search capabilities

### `scripts/` - Utility Scripts
**Purpose**: Organized automation and maintenance scripts
**Pattern**: Functional categorization with clear working versions

```
scripts/
├── migration/           # Database setup scripts
│   ├── execute_cads_migration.py    # ✅ Main working script
│   └── legacy/                      # Archived attempts
├── processing/          # Data collection and transformation
│   ├── process_cads_with_openalex_ids.py
│   └── migrate_cads_data_to_cads_tables.py
└── utilities/           # Verification and maintenance
    └── check_cads_data_location.py
```

**Script Conventions**:
- Working scripts marked with ✅ in documentation
- Legacy/deprecated scripts moved to `legacy/` folders
- Clear naming convention: `verb_object_context.py`

### `data/` - Data Storage
**Purpose**: Centralized data files organized by processing stage
**Pattern**: Clear data flow from raw to processed to search-ready

```
data/
├── raw/                 # Original data files
├── processed/           # ML pipeline outputs
│   ├── cluster_themes.json        # AI-generated themes
│   ├── clustering_results.json    # HDBSCAN results
│   └── visualization-data.json    # Complete dataset
└── search/              # Search indexes
    └── search-index.json          # Pre-built search index
```

**Data Flow**:
1. Raw data → `data/raw/`
2. ML processing → `data/processed/`
3. Search indexing → `data/search/`
4. Visualization → `visuals/public/data/` (with gzip compression)

## Architectural Patterns

### Separation of Concerns
- **Data Processing**: Pure Python with ML libraries
- **Visualization**: Pure JavaScript with WebGL
- **Database**: PostgreSQL with vector extensions
- **Scripts**: Functional utilities with clear purposes

### Configuration Management
- **Environment Variables**: `.env` files for sensitive configuration
- **JSON Configuration**: `vercel.json` for deployment settings
- **Python Requirements**: `requirements.txt` for dependency management

### Testing Strategy
- **Structure Tests**: Validate repository organization
- **Connection Tests**: Database connectivity verification
- **Pipeline Tests**: End-to-end ML pipeline validation
- **Integration Tests**: Component interaction testing

### Documentation Organization
```
docs/
├── setup/               # Installation and configuration guides
├── pipeline/            # Technical architecture documentation  
└── migration/           # Historical context and migration records
```

## File Naming Conventions

### Python Files
- **Modules**: `snake_case.py` (e.g., `data_loader.py`)
- **Scripts**: `verb_object_context.py` (e.g., `execute_cads_migration.py`)
- **Tests**: `test_functionality.py` (e.g., `test_basic_structure.py`)

### Data Files
- **JSON**: `descriptive_name.json` (e.g., `clustering_results.json`)
- **Compressed**: `name.json.gz` for web delivery
- **Models**: `algorithm_model.pkl` (e.g., `hdbscan_model.pkl`)

### Documentation
- **README files**: One per major directory explaining purpose and usage
- **Markdown docs**: Descriptive names in `docs/` subdirectories
- **Analysis files**: `CAPS_ANALYSIS.md` for repository-level documentation

## Import Patterns

### Python Imports
```python
# Standard library first
import os, sys, json

# Third-party libraries
import pandas as pd, numpy as np
from sentence_transformers import SentenceTransformer

# Local modules
from data_loader import DataProcessor
```

### JavaScript Modules
- No module system - global `app` object pattern
- Feature-based function organization
- Event-driven architecture with DOM manipulation

## Data Processing Flow

1. **Database Connection** → `DataProcessor` class initialization
2. **Data Loading** → SQL queries to fetch research data
3. **Embedding Generation** → sentence-transformers for semantic vectors
4. **Dimensionality Reduction** → UMAP for 2D coordinates
5. **Clustering** → HDBSCAN for research theme groups
6. **Theme Generation** → AI-powered cluster descriptions
7. **Output Generation** → JSON files for visualization
8. **Compression** → Gzip for web delivery

## Development Workflow

1. **Environment Setup** → Copy `.env.example`, install dependencies
2. **Database Setup** → Run migration scripts
3. **Data Processing** → Execute pipeline scripts in order
4. **Testing** → Run test suite to validate functionality
5. **Local Development** → Start web server for visualization
6. **Deployment** → Automatic via Vercel on Git push