// Frontend JavaScript for Smart City Road Network Simulator

// 20 locations matching C++ backend
const locations = [
  { name: "City Center", x: 0, y: 0 },
  { name: "North Park", x: 0, y: 5 },
  { name: "South Colony", x: 0, y: -5 },
  { name: "East Junction", x: 5, y: 0 },
  { name: "West End", x: -5, y: 0 },
  { name: "Railway Station", x: -2, y: 2 },
  { name: "Bus Terminal", x: 2, y: -2 },
  { name: "City Hospital", x: -1, y: -3 },
  { name: "University", x: 3, y: 3 },
  { name: "Tech Park", x: 6, y: 4 },
  { name: "Airport", x: 8, y: -1 },
  { name: "Shopping Mall", x: 4, y: -4 },
  { name: "Industrial Area", x: -6, y: -3 },
  { name: "Green Valley", x: -4, y: 4 },
  { name: "Lake View", x: 1, y: 6 },
  { name: "Stadium", x: -3, y: 1 },
  { name: "Museum", x: 5, y: -5 },
  { name: "Old Town", x: -5, y: 5 },
  { name: "Fire Station", x: -2, y: -6 },
  { name: "Market Square", x: 0, y: 3 }
];

// Road network matching C++ graph (undirected, with distances in km)
const roads = [
  { u: "City Center", v: "North Park", w: 4.0 },
  { u: "City Center", v: "South Colony", w: 5.0 },
  { u: "City Center", v: "East Junction", w: 6.0 },
  { u: "City Center", v: "West End", w: 5.5 },
  { u: "City Center", v: "Market Square", w: 2.5 },
  { u: "North Park", v: "Green Valley", w: 3.0 },
  { u: "North Park", v: "Lake View", w: 2.2 },
  { u: "North Park", v: "University", w: 4.5 },
  { u: "North Park", v: "Old Town", w: 3.8 },
  { u: "South Colony", v: "Industrial Area", w: 4.0 },
  { u: "South Colony", v: "Fire Station", w: 3.5 },
  { u: "South Colony", v: "Bus Terminal", w: 4.2 },
  { u: "South Colony", v: "City Hospital", w: 5.0 },
  { u: "East Junction", v: "Tech Park", w: 3.0 },
  { u: "East Junction", v: "Airport", w: 5.5 },
  { u: "East Junction", v: "Museum", w: 4.0 },
  { u: "East Junction", v: "Shopping Mall", w: 2.8 },
  { u: "West End", v: "Industrial Area", w: 5.0 },
  { u: "West End", v: "Railway Station", w: 3.5 },
  { u: "West End", v: "Stadium", w: 4.0 },
  { u: "Railway Station", v: "City Hospital", w: 3.2 },
  { u: "Railway Station", v: "Stadium", w: 2.5 },
  { u: "Railway Station", v: "Old Town", w: 4.5 },
  { u: "Bus Terminal", v: "Shopping Mall", w: 3.0 },
  { u: "Bus Terminal", v: "Airport", w: 4.2 },
  { u: "Bus Terminal", v: "City Hospital", w: 2.8 },
  { u: "City Hospital", v: "Fire Station", w: 3.5 },
  { u: "City Hospital", v: "Museum", w: 5.0 },
  { u: "University", v: "Tech Park", w: 2.2 },
  { u: "University", v: "Lake View", w: 3.0 },
  { u: "Tech Park", v: "Airport", w: 3.8 },
  { u: "Tech Park", v: "Museum", w: 4.5 },
  { u: "Shopping Mall", v: "Museum", w: 2.0 },
  { u: "Shopping Mall", v: "Market Square", w: 2.5 },
  { u: "Industrial Area", v: "Stadium", w: 4.2 },
  { u: "Industrial Area", v: "Fire Station", w: 5.0 },
  { u: "Green Valley", v: "Old Town", w: 2.5 },
  { u: "Green Valley", v: "Lake View", w: 4.0 },
  { u: "Lake View", v: "Old Town", w: 3.2 },
  { u: "Lake View", v: "Market Square", w: 2.8 },
  { u: "Stadium", v: "Museum", w: 3.5 },
  { u: "Stadium", v: "Market Square", w: 4.0 },
  { u: "Fire Station", v: "Market Square", w: 3.0 }
];

