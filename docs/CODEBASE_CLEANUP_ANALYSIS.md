# CADS Research Visualization - Codebase Cleanup Analysis

## 🚨 Issues Identified

### 1. **Nested Git Repository**
- `cads/.git/` contains a full git repository pointing to the same remote
- This creates confusion and potential conflicts
- **Status**: ❌ **CRITICAL - NEEDS IMMEDIATE CLEANUP**

### 2. **Data Duplication Across 4+ Locations**
Data is scattered and duplicated across multiple directories:

```
📊 DATA DUPLICATION MAP:

1. data/processed/           # ✅ SHOULD BE PRIMARY
   ├── cluster_themes.json
   ├── clustering_results.json
   ├── visualization-data.json
   └── [compressed versions]

2. cads/data/               # ❌ DUPLICATE + EXTRA FILES
   ├── cluster_themes.json      [DUPLICATE]
   ├── clustering_results.json  [DUPLICATE]
   ├── umap_coordinates.json    [UNIQUE]
   └── processing_summary.json  [UNIQUE]

3. visuals/data/            # ❌ DUPLICATE
   ├── cluster_themes.json      [DUPLICATE]
   ├── clustering_results.json  [DUPLICATE]
   └── umap_coordinates.json    [DUPLICATE]

4. visuals/public/data/     # ✅ PRODUCTION DATA (KEEP)
   ├── cluster_themes.json      [PRODUCTION]
   ├── clustering_results.json  [PRODUCTION]
   ├── visualization-data.json  [PRODUCTION]
   ├── search-index.json        [PRODUCTION]
   └── [compressed versions]    [PRODUCTION]
```

### 3. **Model File Duplication**
```
📦 MODEL DUPLICATION:

1. cads/models/             # ❌ DUPLICATE
   ├── hdbscan_model.pkl
   └── umap_model.pkl

2. visuals/models/          # ❌ DUPLICATE
   ├── hdbscan_model.pkl
   └── umap_model.pkl
```

### 4. **Inconsistent Directory Structure**
- Multiple `tests/` directories (partially cleaned up)
- Inconsistent data organization
- No clear data flow pipeline

## 🎯 Proposed Clean Architecture

### **Single Source of Truth Data Flow**
```
📊 CLEAN DATA ARCHITECTURE:

data/                       # 🎯 SINGLE SOURCE OF TRUTH
├── raw/                    # Raw input data
├── processed/              # Pipeline outputs (JSON)
├── models/                 # ML models (PKL files)
└── search/                 # Search indexes

cads/                       # 🔧 PROCESSING ENGINE ONLY
├── data_loader.py          # Core processing logic
├── process_data.py         # Pipeline orchestration
├── requirements.txt        # Dependencies
├── .env.example           # Config template
└── [NO DATA DIRECTORIES]  # Data lives in /data

visuals/public/data/        # 🌐 PRODUCTION WEB DATA
├── [symlinks to /data/processed/] # OR
├── [automated copy from /data/]   # OR
└── [build process copies]         # Deployment only
```

## 🧹 Cleanup Plan

### **Phase 1: Remove Nested Git Repository**
```bash
# IMMEDIATE - Remove nested git repo
rm -rf cads/.git/
```

### **Phase 2: Consolidate Data Directories**
```bash
# Move unique files from cads/data/ to data/processed/
mv cads/data/umap_coordinates.json data/processed/
mv cads/data/processing_summary.json data/processed/

# Remove duplicate data directories
rm -rf cads/data/
rm -rf visuals/data/

# Consolidate models
mv cads/models/* data/models/ 2>/dev/null || true
mv visuals/models/* data/models/ 2>/dev/null || true
rm -rf cads/models/
rm -rf visuals/models/
```

### **Phase 3: Update Code References**
Update all scripts and code to reference the centralized data location:
- `cads/process_data.py` → output to `data/processed/`
- `cads/data_loader.py` → read from `data/processed/`
- Tests → reference `data/` for fixtures

### **Phase 4: Production Data Pipeline**
Create automated pipeline to sync `data/processed/` → `visuals/public/data/`

## 📋 Detailed File Analysis

### **Files to Keep (Unique Content)**
```
✅ UNIQUE FILES TO PRESERVE:
- cads/data/umap_coordinates.json     → move to data/processed/
- cads/data/processing_summary.json  → move to data/processed/
- data/cads.txt                       → keep (input data)
- visuals/public/data/README.md       → keep (documentation)
```

### **Files to Remove (Duplicates)**
```
❌ DUPLICATE FILES TO REMOVE:
- cads/data/cluster_themes.json
- cads/data/clustering_results.json
- visuals/data/* (entire directory)
- cads/models/* (after moving to data/models/)
- visuals/models/* (after moving to data/models/)
```

### **Production Files (Keep in Place)**
```
🌐 PRODUCTION FILES (KEEP):
- visuals/public/data/* (all files - needed for web deployment)
```

## 🔄 Proposed Data Flow

### **Development Pipeline**
```
1. cads/process_data.py
   ↓ (processes data)
2. data/processed/
   ↓ (build/deploy process)
3. visuals/public/data/
   ↓ (web serving)
4. Production Website
```

### **Benefits of Clean Architecture**
1. **Single Source of Truth**: All data originates from `data/`
2. **Clear Separation**: Processing (`cads/`) vs Storage (`data/`) vs Serving (`visuals/public/data/`)
3. **No Duplication**: Each file exists in one canonical location
4. **Maintainable**: Clear data flow and dependencies
5. **Deployable**: Production data is separate from development data

## ⚠️ Risks and Considerations

### **Before Cleanup**
1. **Backup Current State**: Create full backup before any changes
2. **Test Dependencies**: Ensure no hardcoded paths break
3. **Verify Production**: Confirm visuals/public/data/ is actually used in production
4. **Check Deployment**: Understand how Vercel deploys the data

### **Potential Breaking Changes**
- Scripts that hardcode paths to `cads/data/` or `visuals/data/`
- Tests that expect data in specific locations
- Deployment processes that rely on current structure

## 🚀 Implementation Priority

### **HIGH PRIORITY (Do First)**
1. ✅ Remove nested git repository (`rm -rf cads/.git/`)
2. ✅ Backup current state
3. ✅ Move unique files to centralized location

### **MEDIUM PRIORITY**
4. Update code references to use centralized data
5. Remove duplicate directories
6. Update documentation

### **LOW PRIORITY**
7. Optimize production data pipeline
8. Add automated sync processes
9. Implement data validation

Would you like me to proceed with the cleanup implementation?