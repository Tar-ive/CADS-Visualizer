// CADS Research Visualization Application
console.log('🎯 CADS Research Visualization - Initializing...');

// Application state
const app = {
    data: null,
    filteredData: null,
    searchIndex: null,
    clusterThemes: null,
    clusterCenters: null,
    deckgl: null,
    isLoading: true,
    currentZoom: 8,
    labelSizeCache: new Map(), // Cache for calculated label sizes

    // UI elements
    elements: {
        loading: document.getElementById('loading'),
        loadingProgress: document.getElementById('loading-progress'),
        errorMessage: document.getElementById('error-message'),
        errorDetails: document.getElementById('error-details'),
        mapContainer: document.getElementById('map-container'),
        uiPanel: document.getElementById('ui-panel'),
        panelToggle: document.getElementById('panel-toggle'),
        searchInput: document.getElementById('search-input'),
        researcherFilter: document.getElementById('researcher-filter'),
        yearFilter: document.getElementById('year-filter'),
        yearDisplay: document.getElementById('year-display'),
        clusterFilter: document.getElementById('cluster-filter'),
        tooltip: document.getElementById('tooltip'),
        tooltipTitle: document.getElementById('tooltip-title'),
        tooltipDetails: document.getElementById('tooltip-details'),
        tooltipMeta: document.getElementById('tooltip-meta'),
        visiblePapers: document.getElementById('visible-papers'),
        totalPapers: document.getElementById('total-papers'),
        totalResearchers: document.getElementById('total-researchers'),
        totalClusters: document.getElementById('total-clusters')
    }
};

// Initialize the application
function init() {
    console.log('🚀 Starting CADS Research Visualization...');

    // Clear any existing label size cache to ensure fresh calculations
    clearLabelCacheIfNeeded();

    // Set up UI event listeners
    setupUIEventListeners();

    // Update loading progress
    updateLoadingProgress('Setting up interface...');

    // Load the visualization data and initialize
    loadVisualization();
}

// Set up UI event listeners
function setupUIEventListeners() {
    // Panel toggle
    app.elements.panelToggle.addEventListener('click', togglePanel);

    // Year filter
    app.elements.yearFilter.addEventListener('input', (e) => {
        app.elements.yearDisplay.textContent = e.target.value;
        applyFilters();
    });

    // Search input
    app.elements.searchInput.addEventListener('input', debounce((e) => {
        performSearch(e.target.value);
    }, 300));

    // Filter dropdowns
    app.elements.researcherFilter.addEventListener('change', (e) => {
        applyFilters();
    });

    app.elements.clusterFilter.addEventListener('change', (e) => {
        applyFilters();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideTooltip();
        }
        if (e.key === '/' && !e.target.matches('input')) {
            e.preventDefault();
            app.elements.searchInput.focus();
        }
    });
}

// Toggle UI panel
function togglePanel() {
    const panel = app.elements.uiPanel;
    const button = app.elements.panelToggle;

    panel.classList.toggle('collapsed');
    button.textContent = panel.classList.contains('collapsed') ? '+' : '−';
    button.title = panel.classList.contains('collapsed') ? 'Show panel' : 'Hide panel';
}

// Update loading progress
function updateLoadingProgress(message) {
    app.elements.loadingProgress.textContent = message;
}

// Show error message
function showError(title, details) {
    app.elements.errorMessage.querySelector('.error-title').textContent = title;
    app.elements.errorDetails.textContent = details;
    app.elements.errorMessage.style.display = 'block';

    // Auto-hide after 10 seconds
    setTimeout(() => {
        app.elements.errorMessage.style.display = 'none';
    }, 10000);
}

// Hide loading screen
function hideLoading() {
    app.elements.loading.classList.add('hidden');
    app.isLoading = false;

    // Remove loading element after transition
    setTimeout(() => {
        app.elements.loading.style.display = 'none';
    }, 300);
}

