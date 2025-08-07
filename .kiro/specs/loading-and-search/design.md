# Design Document

## Overview

This design addresses three critical issues in the CADS Research Visualization application:

1. **Initial View Problem**: The visualization loads with an inappropriate zoom/pan state, requiring users to manually adjust the view to see the complete network graph
2. **Word Cloud Theme Labels**: Theme labels should scale proportionally based on cluster size to create a visual hierarchy
3. **Non-functional Search**: The search input box doesn't filter the visualization, despite having a search index available

The solution involves implementing proper initial view state management, dynamic label sizing based on cluster data, and connecting the search functionality to the existing data structures.

## Architecture

### Current System Architecture

The application uses a client-side architecture with:
- **Frontend**: Vanilla JavaScript with Deck.gl for WebGL-based visualization
- **Data Layer**: Pre-optimized JSON files served statically
- **Visualization Engine**: Deck.gl ScatterplotLayer for publications, TextLayer for cluster labels
- **State Management**: Global `app` object managing application state

### Key Components

1. **Data Loading System**: Handles fetching compressed/uncompressed data files
2. **Deck.gl Visualization**: Renders publications as scatter points with researcher colors
3. **Filter System**: Dropdown filters for researcher, year, and cluster
4. **Search Infrastructure**: Pre-built search index (currently unused)
5. **UI Panel**: Control interface with search input and filters

## Components and Interfaces

### 1. Initial View State Manager

**Purpose**: Ensure the visualization loads with optimal zoom and center position

**Implementation Strategy**:
- Utilize the existing `data.v` view state from the data file
- Implement a "fit to bounds" calculation based on publication coordinates
- Add automatic view adjustment after data loading completes

**Key Functions**:
```javascript
function calculateOptimalViewState(publications)
function fitVisualizationToScreen()
function autoZoomToFitData()
```

### 2. Word Cloud Label System

**Purpose**: Create proportionally-sized theme labels that reflect cluster importance

**Implementation Strategy**:
- Modify the existing `createClusterLabelsLayer()` function to use dynamic sizing
- Implement logarithmic scaling algorithm for label sizes based on cluster paper count
- Add minimum and maximum size constraints for readability
- Update label sizing when filters change cluster visibility

**Key Functions**:
```javascript
function calculateLabelSize(clusterSize, minSize, maxSize)
function updateLabelSizesForVisibleClusters(visibleClusters)
function getScaledLabelProperties(cluster)
```

### 3. Search System Enhancement

**Purpose**: Connect the search input to filter publications in real-time

**Implementation Strategy**:
- Leverage the existing search index (`search-index.json.gz`)
- Implement fuzzy search across researcher names, paper titles, and themes
- Integrate search results with the existing filter system

**Key Functions**:
```javascript
function loadSearchIndex()
function performFuzzySearch(query)
function filterPublicationsBySearch(searchResults)
function updateVisualizationWithSearchResults(filteredData)
```

### 4. Enhanced Filter Coordination

**Purpose**: Coordinate search results with existing dropdown filters

**Implementation Strategy**:
- Modify the existing `applyFilters()` function to consider search state
- Implement filter state management that combines search + dropdown filters
- Ensure search clearing restores previous filter state

## Data Models

### Search Index Structure
```javascript
{
  entries: [
    {
      id: number,           // Publication index
      type: "publication",  // Entry type
      title: string,        // Searchable title
      year: number,         // Publication year
      researcher: string,   // Author name
      cluster: string       // Theme name
    }
  ],
  meta: {
    totalEntries: number,
    generated: string
  }
}
```

### Application State Extensions
```javascript
app = {
  // Existing state...
  searchIndex: null,        // Loaded search index
  searchQuery: "",          // Current search query
  searchResults: [],        // Filtered publication IDs
  isSearchActive: false,    // Search state flag
  previousFilterState: {},  // State before search
  labelSizeCache: new Map() // Cached label sizes for performance
}
```

### View State Calculation
```javascript
{
  longitude: number,    // Center X coordinate
  latitude: number,     // Center Y coordinate  
  zoom: number,         // Optimal zoom level
  bounds: {            // Data boundaries
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
  }
}
```

### Label Sizing Configuration
```javascript
{
  minSize: 12,          // Minimum readable label size
  maxSize: 24,          // Maximum label size
  scalingFactor: 1.5,   // Logarithmic scaling factor
  sizeThreshold: 15     // Minimum cluster size to show label
}
```

## Error Handling

