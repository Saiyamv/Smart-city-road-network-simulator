// Graph representation for Smart City Road Network Simulator
#pragma once

#include <string>
#include <vector>
#include <unordered_map>

using namespace std;

struct Edge {
    int to;            // destination vertex id
    double weight;     // road distance in km
};

struct LocationInfo {
    string name;
    double x; // coordinate for heuristic and visualization
    double y;
};

struct PathResult {
    double distance;
    vector<int> path;
    int nodesExplored;
};

class Graph {
public:
    // Add a location with coordinates. Returns false if name already exists.
    bool addLocation(const string &name, double x, double y);

    // Add an undirected road between two locations. Returns false if either location does not exist.
    bool addRoad(const string &from, const string &to, double km);

    // Dijkstra shortest path.
    PathResult dijkstra(int srcId, int destId) const;

    // A* shortest path using Euclidean distance heuristic (scaled for admissibility & consistency).
    PathResult aStar(int srcId, int destId) const;

    // Dynamically computes safe heuristic scaling factor to guarantee admissibility & consistency
    double computeHeuristicScale() const;

    // Utility helpers
    int getId(const string &name) const; // -1 if not found
    const LocationInfo* getLocationInfo(int id) const; // nullptr if invalid
    int vertexCount() const { return static_cast<int>(locations.size()); }
    const vector<LocationInfo>& getLocations() const { return locations; }

private:
    vector<LocationInfo> locations;                     // index -> location data
    unordered_map<string, int> nameToId;                // name -> index
    vector<vector<Edge>> adj;                           // adjacency list
};
