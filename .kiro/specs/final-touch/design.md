# Design Document

## Overview

The final reorganization of the CADS Research Visualization System addresses critical technical debt while preserving all functionality. This design implements a systematic approach to eliminate duplicate files, consolidate redundant documentation, organize scattered scripts, and enable proper CI/CD database testing. The reorganization follows a safety-first approach with comprehensive backups and verification procedures.

## Architecture

### Current State Analysis

The system currently suffers from organizational chaos despite solid functionality:

- **Duplicate Files**: Critical files exist at both root and subdirectory levels (app.js, index.html, requirements.txt)
- **Disabled CI Tests**: Database tests are completely skipped in CI with `pytest.mark.skipif(os.getenv("CI") == "true")`
- **Documentation Redundancy**: 6+ summary documents covering the same cleanup activities
- **Script Scatter**: Scripts exist in both organized subdirectories and root level

### Target Architecture

```mermaid
graph TB
    subgraph "Clean Repository Structure"
        A[Root Config Files Only] --> B[cads/ - Core Pipeline]
        A --> C[visuals/ - Visualization]
        A --> D[database/ - Schema]
        A --> E[scripts/ - Organized Utilities]
        A --> F[docs/ - Essential Documentation]
        A --> G[data/ - Processed Data]
        A --> H[tests/ - Comprehensive Testing]
    end
    
    subgraph "CI/CD Pipeline"
        I[GitHub Actions] --> J[Test Database]
        J --> K[Database Tests Enabled]
        K --> L[Integration Tests]
        L --> M[Deployment Gate]
    end
    
    subgraph "Documentation Hierarchy"
        N[README.md - Entry Point] --> O[HANDOFF_GUIDE.md - Comprehensive]
        N --> P[setup/ - Installation]
        N --> Q[troubleshooting/ - Issues]
    end
```

## Components and Interfaces

### 1. CI/CD Database Testing Component

**Problem**: Database tests are completely disabled in CI environments, preventing detection of production database issues.

**Solution**: Enable database tests with proper test database configuration.

**Implementation**:
- Remove `pytest.mark.skipif(os.getenv("CI") == "true")` from database tests
- Configure PostgreSQL test service in GitHub Actions
- Use test-specific database URL: `postgresql://postgres:postgres@localhost:5432/test_db`
- Implement proper test data fixtures for CI environment

**Interface Changes**:
```python
# Before (tests/database/test_connection.py)
pytestmark = pytest.mark.skipif(
    os.getenv("CI") == "true" or os.getenv("GITHUB_ACTIONS") == "true",
    reason="Database tests require actual Supabase data, not available in CI"
)

# After
pytestmark = pytest.mark.database
```

### 2. File Deduplication Component

**Problem**: Critical files duplicated at root and subdirectory levels causing deployment confusion.

**Solution**: Establish single source of truth for each file type.

**Canonical File Locations**:
- `app.js` → `visuals/public/app.js` (canonical)
- `index.html` → `visuals/public/index.html` (canonical)  
- `requirements.txt` → `cads/requirements.txt` (canonical)

**Verification Process**:
1. Compare file contents to identify differences
2. Preserve the most complete/recent version
3. Update all references to point to canonical location
4. Remove duplicate files
5. Test functionality after each removal

### 3. Documentation Consolidation Component

**Problem**: 6+ redundant summary documents create information overload.

**Solution**: Consolidate to essential documentation with clear hierarchy.

**Target Structure**:
```
docs/
├── README.md                    # Documentation index
├── HANDOFF_GUIDE.md            # Single comprehensive handoff
├── setup/
│   ├── INSTALLATION_GUIDE.md   # Setup procedures
│   ├── USER_GUIDE.md          # Usage instructions
│   └── CICD_PIPELINE_GUIDE.md # CI/CD configuration
└── troubleshooting/
    └── TROUBLESHOOTING_GUIDE.md # Problem resolution
```

**Files to Remove**:
- `docs/COMPREHENSIVE_DOCUMENTATION_SUMMARY.md`
- `docs/FINAL_CLEANUP_SUMMARY.md`
- `docs/CLEANUP_COMPLETED.md`
- `docs/ORGANIZATION_COMPLETE.md`
- `docs/CODEBASE_CLEANUP_ANALYSIS.md`
- `docs/FINAL_CODEBASE_ASSESSMENT.md`

### 4. Script Organization Component

**Problem**: Scripts scattered between root `scripts/` and organized subdirectories.

**Solution**: Organize all scripts in logical subdirectories with clear purposes.

