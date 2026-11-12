// Automated verification test: compares Dijkstra and A* across all 190 location pairs
const { execFileSync } = require('child_process');
const path = require('path');

const exeExt = process.platform === 'win32' ? '.exe' : '';
const simPath = path.resolve(__dirname, '..', 'cpp', `simulator${exeExt}`);

const locations = [
  "City Center", "North Park", "South Colony", "East Junction", "West End",
  "Railway Station", "Bus Terminal", "City Hospital", "University", "Tech Park",
  "Airport", "Shopping Mall", "Industrial Area", "Green Valley", "Lake View",
  "Stadium", "Museum", "Old Town", "Fire Station", "Market Square"
];

console.log('Running Smart City Simulator test suite...');
console.log(`Testing binary: ${simPath}`);

let totalTests = 0;
let mismatches = 0;
let aStarFewerNodes = 0;

for (let i = 0; i < locations.length; i++) {
  for (let j = i + 1; j < locations.length; j++) {
    totalTests++;
    const src = locations[i];
    const dest = locations[j];

    const outDijkstra = execFileSync(simPath, [src, dest, 'dijkstra']).toString();
    const outAStar = execFileSync(simPath, [src, dest, 'astar']).toString();

    const dRes = JSON.parse(outDijkstra);
    const aRes = JSON.parse(outAStar);

    if (Math.abs(dRes.distance - aRes.distance) > 0.001) {
      mismatches++;
      console.error(`FAIL: ${src} -> ${dest}: Dijkstra=${dRes.distance} km, A*=${aRes.distance} km`);
    }

    if (aRes.nodesExplored < dRes.nodesExplored) {
      aStarFewerNodes++;
    }
  }
}

console.log('----------------------------------------');
console.log(`Total pair queries tested: ${totalTests}`);
console.log(`Distance mismatches:        ${mismatches}`);
console.log(`A* explored fewer nodes:    ${aStarFewerNodes} / ${totalTests} (${((aStarFewerNodes/totalTests)*100).toFixed(1)}%)`);

if (mismatches === 0) {
  console.log('PASSED: All 190 pairs found 100% optimal routes with zero discrepancy.');
  process.exit(0);
} else {
  console.error(`FAILED: Found ${mismatches} suboptimal route discrepancies.`);
  process.exit(1);
}
