#include "graph.h"
#include <iostream>
#include <string>
#include <sstream>
#include <iomanip>
#include <chrono>

using namespace std;

// Helper to build the sample city graph with 20 locations
void buildSampleCity(Graph &city) {
    // Add locations with (x,y) coordinates (km scale)
    city.addLocation("City Center", 0, 0);
    city.addLocation("North Park", 0, 5);
    city.addLocation("South Colony", 0, -5);
    city.addLocation("East Junction", 5, 0);
    city.addLocation("West End", -5, 0);
    city.addLocation("Railway Station", -2, 2);
    city.addLocation("Bus Terminal", 2, -2);
    city.addLocation("City Hospital", -1, -3);
    city.addLocation("University", 3, 3);
    city.addLocation("Tech Park", 6, 4);
    city.addLocation("Airport", 8, -1);
    city.addLocation("Shopping Mall", 4, -4);
    city.addLocation("Industrial Area", -6, -3);
    city.addLocation("Green Valley", -4, 4);
    city.addLocation("Lake View", 1, 6);
    city.addLocation("Stadium", -3, 1);
    city.addLocation("Museum", 5, -5);
    city.addLocation("Old Town", -5, 5);
    city.addLocation("Fire Station", -2, -6);
    city.addLocation("Market Square", 0, 3);

    // Add roads (undirected) with realistic distances (km)
    city.addRoad("City Center", "North Park", 4.0);
    city.addRoad("City Center", "South Colony", 5.0);
    city.addRoad("City Center", "East Junction", 6.0);
    city.addRoad("City Center", "West End", 5.5);
    city.addRoad("City Center", "Market Square", 2.5);

    city.addRoad("North Park", "Green Valley", 3.0);
    city.addRoad("North Park", "Lake View", 2.2);
    city.addRoad("North Park", "University", 4.5);
    city.addRoad("North Park", "Old Town", 3.8);

    city.addRoad("South Colony", "Industrial Area", 4.0);
    city.addRoad("South Colony", "Fire Station", 3.5);
    city.addRoad("South Colony", "Bus Terminal", 4.2);
    city.addRoad("South Colony", "City Hospital", 5.0);

    city.addRoad("East Junction", "Tech Park", 3.0);
    city.addRoad("East Junction", "Airport", 5.5);
    city.addRoad("East Junction", "Museum", 4.0);
    city.addRoad("East Junction", "Shopping Mall", 2.8);

    city.addRoad("West End", "Industrial Area", 5.0);
    city.addRoad("West End", "Railway Station", 3.5);
    city.addRoad("West End", "Stadium", 4.0);

    city.addRoad("Railway Station", "City Hospital", 3.2);
    city.addRoad("Railway Station", "Stadium", 2.5);
    city.addRoad("Railway Station", "Old Town", 4.5);

    city.addRoad("Bus Terminal", "Shopping Mall", 3.0);
    city.addRoad("Bus Terminal", "Airport", 4.2);
    city.addRoad("Bus Terminal", "City Hospital", 2.8);

    city.addRoad("City Hospital", "Fire Station", 3.5);
    city.addRoad("City Hospital", "Museum", 5.0);

    city.addRoad("University", "Tech Park", 2.2);
    city.addRoad("University", "Lake View", 3.0);

    city.addRoad("Tech Park", "Airport", 3.8);
    city.addRoad("Tech Park", "Museum", 4.5);

    city.addRoad("Shopping Mall", "Museum", 2.0);
    city.addRoad("Shopping Mall", "Market Square", 2.5);

    city.addRoad("Industrial Area", "Stadium", 4.2);
    city.addRoad("Industrial Area", "Fire Station", 5.0);

    city.addRoad("Green Valley", "Old Town", 2.5);
    city.addRoad("Green Valley", "Lake View", 4.0);

    city.addRoad("Lake View", "Old Town", 3.2);
    city.addRoad("Lake View", "Market Square", 2.8);

    city.addRoad("Stadium", "Museum", 3.5);
    city.addRoad("Stadium", "Market Square", 4.0);

    city.addRoad("Fire Station", "Market Square", 3.0);
}

