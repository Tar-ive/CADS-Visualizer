# Implementation Plan

- [x] 1. Setup and Environment Configuration
  - Create comprehensive backup before any changes
  - Fix GitHub Actions environment configuration to resolve previous CI issues
  - Configure proper PostgreSQL test database with correct authentication
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 1.1 Create Safety Backup and Rollback Procedures
  - Create timestamped backup directory with complete repository state
  - Document rollback procedures in case of issues during reorganization
  - Implement automated verification scripts to check system integrity
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 1.2 Fix GitHub Actions Environment Setup
  - Configure CI workflow to use existing "cads-research" environment with GROQ_API_KEY and DATABASE_URL
  - Remove git submodule configuration error by fixing or removing .gitmodules references
  - Configure PostgreSQL service with proper authentication (postgres user, not root)
  - Set up hybrid database configuration: use Supabase for integration tests, local PostgreSQL for unit tests
  - Generate required data files before visualization tests to prevent 404 errors
  - _Requirements: 1.1, 1.2, 1.3, 7.2_

- [x] 1.3 Enable Database Tests in CI Environment
  - Remove pytest.mark.skipif conditions that disable database tests in CI
  - Update CI workflow to use "cads-research" environment for accessing Supabase DATABASE_URL
  - Configure test fixtures to use Supabase connection for integration tests in CI
  - Implement proper test database initialization and cleanup procedures
  - Verify database tests run successfully using the cads-research environment configuration
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. File Deduplication Implementation
  - Identify and analyze all duplicate files at root and subdirectory levels
  - Establish canonical versions and remove duplicates systematically
  - Update all file references and import paths to point to canonical locations
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.1 Analyze and Remove Duplicate JavaScript Files
  - Compare app.js at root vs visuals/public/app.js to identify canonical version
  - Remove root-level app.js and ensure all references point to visuals/public/app.js
  - Update any build scripts or deployment configurations that reference root app.js
  - Test visualization functionality after file removal
  - _Requirements: 2.1, 2.2, 2.3, 5.2_

- [x] 2.2 Analyze and Remove Duplicate HTML Files
  - Compare index.html at root vs visuals/public/index.html to identify canonical version
  - Remove root-level index.html and ensure deployment uses visuals/public/index.html
  - Update Vercel configuration if needed to serve from correct location
  - Verify web application loads correctly after file removal
  - _Requirements: 2.1, 2.2, 2.3, 5.2_

- [x] 2.3 Analyze and Remove Duplicate Requirements Files
  - Compare requirements.txt at root vs cads/requirements.txt to identify differences
  - Establish cads/requirements.txt as canonical version with complete dependencies
  - Remove root-level requirements.txt and update CI configuration to use cads/requirements.txt
  - Test that all Python dependencies install correctly from canonical location
  - _Requirements: 2.1, 2.2, 2.3, 5.2_

- [x] 3. Documentation Consolidation
  - Identify all redundant summary documents in docs/ directory
  - Create single comprehensive handoff guide consolidating essential information
  - Remove redundant documentation files while preserving critical information
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3.1 Create Comprehensive Handoff Documentation
  - Write single HANDOFF_GUIDE.md that consolidates all essential system information
  - Include system overview, setup procedures, maintenance tasks, and emergency procedures
  - Document known issues and workarounds from previous summary documents
  - Create clear navigation structure for remaining documentation
  - _Requirements: 3.3, 8.1, 8.2, 8.4, 8.5_

- [x] 3.2 Remove Redundant Summary Documents
  - Remove docs/COMPREHENSIVE_DOCUMENTATION_SUMMARY.md (redundant)
  - Remove docs/FINAL_CLEANUP_SUMMARY.md (redundant)
  - Remove docs/CLEANUP_COMPLETED.md (redundant)
  - Remove docs/ORGANIZATION_COMPLETE.md (redundant)
  - Remove docs/CODEBASE_CLEANUP_ANALYSIS.md (redundant)
  - Remove docs/FINAL_CODEBASE_ASSESSMENT.md (redundant)
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 3.3 Establish Clean Documentation Hierarchy
  - Update docs/README.md to serve as documentation index with clear navigation
  - Organize remaining documentation into setup/ and troubleshooting/ subdirectories
  - Ensure all internal documentation links are updated and functional
  - Verify no broken references exist after document removal
  - _Requirements: 3.3, 3.4, 3.5_

- [ ] 4. Script Organization and Cleanup
  - Organize scattered scripts into logical subdirectories with clear purposes
  - Remove duplicate and obsolete scripts while preserving working versions
  - Update script documentation and usage instructions
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 4.1 Remove Duplicate and Obsolete Scripts
  - Remove scripts/process_all_cads_professors.py (superseded by processing version)
  - Remove scripts/cleanup_codebase.py (cleanup script no longer needed)
  - Archive any legacy scripts to appropriate legacy/ subdirectories
  - Verify no functionality depends on removed scripts
  - _Requirements: 4.1, 4.2, 4.4_

- [ ] 4.2 Verify Script Organization Structure
  - Confirm all migration scripts are properly organized in scripts/migration/
  - Confirm all processing scripts are properly organized in scripts/processing/
  - Confirm all utility scripts are properly organized in scripts/utilities/
  - Update scripts/README.md with clear workflow documentation
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [ ] 5. Comprehensive System Verification
  - Run complete test suite to verify no functionality regression
  - Test full data processing pipeline from OpenAlex to visualization
  - Verify CI/CD pipeline works with all changes
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 5.1 Run Complete Test Suite with Database Tests Enabled
  - Execute all unit tests to verify individual component functionality
  - Run database tests in CI environment to confirm proper configuration
  - Execute integration tests to verify component interactions work correctly
  - Run visualization tests with proper data file generation
  - Verify all tests pass without skipping database tests
  - _Requirements: 1.5, 5.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 5.2 Test Complete Data Processing Pipeline
  - Verify OpenAlex API integration works with rate limiting configuration
  - Test database connection and data loading functionality
  - Run UMAP dimensionality reduction and HDBSCAN clustering pipeline
  - Verify data synchronization from data/processed/ to visuals/public/data/
  - Confirm visualization loads and displays data correctly
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 5.3 Verify CI/CD Pipeline Integration
  - Test that GitHub Actions runs all tests including database tests using cads-research environment
  - Verify deployment process works with reorganized file structure
  - Confirm Vercel deployment uses correct canonical file locations
  - Test that GROQ_API_KEY and DATABASE_URL from cads-research environment work correctly in CI
  - Validate that deployment gates prevent deployment on test failures
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.3_

- [ ] 6. Final Production Readiness Verification
  - Create final handoff documentation with setup and maintenance procedures
  - Verify all known issues are documented with workarounds
  - Confirm system is ready for production deployment and maintenance
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 6.1 Complete Handoff Documentation
  - Finalize HANDOFF_GUIDE.md with comprehensive system information
  - Document all setup procedures for new developers
  - Include maintenance tasks, monitoring procedures, and emergency contacts
  - Create troubleshooting guide with common issues and solutions
  - _Requirements: 8.1, 8.2, 8.4, 8.5_

- [ ] 6.2 Final System Health Check
  - Run complete system verification including all components
  - Verify performance benchmarks are maintained (data processing <10min, visualization <3sec)
  - Confirm all security configurations and deployment settings are correct
  - Validate that backup and rollback procedures are documented and tested
  - _Requirements: 5.5, 8.3, 8.5_