// DOM references
const startSelect = document.getElementById('start');
const endSelect = document.getElementById('end');
const algoSelect = document.getElementById('algo');
const findBtn = document.getElementById('findBtn');
const resetBtn = document.getElementById('resetBtn');
const swapBtn = document.getElementById('swapBtn');
const resultDiv = document.getElementById('result');
const mapSvg = document.getElementById('map');
const tooltip = document.getElementById('tooltip');
const aboutModal = document.getElementById('aboutModal');
const navAbout = document.getElementById('navAbout');
const modalClose = document.getElementById('modalClose');

// Populate dropdowns with sensible initial defaults (different start & end)
locations.forEach((loc, idx) => {
  const opt1 = new Option(loc.name, loc.name);
  const opt2 = new Option(loc.name, loc.name);
  startSelect.add(opt1);
  endSelect.add(opt2);
});

// Set default: Start at "City Center", Destination at "Airport"
startSelect.value = "City Center";
endSelect.value = "Airport";

// Build adjacency list for client-side fallback solver
const adj = new Map();
locations.forEach(l => adj.set(l.name, []));
roads.forEach(r => {
  adj.get(r.u).push({ to: r.v, weight: r.w });
  adj.get(r.v).push({ to: r.u, weight: r.w });
});

function getEuclideanDistance(nameA, nameB) {
  const a = locations.find(l => l.name === nameA);
  const b = locations.find(l => l.name === nameB);
  if (!a || !b) return 0;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Compute safe heuristic scale factor
function computeClientHeuristicScale() {
  let minRatio = 1.0;
  let found = false;
  roads.forEach(r => {
    const d = getEuclideanDistance(r.u, r.v);
    if (d > 1e-6) {
      const ratio = r.w / d;
      if (!found || ratio < minRatio) {
        minRatio = ratio;
        found = true;
      }
    }
  });
  return found ? Math.min(1.0, minRatio * 0.999) : 1.0;
}
const CLIENT_HEURISTIC_SCALE = computeClientHeuristicScale();

// Client fallback Dijkstra solver
function solveClientDijkstra(src, dest) {
  const t0 = performance.now();
  const dist = new Map();
  const prev = new Map();
  const visited = new Set();
  locations.forEach(l => dist.set(l.name, Infinity));
  dist.set(src, 0);

  const pq = [{ node: src, d: 0 }];
  let explored = 0;

  while (pq.length > 0) {
    pq.sort((a, b) => a.d - b.d);
    const { node: u, d } = pq.shift();

    if (visited.has(u)) continue;
    visited.add(u);
    explored++;

    if (u === dest) break;

    for (const edge of adj.get(u)) {
      if (visited.has(edge.to)) continue;
      const nd = d + edge.weight;
      if (nd < dist.get(edge.to)) {
        dist.set(edge.to, nd);
        prev.set(edge.to, u);
        pq.push({ node: edge.to, d: nd });
      }
    }
  }

  const durationMs = performance.now() - t0;
  if (!visited.has(dest) && src !== dest) {
    return { error: 'No route found connecting ' + src + ' and ' + dest };
  }

  const steps = [];
  for (let at = dest; at !== undefined; at = prev.get(at)) {
    steps.push(at);
    if (at === src) break;
  }
  steps.reverse();

  return {
    source: src,
    destination: dest,
    algorithm: 'dijkstra',
    distance: dist.get(dest),
    nodesExplored: explored,
    steps,
    durationMs,
    clientFallback: true
  };
}

// Client fallback A* solver
function solveClientAStar(src, dest) {
  const t0 = performance.now();
  const gScore = new Map();
  const prev = new Map();
  const closed = new Set();

  locations.forEach(l => gScore.set(l.name, Infinity));
  gScore.set(src, 0);

  const h = (node) => CLIENT_HEURISTIC_SCALE * getEuclideanDistance(node, dest);
  const open = [{ node: src, f: h(src) }];
  let explored = 0;

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const { node: u } = open.shift();

    if (closed.has(u)) continue;
    closed.add(u);
    explored++;

    if (u === dest) break;

    for (const edge of adj.get(u)) {
      if (closed.has(edge.to)) continue;
      const tg = gScore.get(u) + edge.weight;
      if (tg < gScore.get(edge.to)) {
        gScore.set(edge.to, tg);
        prev.set(edge.to, u);
        const f = tg + h(edge.to);
        open.push({ node: edge.to, f });
      }
    }
  }

  const durationMs = performance.now() - t0;
  if (!closed.has(dest) && src !== dest) {
    return { error: 'No route found connecting ' + src + ' and ' + dest };
  }

  const steps = [];
  for (let at = dest; at !== undefined; at = prev.get(at)) {
    steps.push(at);
    if (at === src) break;
  }
  steps.reverse();

  return {
    source: src,
    destination: dest,
    algorithm: 'astar',
    distance: gScore.get(dest),
    nodesExplored: explored,
    steps,
    durationMs,
    clientFallback: true
  };
}

