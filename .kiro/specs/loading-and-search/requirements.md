# Requirements Document

Here are the two priority fixes needed for the application.

---

### 1. Fix the Initial View

The main goal is that **the entire visualization should be clearly visible when the app first loads.**

* **Current Problem:** When the app opens, the visualization is "off-screen" or too zoomed in. Users have to manually zoom out to see the network graph.

* **Requirement:** By default, the visualization should be automatically centered and zoomed to fit the screen right after the page loads. No manual zooming should be necessary.

#### **Acceptance Criteria (How to know it's done):**
- [ ] On page load, the entire network graph is visible.
- [ ] The graph is centered in the available space.
- [ ] The user does not need to zoom or pan to see the whole picture.

---

### 2. Implement Word Cloud-Style Theme Labels

The main goal is that **theme labels should be sized proportionally to the number of papers in each cluster, creating a word cloud effect.**

* **Current Problem:** All theme labels appear at the same size regardless of how many papers are in that research theme cluster.

* **Requirement:** Theme labels should scale in size based on the number of papers in their cluster - larger clusters get bigger labels, smaller clusters get smaller labels.

#### **Acceptance Criteria (How to know it's done):**
- [ ] Theme labels with more papers appear larger than those with fewer papers.
- [ ] The size scaling should be visually proportional and intuitive (e.g., a 200-paper theme should be noticeably larger than a 33-paper theme).
- [ ] Labels should remain readable at all sizes (minimum readable size enforced).
- [ ] The word cloud effect should be immediately apparent when viewing the visualization.
- [ ] Label sizes should update appropriately when filters are applied (showing only relevant clusters).

---

### 3. Make the Search Box Functional

The main goal is that **typing in the search box should filter the visualization.**

* **Current Problem:** Typing a search term (e.g., "tahir") in the search box does nothing. The visualization only updates when using the dropdown filters (like "Researcher"), not the main search input.

* **Requirement:** The search box must actively filter the nodes on the graph based on the user's query.

#### **Acceptance Criteria (How to know it's done):**
- [ ] As the user types in the search box, the visualization updates in real-time to show only matching results.
- [ ] The search should look for matches in **researcher names**, **paper titles**, and **research themes**.
- [ ] The search should not be case-sensitive (e.g., "tahir" should find "Tahir").
- [ ] Clearing the search box should restore the visualization to its previous state (e.g., showing all themes).
- [ ] If no results are found, display a simple "No results found" message.