// Show tooltip
function showTooltip(x, y, title, details, meta) {
    app.elements.tooltipTitle.textContent = title;
    app.elements.tooltipDetails.textContent = details;
    app.elements.tooltipMeta.textContent = meta;

    const tooltip = app.elements.tooltip;
    tooltip.style.display = 'block';

    // Position tooltip near cursor with small offset
    const offsetX = 15;
    const offsetY = 15;
    let tooltipX = x + offsetX;
    let tooltipY = y + offsetY;

    tooltip.style.left = tooltipX + 'px';
    tooltip.style.top = tooltipY + 'px';

    // Adjust position if tooltip goes off screen
    const rect = tooltip.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        tooltipX = x - rect.width - offsetX;
        tooltip.style.left = tooltipX + 'px';
    }
    if (rect.bottom > window.innerHeight) {
        tooltipY = y - rect.height - offsetY;
        tooltip.style.top = tooltipY + 'px';
    }

    // Ensure tooltip doesn't go off the left or top edge
    if (tooltipX < 0) {
        tooltip.style.left = '10px';
    }
    if (tooltipY < 0) {
        tooltip.style.top = '10px';
    }
}

// Hide tooltip
function hideTooltip() {
    app.elements.tooltip.style.display = 'none';
}

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Load and initialize the visualization
async function loadVisualization() {
    try {
        updateLoadingProgress('Loading research data...');

        // Try to load data - start with uncompressed for local development
        let response;
        let dataUrl = '';
        let data;

        try {
            // Try uncompressed first for local development
            dataUrl = '/data/visualization-data.json';
            response = await fetch(dataUrl);
            if (response.ok) {
                console.log('✅ Loading uncompressed data from:', dataUrl);
                data = await response.json();
            } else {
                throw new Error('Uncompressed data not available');
            }
        } catch (e) {
            console.log('⚠️ Uncompressed data failed, trying compressed...');
            try {
                dataUrl = '/data/visualization-data.json.gz';
                response = await fetch(dataUrl);
                if (!response.ok) throw new Error('Compressed data not available');
                console.log('✅ Loading compressed data from:', dataUrl);
                data = await response.json();
            } catch (gzError) {
                throw new Error(`Failed to load data from both sources. Uncompressed: ${e.message}, Compressed: ${gzError.message}`);
            }
        }

        // Validate data structure
        if (!data.p || !Array.isArray(data.p)) {
            throw new Error('Invalid data format: missing publications array');
        }
        if (!data.r || !Array.isArray(data.r)) {
            throw new Error('Invalid data format: missing researchers array');
        }
        if (!data.c || !Array.isArray(data.c)) {
            throw new Error('Invalid data format: missing clusters array');
        }

        console.log(`📊 Loaded ${data.p.length} publications, ${data.r.length} researchers, ${data.c.length} clusters`);
        app.data = data;

        updateLoadingProgress('Loading cluster themes...');

        // Load cluster themes and centers
        await loadClusterData();

        updateLoadingProgress('Processing data...');

        // Update UI with metadata
        app.elements.totalPapers.textContent = data.meta.totalPapers.toLocaleString();
        app.elements.totalResearchers.textContent = data.meta.totalResearchers;
        app.elements.totalClusters.textContent = data.meta.totalClusters;

        // Populate filter dropdowns
        populateFilters(data);

        updateLoadingProgress('Initializing visualization...');

        // Initialize Deck.gl visualization
        initializeDeckGL(data);

        updateLoadingProgress('Ready!');

        setTimeout(() => {
            hideLoading();
            console.log('✅ CADS Research Visualization - Loaded successfully!');
            console.log(`📊 Displaying ${data.p.length} publications from ${data.r.length} researchers`);
        }, 300);

    } catch (error) {
        console.error('Failed to load visualization:', error);
        showError('Loading Failed', `Could not load visualization data: ${error.message}`);
        hideLoading();
    }
}

// Populate filter dropdowns with data
function populateFilters(data) {
    // Populate researcher filter
    const researcherSelect = app.elements.researcherFilter;
    data.r.forEach(researcher => {
        const option = document.createElement('option');
        option.value = researcher.i;
        option.textContent = researcher.n;
        researcherSelect.appendChild(option);
    });

    // Populate cluster filter
    const clusterSelect = app.elements.clusterFilter;
    data.c.forEach(cluster => {
        const option = document.createElement('option');
        option.value = cluster.i;
        option.textContent = cluster.n;
        clusterSelect.appendChild(option);
    });
}