// Check if edge is in highlighted path
function isRoadInPath(u, v, path) {
  if (!path || path.length < 2) return false;
  for (let i = 0; i < path.length - 1; i++) {
    if ((path[i] === u && path[i + 1] === v) || (path[i] === v && path[i + 1] === u)) {
      return true;
    }
  }
  return false;
}

// SVG Visualization rendering
function drawGraph(highlightPath = []) {
  while (mapSvg.firstChild) mapSvg.removeChild(mapSvg.firstChild);

  const currentStart = startSelect.value;
  const currentDest = endSelect.value;

  // Defs for filters and markers
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  mapSvg.appendChild(defs);

  // 1. Draw base roads
  roads.forEach(road => {
    const from = locations.find(l => l.name === road.u);
    const to = locations.find(l => l.name === road.v);
    const inPath = isRoadInPath(road.u, road.v, highlightPath);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', from.x);
    line.setAttribute('y1', -from.y);
    line.setAttribute('x2', to.x);
    line.setAttribute('y2', -to.y);
    line.setAttribute('stroke', inPath ? '#0066ff' : '#cbd5e1');
    line.setAttribute('stroke-width', inPath ? '0.22' : '0.08');
    line.setAttribute('stroke-linecap', 'round');
    if (inPath) {
      line.setAttribute('class', 'path-line');
    }

    // Hover tooltip for road
    line.style.cursor = 'pointer';
    line.addEventListener('mouseenter', (e) => {
      showTooltip(e, `${road.u} ⇄ ${road.v}: ${road.w.toFixed(1)} km`);
    });
    line.addEventListener('mousemove', moveTooltip);
    line.addEventListener('mouseleave', hideTooltip);

    mapSvg.appendChild(line);
  });

  // 2. Draw nodes and labels
  locations.forEach(loc => {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'map-node');
    group.style.cursor = 'pointer';

    const isStart = loc.name === currentStart;
    const isDest = loc.name === currentDest;
    const inPath = highlightPath.includes(loc.name);

    let fillColor = '#ffffff';
    let strokeColor = '#475569';
    let radius = 0.35;

    if (isStart) {
      fillColor = '#10b981'; // Green
      strokeColor = '#065f46';
      radius = 0.45;
    } else if (isDest) {
      fillColor = '#ef4444'; // Red
      strokeColor = '#991b1b';
      radius = 0.45;
    } else if (inPath) {
      fillColor = '#38bdf8'; // Sky blue
      strokeColor = '#0284c7';
      radius = 0.38;
    }

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', loc.x);
    circle.setAttribute('cy', -loc.y);
    circle.setAttribute('r', radius);
    circle.setAttribute('fill', fillColor);
    circle.setAttribute('stroke', strokeColor);
    circle.setAttribute('stroke-width', '0.07');
    group.appendChild(circle);

    // Node label text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    let textX = loc.x;
    let textY = -loc.y - 0.45;
    let textAnchor = 'middle';

    // Optimize label position based on location coordinates
    if (loc.x > 5) {
      textAnchor = 'end';
      textX = loc.x - 0.5;
      textY = -loc.y + 0.1;
    } else if (loc.x < -4) {
      textAnchor = 'start';
      textX = loc.x + 0.5;
      textY = -loc.y + 0.1;
    } else if (loc.y < -4) {
      textY = -loc.y + 0.65;
    }

    text.setAttribute('x', textX);
    text.setAttribute('y', textY);
    text.setAttribute('text-anchor', textAnchor);
    text.setAttribute('font-size', '0.48');
    text.setAttribute('font-weight', (isStart || isDest || inPath) ? '700' : '500');
    text.setAttribute('fill', (isStart || isDest) ? '#0f172a' : '#334155');
    text.setAttribute('class', 'node-label');
    text.textContent = loc.name;
    group.appendChild(text);

    // Interactive node selection via click
    group.addEventListener('click', () => {
      handleNodeClick(loc.name);
    });

    group.addEventListener('mouseenter', (e) => {
      showTooltip(e, `<strong>${loc.name}</strong><br>Coords: (${loc.x}, ${loc.y})<br><em>Click to set Start/Dest</em>`);
    });
    group.addEventListener('mousemove', moveTooltip);
    group.addEventListener('mouseleave', hideTooltip);

    mapSvg.appendChild(group);
  });
}