// Simple JSON escaping for strings
string jsonString(const string &s) {
    ostringstream o;
    o << '"';
    for (char c : s) {
        if (c == '"') o << "\\\"";
        else if (c == '\\') o << "\\\\";
        else o << c;
    }
    o << '"';
    return o.str();
}

int main(int argc, char* argv[]) {
    Graph city;
    buildSampleCity(city);

    // Help / interactive / list usage
    if (argc == 1 || (argc == 2 && (string(argv[1]) == "--help" || string(argv[1]) == "-h" || string(argv[1]) == "help"))) {
        cout << "Smart City Road Network Simulator (C++ Engine)\n";
        cout << "Usage: simulator.exe <source> <destination> <algorithm>\n";
        cout << "Algorithms: dijkstra | astar\n\n";
        cout << "Available Locations (" << city.vertexCount() << "):\n";
        for (const auto &loc : city.getLocations()) {
            cout << "  - " << loc.name << " (" << loc.x << ", " << loc.y << ")\n";
        }
        cout << "\nExample:\n";
        cout << "  simulator.exe \"City Center\" \"Airport\" dijkstra\n";
        return 0;
    }

    if (argc == 2 && string(argv[1]) == "--list") {
        cout << "[\n";
        const auto &locs = city.getLocations();
        for (size_t i = 0; i < locs.size(); ++i) {
            cout << "  {\"name\": " << jsonString(locs[i].name)
                 << ", \"x\": " << locs[i].x
                 << ", \"y\": " << locs[i].y << "}"
                 << (i + 1 < locs.size() ? "," : "") << "\n";
        }
        cout << "]\n";
        return 0;
    }

    if (argc != 4) {
        cerr << "Usage: simulator.exe <source> <destination> <algorithm>\n";
        cerr << "Run with --help for details.\n";
        return 1;
    }

    string source = argv[1];
    string destination = argv[2];
    string algorithm = argv[3]; // "dijkstra" or "astar"

    int srcId = city.getId(source);
    int destId = city.getId(destination);
    if (srcId == -1 || destId == -1) {
        cout << "{\"error\":\"Invalid location name. Please check starting location and destination.\"}";
        return 0;
    }

    PathResult result;
    auto startTime = chrono::high_resolution_clock::now();
    if (algorithm == "dijkstra") {
        result = city.dijkstra(srcId, destId);
    } else if (algorithm == "astar") {
        result = city.aStar(srcId, destId);
    } else {
        cout << "{\"error\":\"Unknown algorithm '" + algorithm + "'. Use 'dijkstra' or 'astar'.\"}";
        return 0;
    }
    auto endTime = chrono::high_resolution_clock::now();
    double durationMs = chrono::duration<double, std::milli>(endTime - startTime).count();

    if (result.path.empty()) {
        cout << "{\"error\":\"No route found connecting " + source + " and " + destination + ".\"}";
        return 0;
    }

    // Build JSON output
    ostringstream oss;
    oss << "{\n";
    oss << "  \"source\": " << jsonString(source) << ",\n";
    oss << "  \"destination\": " << jsonString(destination) << ",\n";
    oss << "  \"algorithm\": " << jsonString(algorithm) << ",\n";
    oss << "  \"distance\": " << fixed << setprecision(2) << result.distance << ",\n";
    oss << "  \"nodesExplored\": " << result.nodesExplored << ",\n";
    oss << "  \"steps\": [";
    for (size_t i = 0; i < result.path.size(); ++i) {
        const LocationInfo* info = city.getLocationInfo(result.path[i]);
        oss << jsonString(info->name);
        if (i + 1 < result.path.size()) oss << ", ";
    }
    oss << "],\n";
    oss << "  \"durationMs\": " << fixed << setprecision(3) << durationMs << "\n";
    oss << "}\n";
    cout << oss.str();
    return 0;
}
