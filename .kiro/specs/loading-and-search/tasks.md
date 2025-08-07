# Implementation Plan

- [x] 1. Fix initial view state to show complete visualization on load
  - Analyze current view state initialization in `initializeDeckGL()` function
  - Implement bounds calculation from publication coordinates to determine optimal center and zoom
  - Add automatic view fitting after data loading completes
  - Test across different screen sizes and data distributions
  - _Requirements: 1.1_

- [x] 2. Implement word cloud-style theme labels with proportional sizing
- [x] 2.1 Create dynamic label sizing algorithm
  - Implement `calculateLabelSize()` function with logarithmic scaling based on cluster paper count
  - Add minimum (12px) and maximum (24px) size constraints for readability
  - Create size caching mechanism for performance optimization
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2.2 Modify cluster labels layer to use dynamic sizing
  - Update `createClusterLabelsLayer()` function to use calculated sizes instead of fixed size
  - Implement size calculation based on cluster data from `app.clusterCenters`
  - Add size threshold logic to only show labels for clusters with 15+ papers
  - Test label rendering with various cluster size distributions
  - _Requirements: 2.1, 2.2, 2.4_

- [x] 2.3 Add label size updates when filters change
  - Modify filter application logic to recalculate label sizes for visible clusters
  - Update `applyFilters()` function to trigger label size recalculation
  - Implement efficient size cache invalidation when cluster visibility changes
  - _Requirements: 2.5_

- [x] 3. Implement comprehensive initial data display
- [x] 3.1 Ensure complete research map visibility on load
  - Modify the initial view state calculation to guarantee all data is visible from start
  - Set publication year filter to maximum range (all years) by default on page load
  - Verify that the entire network graph is centered and zoomed to fit screen without manual adjustment
  - Test with various screen sizes to ensure consistent full-map visibility
  - _Requirements: 1.1, 1.2, 1.3_

- [-] 4. Replace search box with advanced filtering panel
- [-] 4.1 Redesign left panel structure for multiple filter sections
  - Restructure the UI panel HTML to include distinct sections for "Researcher", "Research Theme", and "Keywords"
  - Add clear section headings and organize filters with proper visual hierarchy
  - Ensure the panel layout is responsive and maintains usability across screen sizes
  - _Requirements: 2.1_

- [ ] 4.2 Implement researcher name filtering with real-time updates
  - Convert existing researcher dropdown to a text input field labeled "Researcher" or "Faculty"
  - Implement real-time filtering as user types researcher names (case-insensitive matching)
  - Update visualization instantly to highlight publications from matching researchers
  - Ensure partial name matching works (e.g., "tahir" matches "Tahir Ekin")
  - _Requirements: 2.2_

- [ ] 4.3 Create research theme checklist filter with color coding
  - Replace or supplement cluster dropdown with a visual checklist of all available themes
  - Add color swatches next to each theme name that correspond to theme colors on the map
  - Implement check/uncheck functionality to show or hide themes on the visualization
  - Ensure theme filter works cumulatively with other filters
  - _Requirements: 2.3_

- [ ] 4.4 Add new keywords filtering system with tag-based interface
  - Create a new "Keywords" section in the filtering panel
  - Implement text input field where users can type keywords and add them as filter tags
  - Add functionality to create multiple keyword tags for complex filtering
  - Implement AND/OR logic toggle (button or switch) to control keyword matching behavior
  - Update visualization to show only publications matching the keyword criteria
  - _Requirements: 2.4_

- [ ] 4.5 Implement cumulative filtering logic
  - Modify `getCurrentFilteredData()` function to handle multiple simultaneous filters
  - Ensure researcher, theme, and keyword filters work together cumulatively
  - Implement real-time visualization updates as any filter is applied or removed
  - Add filter state management to track active filters across all sections
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