// Load cluster data (themes and centers)
async function loadClusterData() {
    try {
        console.log('🎨 Loading cluster themes...');
        // Try uncompressed first for local development
        let themesResponse;
        let themesUrl = '';
        try {
            themesUrl = '/data/cluster_themes.json';
            themesResponse = await fetch(themesUrl);
            if (themesResponse.ok) {
                const themesData = await themesResponse.json();
                app.clusterThemes = themesData.themes || themesData;
                console.log(`✅ Loaded ${Object.keys(app.clusterThemes).length} cluster themes from ${themesUrl}`);
            } else {
                throw new Error('Uncompressed themes not available');
            }
        } catch (e) {
            console.log('⚠️ Uncompressed themes failed, trying compressed...');
            try {
                themesUrl = '/data/cluster_themes.json.gz';
                themesResponse = await fetch(themesUrl);
                if (themesResponse.ok) {
                    const themesData = await themesResponse.json();
                    app.clusterThemes = themesData.themes || themesData;
                    console.log(`✅ Loaded ${Object.keys(app.clusterThemes).length} cluster themes from ${themesUrl}`);
                } else {
                    throw new Error('Compressed themes not available');
                }
            } catch (gzError) {
                console.warn(`⚠️ Failed to load cluster themes from both sources:`, e.message, gzError.message);
            }
        }

        console.log('📍 Loading cluster centers...');
        // Try uncompressed first for local development
        let centersResponse;
        let centersUrl = '';
        try {
            centersUrl = '/data/clustering_results.json';
            centersResponse = await fetch(centersUrl);
            if (centersResponse.ok) {
                const centersData = await centersResponse.json();
                app.clusterCenters = centersData.cluster_info || centersData;
                console.log(`✅ Loaded ${Object.keys(app.clusterCenters).length} cluster centers from ${centersUrl}`);
            } else {
                throw new Error('Uncompressed centers not available');
            }
        } catch (e) {
            console.log('⚠️ Uncompressed centers failed, trying compressed...');
            try {
                centersUrl = '/data/clustering_results.json.gz';
                centersResponse = await fetch(centersUrl);
                if (centersResponse.ok) {
                    const centersData = await centersResponse.json();
                    app.clusterCenters = centersData.cluster_info || centersData;
                    console.log(`✅ Loaded ${Object.keys(app.clusterCenters).length} cluster centers from ${centersUrl}`);
                } else {
                    throw new Error('Compressed centers not available');
                }
            } catch (gzError) {
                console.warn(`⚠️ Failed to load cluster centers from both sources:`, e.message, gzError.message);
            }
        }
    } catch (error) {
        console.warn('⚠️ Could not load cluster data:', error);
        // Continue without cluster labels if data is not available
        app.clusterThemes = {};
        app.clusterCenters = {};
    }
}

// Calculate optimal view state from publication coordinates
function calculateOptimalViewState(publications) {
    if (!publications || publications.length === 0) {
        console.warn('No publications data available for view state calculation');
        return {
            longitude: 0,
            latitude: 0,
            zoom: 8
        };
    }

    // Extract all publication positions
    const positions = publications.map(p => p.p).filter(pos => pos && pos.length >= 2);

    if (positions.length === 0) {
        console.warn('No valid position data found in publications');
        return {
            longitude: 0,
            latitude: 0,
            zoom: 8
        };
    }

    // Calculate bounds
    const bounds = {
        minX: Math.min(...positions.map(pos => pos[0])),
        maxX: Math.max(...positions.map(pos => pos[0])),
        minY: Math.min(...positions.map(pos => pos[1])),
        maxY: Math.max(...positions.map(pos => pos[1]))
    };

    // Calculate center point
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    // Calculate optimal zoom level based on data spread
    const dataWidth = bounds.maxX - bounds.minX;
    const dataHeight = bounds.maxY - bounds.minY;
    const maxSpread = Math.max(dataWidth, dataHeight);

    // Determine zoom level - smaller spread needs higher zoom, larger spread needs lower zoom
    // Add some padding by using a factor less than 1.0
    let optimalZoom;
    if (maxSpread === 0) {
        optimalZoom = 8; // Default zoom for single point
    } else if (maxSpread < 5) {
        optimalZoom = 7; // High zoom for tightly clustered data
    } else if (maxSpread < 15) {
        optimalZoom = 6; // Medium zoom for moderate spread
    } else if (maxSpread < 25) {
        optimalZoom = 5; // Lower zoom for wide spread
    } else {
        optimalZoom = 4; // Very low zoom for very wide spread
    }

    // Removed logging for better performance

    return {
        longitude: centerX,
        latitude: centerY,
        zoom: optimalZoom,
        bounds: bounds
    };
}

