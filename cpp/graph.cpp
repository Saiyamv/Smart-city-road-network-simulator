#include "graph.h"
#include <iostream>
#include <queue>
#include <algorithm>
#include <cmath>
#include <limits>

bool Graph::addLocation(const string &name, double x, double y) {
    if (nameToId.count(name)) return false;
    int id = static_cast<int>(locations.size());
    locations.push_back({name, x, y});
    nameToId[name] = id;
    adj.emplace_back();
    return true;
}

bool Graph::addRoad(const string &from, const string &to, double km) {
    int a = getId(from);
    int b = getId(to);
    if (a == -1 || b == -1) return false;
    adj[a].push_back({b, km});
    adj[b].push_back({a, km});
    return true;
}

int Graph::getId(const string &name) const {
    auto it = nameToId.find(name);
    return it == nameToId.end() ? -1 : it->second;
}

const LocationInfo* Graph::getLocationInfo(int id) const {
    if (id < 0 || id >= static_cast<int>(locations.size())) return nullptr;
    return &locations[id];
}

static double euclidean(const LocationInfo *a, const LocationInfo *b) {
    if (!a || !b) return 0.0;
    double dx = a->x - b->x;
    double dy = a->y - b->y;
    return sqrt(dx * dx + dy * dy);
}

double Graph::computeHeuristicScale() const {
    double minRatio = 1.0;
    bool found = false;
    for (int u = 0; u < vertexCount(); ++u) {
        for (const Edge &e : adj[u]) {
            double d = euclidean(&locations[u], &locations[e.to]);
            if (d > 1e-6) {
                double ratio = e.weight / d;
                if (!found || ratio < minRatio) {
                    minRatio = ratio;
                    found = true;
                }
            }
        }
    }
    // Scale heuristic so that scale * dist <= road_weight for all edges.
    // This mathematically guarantees monotonicity/consistency and admissibility.
    return found ? min(1.0, minRatio * 0.999) : 1.0;
}

PathResult Graph::dijkstra(int srcId, int destId) const {
    const double INF = numeric_limits<double>::infinity();
    if (srcId < 0 || srcId >= vertexCount() || destId < 0 || destId >= vertexCount()) {
        return {INF, {}, 0};
    }
    if (srcId == destId) {
        return {0.0, {srcId}, 1};
    }

    vector<double> dist(vertexCount(), INF);
    vector<int> prev(vertexCount(), -1);
    vector<bool> visited(vertexCount(), false);

    using Node = pair<double, int>; // distance, vertex
    priority_queue<Node, vector<Node>, greater<Node>> pq;

    dist[srcId] = 0.0;
    pq.push({0.0, srcId});
    int explored = 0;

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (visited[u]) continue;
        visited[u] = true;
        explored++;

        if (u == destId) break;

        for (const Edge &e : adj[u]) {
            if (visited[e.to]) continue;
            double nd = d + e.weight;
            if (nd < dist[e.to]) {
                dist[e.to] = nd;
                prev[e.to] = u;
                pq.push({nd, e.to});
            }
        }
    }

    if (dist[destId] == INF) return {INF, {}, explored};

    vector<int> path;
    for (int at = destId; at != -1; at = prev[at])
        path.push_back(at);
    reverse(path.begin(), path.end());
    return {dist[destId], path, explored};
}

PathResult Graph::aStar(int srcId, int destId) const {
    const double INF = numeric_limits<double>::infinity();
    if (srcId < 0 || srcId >= vertexCount() || destId < 0 || destId >= vertexCount()) {
        return {INF, {}, 0};
    }
    if (srcId == destId) {
        return {0.0, {srcId}, 1};
    }

    const double scale = computeHeuristicScale();
    auto h = [&](int u) -> double {
        return scale * euclidean(getLocationInfo(u), getLocationInfo(destId));
    };

    vector<double> gScore(vertexCount(), INF);
    vector<int> prev(vertexCount(), -1);
    vector<bool> closed(vertexCount(), false);

    using Node = pair<double, int>; // fScore, vertex
    priority_queue<Node, vector<Node>, greater<Node>> open;

    gScore[srcId] = 0.0;
    open.push({h(srcId), srcId});
    int explored = 0;

    while (!open.empty()) {
        auto [f, u] = open.top();
        open.pop();

        if (closed[u]) continue;
        closed[u] = true;
        explored++;

        if (u == destId) break;

        for (const Edge &e : adj[u]) {
            if (closed[e.to]) continue;
            double tentative_g = gScore[u] + e.weight;
            if (tentative_g < gScore[e.to]) {
                gScore[e.to] = tentative_g;
                prev[e.to] = u;
                double fScore = tentative_g + h(e.to);
                open.push({fScore, e.to});
            }
        }
    }

    if (gScore[destId] == INF) return {INF, {}, explored};

    vector<int> path;
    for (int at = destId; at != -1; at = prev[at])
        path.push_back(at);
    reverse(path.begin(), path.end());
    return {gScore[destId], path, explored};
}
