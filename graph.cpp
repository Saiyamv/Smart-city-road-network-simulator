#include "graph.h"

#include <iostream>

bool Graph::addLocation(const std::string& name) {
    if (idOf_.count(name) > 0) {
        return false;  // already exists
    }
    int id = static_cast<int>(names_.size());
    names_.push_back(name);
    idOf_[name] = id;
    adj_.emplace_back();  // empty list of roads for the new location
    return true;
}

bool Graph::addRoad(const std::string& from, const std::string& to, double km) {
    auto a = idOf_.find(from);
    auto b = idOf_.find(to);
    if (a == idOf_.end() || b == idOf_.end()) {
        return false;  // unknown location
    }
    // Roads work in both directions, so store the road twice.
    adj_[a->second].push_back({b->second, km});
    adj_[b->second].push_back({a->second, km});
    return true;
}

void Graph::display() const {
    for (std::size_t id = 0; id < names_.size(); ++id) {
        std::cout << names_[id] << " -> ";
        if (adj_[id].empty()) {
            std::cout << "(no roads)";
        }
        for (std::size_t i = 0; i < adj_[id].size(); ++i) {
            const Edge& e = adj_[id][i];
            if (i > 0) std::cout << ", ";
            std::cout << names_[e.to] << " (" << e.weight << " km)";
        }
        std::cout << '\n';
    }
}

int Graph::locationCount() const {
    return static_cast<int>(names_.size());
}

int Graph::roadCount() const {
    int total = 0;
    for (const auto& roads : adj_) {
        total += static_cast<int>(roads.size());
    }
    return total / 2;  // each road is stored twice
}