### Initial View State Errors
- **Missing view state data**: Fall back to calculating bounds from publication coordinates
- **Invalid coordinates**: Use default center position with conservative zoom
- **Empty dataset**: Show appropriate message and default view

### Label Sizing Errors
- **Missing cluster size data**: Use default medium size for all labels
- **Invalid size values**: Apply bounds checking and use fallback sizes
- **Performance issues**: Implement size caching and efficient recalculation

### Search System Errors
- **Search index loading failure**: Disable search functionality gracefully, show warning
- **Search query errors**: Handle malformed queries without breaking visualization
- **No search results**: Display "No results found" message, maintain current view

### Data Loading Errors
- **Network failures**: Retry mechanism with exponential backoff
- **Corrupted data**: Validate data structure and show specific error messages
- **Performance issues**: Implement progressive loading for large datasets

## Testing Strategy

### Unit Tests
1. **View State Calculation**
   - Test bounds calculation with various data sizes
   - Test zoom level optimization for different screen sizes
   - Test edge cases (single point, empty data, extreme coordinates)

2. **Label Sizing Algorithm**
   - Test size calculation with various cluster sizes
   - Test minimum and maximum size constraints
   - Test logarithmic scaling accuracy and visual appeal

3. **Search Functionality**
   - Test fuzzy search algorithm accuracy
   - Test search performance with large datasets
   - Test search result filtering and coordination with other filters

4. **Filter Integration**
   - Test search + dropdown filter combinations
   - Test filter state management and restoration
   - Test edge cases (conflicting filters, empty results)
   - Test label size updates when filters change cluster visibility

### Integration Tests
1. **End-to-End Loading**
   - Test complete application initialization
   - Test data loading with both compressed and uncompressed files
   - Test graceful degradation when optional data is missing

2. **User Interaction Flows**
   - Test search-to-filter workflows
   - Test filter clearing and restoration
   - Test responsive behavior across different screen sizes

3. **Performance Tests**
   - Test search response time (<50ms target)
   - Test visualization rendering performance (60fps target)
   - Test memory usage with large datasets

### Visual Regression Tests
1. **Initial View Consistency**
   - Capture screenshots of initial load state
   - Test across different screen resolutions
   - Verify consistent positioning and zoom levels

2. **Label Size Visualization**
   - Test word cloud effect with various cluster size distributions
   - Test label readability at different sizes
   - Test label positioning and overlap prevention

3. **Search Result Visualization**
   - Test search result highlighting
   - Test transition animations
   - Test "no results" state display

## Implementation Approach

### Phase 1: Initial View Fix
1. Analyze current view state loading in `initializeDeckGL()`
2. Implement bounds calculation from publication coordinates
3. Add automatic view fitting after data load
4. Test across different screen sizes and data sets

### Phase 2: Word Cloud Label Implementation
1. Analyze current cluster label rendering in `createClusterLabelsLayer()`
2. Implement dynamic size calculation based on cluster paper count
3. Add logarithmic scaling algorithm with min/max constraints
4. Test label sizing across different cluster size distributions

### Phase 3: Search Index Integration
1. Modify data loading to include search index
2. Implement search index parsing and storage
3. Create search query processing functions
4. Test search index loading and basic functionality

### Phase 4: Search Functionality
1. Connect search input to search processing
2. Implement real-time search filtering
3. Integrate search results with visualization updates
4. Add search state management and clearing

### Phase 5: Filter Coordination
1. Modify existing filter system to work with search
2. Implement combined filter state management
3. Add search result coordination with dropdown filters
4. Test all filter combinations

### Phase 6: Polish and Optimization
1. Add search performance optimizations
2. Implement proper error handling and user feedback
3. Add loading states and transitions
4. Comprehensive testing and bug fixes

## Technical Considerations

### Performance Optimization
- **Search Debouncing**: 300ms delay to prevent excessive API calls
- **Result Caching**: Cache search results to avoid re-computation
- **Incremental Filtering**: Only update visualization when results change
- **Memory Management**: Efficient data structures for large search indices

### Browser Compatibility
- **Modern JavaScript**: ES6+ features with fallbacks for older browsers
- **WebGL Support**: Graceful degradation for devices without WebGL
- **Mobile Responsiveness**: Touch-friendly interactions and responsive layout

### Accessibility
- **Keyboard Navigation**: Full keyboard support for search and filters
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **High Contrast Mode**: Support for high contrast display preferences
- **Reduced Motion**: Respect user preferences for reduced animations