function handleNodeClick(nodeName) {
  if (startSelect.value !== nodeName && endSelect.value !== nodeName) {
    // If end is currently set, set end to clicked node
    endSelect.value = nodeName;
  } else if (startSelect.value === nodeName) {
    // Toggle
    return;
  } else if (endSelect.value === nodeName) {
    // Toggle
    return;
  }
  drawGraph();
}

function showTooltip(e, html) {
  tooltip.innerHTML = html;
  tooltip.style.display = 'block';
  moveTooltip(e);
}

function moveTooltip(e) {
  tooltip.style.left = (e.pageX + 12) + 'px';
  tooltip.style.top = (e.pageY + 12) + 'px';
}

function hideTooltip() {
  tooltip.style.display = 'none';
}

// Calculate route handler
async function calculateRoute() {
  const source = startSelect.value;
  const dest = endSelect.value;
  const algo = algoSelect.value;

  if (!source || !dest) {
    showError('Please select both a start location and destination.');
    return;
  }

  if (source === dest) {
    showError('Start location and destination cannot be identical. Please choose two distinct locations.');
    return;
  }

  resultDiv.className = 'result card loading';
  resultDiv.innerHTML = '<div class="spinner"></div> Calculating optimal route...';

  try {
    // Attempt backend fetch
    const query = new URLSearchParams({ source, destination: dest, algorithm: algo }).toString();
    const response = await fetch(`/api/route?${query}`, { signal: AbortSignal.timeout(2500) });
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }
    const data = await response.json();
    if (data.error) {
      showError(data.error);
      drawGraph();
      return;
    }
    displayResult(data);
  } catch (err) {
    // Graceful offline client fallback
    console.warn('Backend unavailable, executing in-browser client fallback:', err.message);
    if (algo === 'compare') {
      const dRes = solveClientDijkstra(source, dest);
      const aRes = solveClientAStar(source, dest);
      displayResult({
        compare: true,
        source,
        destination: dest,
        dijkstra: dRes,
        astar: aRes,
        clientFallback: true
      });
    } else if (algo === 'astar') {
      const data = solveClientAStar(source, dest);
      displayResult(data);
    } else {
      const data = solveClientDijkstra(source, dest);
      displayResult(data);
    }
  }
}