// Initialize Deck.gl visualization
function initializeDeckGL(data) {
    console.log(`🎯 Initializing DeckGL with ${data.p.length} publications`);

    // Calculate optimal view state from publication coordinates
    const optimalViewState = calculateOptimalViewState(data.p);

    // Removed logging for better performance

    // Store initial zoom level
    app.currentZoom = optimalViewState.zoom;

    // Create the Deck.gl instance
    app.deckgl = new deck.DeckGL({
        container: 'map-container',
        initialViewState: {
            longitude: optimalViewState.longitude,
            latitude: optimalViewState.latitude,
            zoom: optimalViewState.zoom,
            pitch: 0,
            bearing: 0
        },
        controller: true,
        layers: createAllLayers(data, data.p),
        onHover: handleHover,
        onClick: handleClick,
        onViewStateChange: handleViewStateChange,
        getCursor: () => 'crosshair'
    });

    // Update visible papers count
    app.elements.visiblePapers.textContent = data.p.length.toLocaleString();
}

// Handle view state changes (zoom, pan)
// Throttled layer update to prevent performance issues
let layerUpdateTimeout = null;

function handleViewStateChange({ viewState }) {
    const previousZoom = app.currentZoom;
    app.currentZoom = viewState.zoom;

    // Clear any pending updates
    if (layerUpdateTimeout) {
        clearTimeout(layerUpdateTimeout);
    }

    // Check if we've crossed a significant zoom threshold (simplified check)
    const zoomDifference = Math.abs(app.currentZoom - previousZoom);
    const crossedMajorThreshold = Math.floor(previousZoom) !== Math.floor(app.currentZoom);

    // Only update if we've made a significant zoom change
    if (crossedMajorThreshold && zoomDifference > 0.5) {
        // Throttle updates to prevent excessive re-rendering
        layerUpdateTimeout = setTimeout(() => {
            if (app.deckgl && app.data) {
                const currentData = getCurrentFilteredData();
                app.deckgl.setProps({
                    layers: createAllLayers(app.data, currentData)
                });
            }
        }, 100); // 100ms throttle
    }
}

// Get currently filtered data
function getCurrentFilteredData() {
    if (!app.data) return [];

    const researcherFilter = app.elements.researcherFilter.value;
    const clusterFilter = app.elements.clusterFilter.value;
    const yearFilter = parseInt(app.elements.yearFilter.value);

    let filteredData = app.data.p;

    if (researcherFilter) {
        filteredData = filteredData.filter(p => p.r === researcherFilter);
    }

    if (clusterFilter) {
        filteredData = filteredData.filter(p => p.c === parseInt(clusterFilter));
    }

    if (yearFilter) {
        filteredData = filteredData.filter(p => p.y >= yearFilter);
    }

    return filteredData;
}

// Create all layers (scatterplot + text labels)
function createAllLayers(fullData, publications) {
    const layers = [createScatterplotLayerWithData(fullData, publications)];

    // Add cluster theme labels if data is available and zoom level is appropriate
    if (app.clusterThemes && app.clusterCenters && shouldShowLabels()) {
        try {
            const labelLayer = createClusterLabelsLayer(fullData, publications);
            if (labelLayer) {
                layers.push(labelLayer);
            }
        } catch (error) {
            console.error('Error creating cluster labels layer:', error);
        }
    }

    return layers;
}

