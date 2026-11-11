// Graph: the city as locations (nodes) and two-way roads (weighted edges).
#pragma once

#include <string>
#include <unordered_map>
#include <vector>

struct Edge {
    int to;         // id of the location this road leads to
    double weight;  // road distance in km
};

class Graph {
public:
    // Adds a location. Returns false if it already exists.
    bool addLocation(const std::string& name);

    // Adds a two-way road. Returns false if either location does not exist.
    bool addRoad(const std::string& from, const std::string& to, double km);

    // Prints every location and the roads leaving it.
    void display() const;

    int locationCount() const;
    int roadCount() const;

private:
    std::vector<std::string> names_;               // id -> name
    std::unordered_map<std::string, int> idOf_;    // name -> id
    std::vector<std::vector<Edge>> adj_;           // adjacency list: adj_[id] = roads from id
};