function displayResult(data) {
  resultDiv.className = 'result card success';

  if (data.compare) {
    const d = data.dijkstra;
    const a = data.astar;
    const fallbackBadge = data.clientFallback ? '<span class="badge badge-warning">Client Fallback</span>' : '<span class="badge badge-success">C++ Engine</span>';

    resultDiv.innerHTML = `
      <div class="result-header">
        <h3>Algorithm Comparison: Dijkstra vs A*</h3>
        ${fallbackBadge}
      </div>
      <p>From <strong class="text-green">${data.source}</strong> to <strong class="text-red">${data.destination}</strong></p>
      
      <div class="table-responsive">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Dijkstra's Algorithm</th>
              <th>A* Search</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Shortest Distance</strong></td>
              <td><strong>${d.distance.toFixed(2)} km</strong></td>
              <td><strong>${a.distance.toFixed(2)} km</strong></td>
            </tr>
            <tr>
              <td><strong>Roads Traversed</strong></td>
              <td>${d.steps.length - 1} roads</td>
              <td>${a.steps.length - 1} roads</td>
            </tr>
            <tr>
              <td><strong>Nodes Explored</strong></td>
              <td>${d.nodesExplored !== undefined ? d.nodesExplored : 'N/A'}</td>
              <td><span class="highlight-better">${a.nodesExplored !== undefined ? a.nodesExplored : 'N/A'}</span></td>
            </tr>
            <tr>
              <td><strong>Execution Time</strong></td>
              <td>${d.durationMs < 0.05 ? '< 0.05 ms' : d.durationMs.toFixed(3) + ' ms'}</td>
              <td>${a.durationMs < 0.05 ? '< 0.05 ms' : a.durationMs.toFixed(3) + ' ms'}</td>
            </tr>
            <tr>
              <td><strong>Optimal Path</strong></td>
              <td class="path-cell">${d.steps.join(' → ')}</td>
              <td class="path-cell">${a.steps.join(' → ')}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="summary-note">🎯 <em>Both algorithms find the mathematically optimal route. A* evaluates heuristic estimates to prune unpromising paths faster.</em></p>
    `;
    drawGraph(a.steps || d.steps);
    return;
  }

  const steps = data.steps;
  const distance = data.distance.toFixed(2);
  const duration = data.durationMs < 0.05 ? '< 0.05 ms' : data.durationMs.toFixed(3) + ' ms';
  const algoTitle = data.algorithm === 'astar' ? 'A* Search Algorithm' : "Dijkstra's Algorithm";
  const badge = data.clientFallback ? '<span class="badge badge-warning">Client Fallback</span>' : '<span class="badge badge-success">C++ Engine</span>';

  resultDiv.innerHTML = `
    <div class="result-header">
      <h3>Optimal Route Found</h3>
      ${badge}
    </div>
    <div class="result-details">
      <div class="metric-badge">
        <span class="metric-label">Algorithm</span>
        <span class="metric-val">${algoTitle}</span>
      </div>
      <div class="metric-badge">
        <span class="metric-label">Total Distance</span>
        <span class="metric-val text-primary">${distance} km</span>
      </div>
      <div class="metric-badge">
        <span class="metric-label">Roads Count</span>
        <span class="metric-val">${steps.length - 1}</span>
      </div>
      <div class="metric-badge">
        <span class="metric-label">Nodes Explored</span>
        <span class="metric-val">${data.nodesExplored !== undefined ? data.nodesExplored : 'N/A'}</span>
      </div>
      <div class="metric-badge">
        <span class="metric-label">Computation Time</span>
        <span class="metric-val">${duration}</span>
      </div>
    </div>
    <div class="path-display">
      <strong>Route Path:</strong>
      <div class="path-chain">${steps.map((s, idx) => `<span class="path-stop ${idx === 0 ? 'stop-start' : idx === steps.length - 1 ? 'stop-dest' : ''}">${s}</span>`).join(' <span class="arrow">→</span> ')}</div>
    </div>
  `;

  drawGraph(steps);
}

function showError(msg) {
  resultDiv.className = 'result card error';
  resultDiv.innerHTML = `<strong>⚠️ Route Calculation Notice:</strong><p>${msg}</p>`;
}

// Event Listeners
findBtn.addEventListener('click', calculateRoute);

swapBtn.addEventListener('click', () => {
  const tmp = startSelect.value;
  startSelect.value = endSelect.value;
  endSelect.value = tmp;
  drawGraph();
  if (resultDiv.classList.contains('success')) {
    calculateRoute();
  }
});

resetBtn.addEventListener('click', () => {
  startSelect.value = "City Center";
  endSelect.value = "Airport";
  algoSelect.value = "dijkstra";
  resultDiv.className = 'result card';
  resultDiv.innerHTML = '<p class="text-muted">Select your starting intersection and destination, then click <strong>Find Shortest Route</strong>.</p>';
  drawGraph();
});

startSelect.addEventListener('change', () => drawGraph());
endSelect.addEventListener('change', () => drawGraph());

// Modal controls
navAbout.addEventListener('click', (e) => {
  e.preventDefault();
  aboutModal.style.display = 'block';
});
modalClose.addEventListener('click', () => {
  aboutModal.style.display = 'none';
});
window.addEventListener('click', (e) => {
  if (e.target === aboutModal) {
    aboutModal.style.display = 'none';
  }
});

// Initial draw and helper text
resultDiv.innerHTML = '<p class="text-muted">Select your starting intersection and destination, then click <strong>Find Shortest Route</strong>.</p>';
drawGraph();