// Progressive disclosure configuration for zoom-based label visibility
const ZOOM_DISCLOSURE_CONFIG = {
    // Simplified zoom thresholds for better performance
    showLabelsZoom: 4,       // Minimum zoom to show any labels (lowered from 6)
    showAllZoom: 6,          // Zoom level to show all clusters (lowered from 8)
    majorClusterSize: 40,    // Major clusters (lowered from 50)
    minClusterSize: 20       // Minimum cluster size (lowered from 30)
};

// Simplified label visibility check
function shouldShowLabels() {
    const shouldShow = app.currentZoom >= ZOOM_DISCLOSURE_CONFIG.showLabelsZoom;
    console.log(`🔍 shouldShowLabels: zoom=${app.currentZoom.toFixed(1)}, threshold=${ZOOM_DISCLOSURE_CONFIG.showLabelsZoom}, result=${shouldShow}`);
    return shouldShow;
}

// Simplified cluster size threshold
function getClusterSizeThresholdForZoom(zoomLevel) {
    if (zoomLevel >= ZOOM_DISCLOSURE_CONFIG.showAllZoom) {
        return ZOOM_DISCLOSURE_CONFIG.minClusterSize;
    } else if (zoomLevel >= ZOOM_DISCLOSURE_CONFIG.showLabelsZoom) {
        return ZOOM_DISCLOSURE_CONFIG.majorClusterSize;
    } else {
        return Infinity;
    }
}

// Dynamic label sizing configuration
const LABEL_SIZE_CONFIG = {
    minSize: 8,          // Minimum readable label size (px) - for small clusters
    maxSize: 18,         // Maximum label size (px) - for major clusters
    scalingFactor: 1.2,  // Logarithmic scaling factor - slightly increased for better tier differentiation
    sizeThreshold: 25    // Minimum cluster size to show label (used as fallback)
};

// Calculate dynamic label size based on cluster paper count
function calculateLabelSize(clusterSize, minSize = LABEL_SIZE_CONFIG.minSize, maxSize = LABEL_SIZE_CONFIG.maxSize) {
    // Input validation
    if (!clusterSize || clusterSize < 1) {
        return minSize;
    }

    // Check cache first for performance
    const cacheKey = `${clusterSize}-${minSize}-${maxSize}`;
    if (app.labelSizeCache.has(cacheKey)) {
        return app.labelSizeCache.get(cacheKey);
    }

    // Logarithmic scaling algorithm
    // Use natural log to create smooth scaling curve
    const logSize = Math.log(clusterSize);
    const scaledSize = minSize + (logSize * LABEL_SIZE_CONFIG.scalingFactor);

    // Apply min/max constraints
    const constrainedSize = Math.max(minSize, Math.min(maxSize, scaledSize));

    // Round to nearest integer for pixel-perfect rendering
    const finalSize = Math.round(constrainedSize);

    // Cache the result for performance
    app.labelSizeCache.set(cacheKey, finalSize);

    return finalSize;
}

// Clear label size cache (called when configuration changes)
function clearLabelSizeCache() {
    app.labelSizeCache.clear();
}

// Invalidate cache entries for clusters that are no longer visible
// Simplified cache management
function clearLabelCacheIfNeeded() {
    if (app.labelSizeCache.size > 500) {
        app.labelSizeCache.clear();
    }
}

