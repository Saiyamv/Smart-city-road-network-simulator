# 🚦 Smart City Road Network Simulator

A Data Structures and Algorithms (DSA) shortest-path navigation simulator using **Dijkstra's Algorithm** and **A* Search Algorithm**, featuring a high-performance C++ graph engine, a Node.js API bridge, and an interactive SVG web visualization.

---

## 📌 Project Overview

Navigation systems in modern smart cities calculate optimal travel paths across complex road networks. In this project:
- **Intersections / Points of Interest** are modeled as **graph vertices (nodes)** with coordinate positioning.
- **Road segments** are modeled as **weighted undirected edges** where weights represent distance (in kilometers).
- Route planning is executed using:
  - **Dijkstra's Algorithm**: Guarantees the mathematically optimal shortest path using a Min-Heap Priority Queue.
  - **A* Search Algorithm**: Uses an admissible and consistent heuristic (scaled Euclidean distance) to direct the search toward the destination, reducing explored nodes while preserving 100% path optimality.

---

## 🏗️ Project Architecture

```text
Smart-city-road-network-simulator/
├── cpp/                           # High-performance C++17 graph engine
│   ├── graph.h                    # Graph declaration (adjacency list, Dijkstra, A*)
│   ├── graph.cpp                  # Graph implementation & admissible heuristic scaling
│   ├── main.cpp                   # CLI interface & JSON output for backend
│   └── simulator.exe              # Compiled C++ executable
│
├── backend/                       # Node.js backend API bridge
│   ├── server.js                  # Zero-dependency HTTP static & API server
│   └── package.json               # Backend configuration
│
├── frontend/                      # Interactive browser application
│   ├── index.html                 # UI layout with control panel, legend & modals
│   ├── style.css                  # Modern responsive design
│   └── app.js                     # SVG map rendering & offline client fallback
│
├── main.cpp                       # Fundamental 5-node prototype entry point
├── graph.h                        # Fundamental 5-node graph header
├── graph.cpp                      # Fundamental 5-node graph implementation with Dijkstra
├── smart_city_dijkstra.cpp        # Standalone console-based Dijkstra demonstration
├── index.html                     # Root redirect to full web simulator
├── index2.html                    # Basic 5-node HTML shell
├── package.json                   # Root NPM scripts (build, start, test)
└── README.md                      # Documentation
```

---

## ⚡ Quick Start

### 1. Run the Full Web Application (Frontend + Backend + C++)

Run using Node.js:

```bash
# Build the C++ engine
npm run build

# Start the Node.js server
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> **Zero Dependencies:** The Node.js server uses built-in standard library modules (`http`, `url`, `fs`, `child_process`). No `npm install` is required!

### 2. Standalone Frontend (No Server Required)

You can also directly open `frontend/index.html` in any modern web browser (e.g., via double click or `file:///`). The application features an automatic **in-browser client fallback** that computes Dijkstra and A* routes directly if the backend server is offline.

### 3. Run C++ Engine from Terminal

```bash
cd cpp
g++ -std=c++17 main.cpp graph.cpp -o simulator.exe

# Usage: simulator.exe <source> <destination> <algorithm>
./simulator.exe "City Center" "Airport" dijkstra
./simulator.exe "City Center" "Airport" astar
```

Output:
```json
{
  "source": "City Center",
  "destination": "Airport",
  "algorithm": "astar",
  "distance": 11.50,
  "nodesExplored": 16,
  "steps": ["City Center", "East Junction", "Airport"],
  "durationMs": 0.015
}
```

### 4. Run the 5-Location Terminal Prototype

```bash
g++ -std=c++17 main.cpp graph.cpp -o simulator.exe
./simulator.exe
```

---

## 🧠 Algorithms & Mathematical Guarantees

### Dijkstra's Algorithm
- Operates on non-negative edge weights.
- Uses `std::priority_queue<std::pair<double, int>, ..., std::greater<...>>` to greedily expand the closest unvisited intersection.
- Time Complexity: $\mathcal{O}((V + E) \log V)$
- Space Complexity: $\mathcal{O}(V)$

### A* Search Algorithm
- Minimizes evaluation function $f(n) = g(n) + h(n)$, where $g(n)$ is the exact distance from the origin and $h(n)$ is the heuristic estimate to the destination.
- **Heuristic Admissibility & Consistency Guarantee**:
  To ensure A* never overestimates remaining cost (which would cause suboptimal routes), the Euclidean distance is dynamically scaled by:
  $$\alpha = \min_{(u, v) \in E} \frac{\text{weight}(u, v)}{\text{euclidean}(u, v)}$$
  By triangle inequality, $h(u) \le \text{weight}(u, v) + h(v)$ holds strictly for every edge in the graph, mathematically ensuring **100% path optimality** matching Dijkstra while expanding fewer nodes.

---

## 📊 Features

- 🚦 **20 Intersections & 43 Roads:** Comprehensive sample metropolitan road network.
- 🗺️ **Interactive SVG Map:** Click on any node on the map to set Start or Destination, with animated route tracing.
- ⚖️ **Side-by-side Comparison Mode:** Compare Dijkstra vs A* execution time, nodes explored, and route distance.
- 🔁 **Start/Dest Swap Button:** Rapidly reverse routes with one click.
- 🛡️ **Offline Resilient:** Transparent client fallback if backend is offline.