**Target Organization**:
```
scripts/
├── README.md                   # Workflow documentation
├── migration/
│   ├── execute_cads_migration.py    # Main working script
│   └── legacy/                      # Archive old attempts
├── processing/
│   ├── process_cads_with_openalex_ids.py
│   └── migrate_cads_data_to_cads_tables.py
└── utilities/
    └── check_cads_data_location.py
```

**Scripts to Relocate/Remove**:
- Move `scripts/execute_cads_migration.py` → Already in `scripts/migration/`
- Remove `scripts/process_all_cads_professors.py` (superseded by processing version)
- Remove `scripts/cleanup_codebase.py` (cleanup script no longer needed)

## Data Models

### CI Test Database Configuration

```yaml
# .github/workflows/ci.yml
services:
  postgres:
    image: postgres:14
    env:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: test_db
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
    ports:
      - 5432:5432
```

### Test Environment Variables

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test_db
OPENALEX_EMAIL=test@example.com
SUPABASE_URL=test-supabase-url
GROQ_API_KEY=test-groq-key
```

### File Deduplication Matrix

| File | Root Location | Canonical Location | Action |
|------|---------------|-------------------|---------|
| app.js | ✓ | visuals/public/app.js | Remove root, keep canonical |
| index.html | ✓ | visuals/public/index.html | Remove root, keep canonical |
| requirements.txt | ✓ | cads/requirements.txt | Remove root, keep canonical |

## Error Handling

### Backup and Recovery Strategy

**Pre-Reorganization Backup**:
1. Create timestamped backup directory: `backup_reorganization_YYYYMMDD_HHMMSS/`
2. Copy entire repository structure before any changes
3. Document rollback procedures in `ROLLBACK_PROCEDURES.md`

**Verification Checkpoints**:
1. After file deduplication: Run full test suite
2. After documentation consolidation: Verify all links work
3. After script organization: Test all script functionality
4. After CI changes: Verify database tests run in CI

**Rollback Procedures**:
```bash
# Emergency rollback if issues occur
cp -r backup_reorganization_YYYYMMDD_HHMMSS/* .
git checkout -- .
git clean -fd
```

### Error Detection and Handling

**Automated Verification**:
- Run test suite after each major change
- Verify all import paths still work
- Check that all referenced files exist
- Validate CI pipeline configuration

**Manual Verification Points**:
- Database connection tests pass in CI
- Visualization loads correctly
- Data processing pipeline completes
- All documentation links are valid

## Testing Strategy

### CI Database Testing Implementation

**Current Issue**: Tests completely skipped in CI environment
```python
pytestmark = pytest.mark.skipif(
    os.getenv("CI") == "true",
    reason="Database tests require actual Supabase data"
)
```

**Solution**: Enable tests with proper test database
```python
pytestmark = pytest.mark.database

@pytest.fixture
def test_database_url():
    """Provide test database URL for CI environment"""
    if os.getenv("CI") == "true":
        return "postgresql://postgres:postgres@localhost:5432/test_db"
    else:
        return os.getenv("DATABASE_URL")
```

### Test Categories and Execution

**Test Execution Order**:
1. **Structure Tests** - Verify repository organization
2. **Unit Tests** - Individual component functionality  
3. **Database Tests** - Connection and data integrity (now enabled in CI)
4. **Integration Tests** - Component interaction
5. **Pipeline Tests** - End-to-end data flow

**CI Test Configuration**:
```bash
# .github/scripts/run-tests.sh (updated)
echo "📊 Running database connection tests..."
python -m pytest tests/database/ -q --tb=short -m database

echo "🔄 Running data processing tests..."
python -m pytest tests/pipeline/ -q --tb=short

echo "🎨 Running visualization tests..."
python -m pytest tests/visualization/ -q --tb=short
```

### Regression Prevention

**Functionality Preservation Tests**:
- Core data processing pipeline integrity
- Visualization rendering and interaction
- Database schema and data access
- API integrations and rate limiting

**Performance Benchmarks**:
- Data processing time: ~5-10 minutes for complete dataset
- Visualization load time: <3 seconds for initial render
- Search response time: <500ms for typical queries

### Quality Gates

**Pre-Deployment Verification**:
1. All tests pass including database tests in CI
2. No duplicate files detected by automated scan
3. All documentation links validated
4. Complete data pipeline run successful
5. Visualization functionality verified

**Deployment Blockers**:
- Any test failures in CI
- Missing canonical files
- Broken import paths
- Invalid documentation references
- Performance regression beyond 20%

This design ensures a systematic, safe approach to reorganizing the codebase while maintaining all functionality and establishing proper CI/CD practices for ongoing development.