// Create cluster theme labels layer
function createClusterLabelsLayer(fullData, publications) {
    // Get unique clusters from current publications
    const visibleClusters = new Set(publications.map(p => p.c).filter(c => c !== -1));

    // Get the appropriate cluster size threshold for current zoom level
    const zoomThreshold = getClusterSizeThresholdForZoom(app.currentZoom);

    // Create label data for visible clusters (simplified for performance)
    const labelData = [];
    visibleClusters.forEach(clusterId => {
        const clusterInfo = app.clusterCenters[clusterId.toString()];
        const themeName = app.clusterThemes[clusterId.toString()];

        // Only show clusters that meet the zoom-based size threshold
        if (clusterInfo && themeName && clusterInfo.size >= zoomThreshold) {
            labelData.push({
                position: clusterInfo.center,
                text: themeName,
                clusterId: clusterId,
                size: clusterInfo.size
            });
        }
    });

    // Debug logging to check label creation
    console.log(`🏷️ Labels: ${labelData.length} created (zoom: ${app.currentZoom.toFixed(1)}, threshold: ${zoomThreshold})`);
    if (labelData.length === 0) {
        console.log(`🔍 Debug: visibleClusters=${visibleClusters.size}, clusterThemes=${!!app.clusterThemes}, clusterCenters=${!!app.clusterCenters}`);
    }

    // Check if TextLayer is available
    if (!deck.TextLayer) {
        console.warn('TextLayer not available in this Deck.gl version');
        return null;
    }

    return new deck.TextLayer({
        id: 'cluster-labels-layer',
        data: labelData,

        // Position
        getPosition: d => [d.position[0], d.position[1], 1], // Slightly elevated

        // Text properties
        getText: d => d.text,
        getSize: d => calculateLabelSize(d.size), // Dynamic size based on cluster size
        getColor: [255, 255, 255, 200], // White text with slight transparency

        // Font and styling
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',

        // Alignment
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',

        // Interaction
        pickable: false,

        // Performance
        updateTriggers: {
            getPosition: publications,
            getText: app.clusterThemes
        }
    });
}

// Create scatterplot layer with optimized data
function createScatterplotLayerWithData(fullData, publications) {
    return new deck.ScatterplotLayer({
        id: 'publications-layer',
        data: publications,

        // Position from pre-computed UMAP coordinates
        getPosition: d => [d.p[0], d.p[1], 0],

        // Size and color
        getRadius: 3,
        getFillColor: d => {
            const researcher = fullData.r.find(r => r.i === d.r);
            return researcher ? researcher.col : [128, 128, 128];
        },

        // Interaction
        pickable: true,
        autoHighlight: true,

        // Performance optimizations
        radiusMinPixels: 1,
        radiusMaxPixels: 12,

        // Update triggers for efficient re-rendering
        updateTriggers: {
            getFillColor: publications,
            getPosition: publications
        }
    });
}

// Handle hover events
function handleHover(info) {
    if (info.object && info.x !== undefined && info.y !== undefined) {
        const publication = info.object;
        const researcher = app.data.r.find(r => r.i === publication.r);
        const cluster = app.data.c.find(c => c.i === publication.c);

        const title = publication.t || 'Untitled';
        const details = `${researcher ? researcher.n : 'Unknown Author'} • ${publication.y || 'Unknown Year'}`;
        const meta = `${publication.cit || 0} citations • ${cluster ? cluster.n : 'Uncategorized'}`;

        showTooltip(info.x, info.y, title, details, meta);
    } else {
        hideTooltip();
    }
}

// Handle click events
function handleClick(info) {
    if (info.object) {
        const publication = info.object;
        // Removed logging for better performance

        // Could implement paper details modal here
        if (publication.d) {
            // Open DOI link if available
            window.open(`https://doi.org/${publication.d}`, '_blank');
        }
    }
}

// Apply filters to the visualization
function applyFilters() {
    if (!app.deckgl || !app.data) return;

    const filteredData = getCurrentFilteredData();

    // Update layers with filtered data
    app.deckgl.setProps({
        layers: createAllLayers(app.data, filteredData)
    });

    // Update visible papers count
    app.elements.visiblePapers.textContent = filteredData.length.toLocaleString();
}

// Perform search (placeholder - would need search index implementation)
function performSearch(query) {
    if (!query.trim()) {
        // Reset to show all data
        applyFilters();
        return;
    }

    // Removed logging for better performance
    // TODO: Implement search functionality with search index
    // For now, just apply current filters
    applyFilters();
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Expose functions and app object globally for debugging and error handling
window.CADSVisualization = app;
window.showError = showError;