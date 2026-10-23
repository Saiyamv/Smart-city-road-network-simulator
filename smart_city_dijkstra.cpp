#include <algorithm>
#include <iostream>
#include <limits>
#include <queue>
#include <string>
#include <unordered_map>
#include <vector>
using namespace std;
class RoadNetwork {
private:
    // Each location stores its neighboring locations and the road distance.
    unordered_map<string, vector<pair<string, int>>> roads;
public:
    void addRoad(const string& from, const string& to, int distance) {
        roads[from].push_back({to, distance});
        roads[to].push_back({from, distance}); // Roads work in both directions.
    }
    void findShortestRoute(const string& start, const string& destination) const {
        if (roads.find(start) == roads.end() || roads.find(destination) == roads.end()) {
            cout << "Unknown location. Check the names and try again.\n";
            return;
        }
        unordered_map<string, int> distance;
        unordered_map<string, string> previous;
        for (const auto& road : roads) {
            distance[road.first] = numeric_limits<int>::max();
        }
        distance[start] = 0;
        // The priority queue always visits the closest known location next.
        using QueueEntry = pair<int, string>;
        priority_queue<QueueEntry, vector<QueueEntry>, greater<QueueEntry>> pending;
        pending.push({0, start});
        while (!pending.empty()) {
            const int currentDistance = pending.top().first;
            const string current = pending.top().second;
            pending.pop();

            // Ignore an outdated queue entry if a shorter route was found later.
            if (currentDistance != distance[current]) {
                continue;
            }
            if (current == destination) {
                break;
            }
            for (const auto& road : roads.at(current)) {
                const string& neighbor = road.first;
                const int roadDistance = road.second;
                const int newDistance = currentDistance + roadDistance;
                if (newDistance < distance[neighbor]) {
                    distance[neighbor] = newDistance;
                    previous[neighbor] = current;
                    pending.push({newDistance, neighbor});
                }
            }
        }
        if (distance[destination] == numeric_limits<int>::max()) {
            cout << "No route connects " << start << " and " << destination << ".\n";
            return;
        }

        vector<string> route;
        for (string place = destination; ; place = previous.at(place)) {
            route.push_back(place);
            if (place == start) {
                break;
            }
        }
        reverse(route.begin(), route.end());
        cout << "Shortest route from " << start << " to " << destination << ":\n";
        for (size_t i = 0; i < route.size(); ++i) {
            cout << route[i];
            if (i + 1 < route.size()) {
                cout << " -> ";
            }
        }
        cout << "\nTotal distance: " << distance[destination] << " km\n";
    }
};
int main() {
    RoadNetwork city;
    // Sample city map. Replace or extend these roads with your own locations.
    city.addRoad("Home", "School", 4);
    city.addRoad("Home", "Market", 3);
    city.addRoad("School", "Market", 2);
    city.addRoad("School", "Hospital", 7);
    city.addRoad("Market", "Hospital", 5);
    city.addRoad("Market", "Bus Stand", 6);
    city.addRoad("Bus Stand", "Hospital", 2);

    string start;
    string destination;

    cout << "Available locations: Home, School, Market, Hospital, Bus Stand\n";
    cout << "Enter starting location: ";
    getline(cin, start);
    cout << "Enter destination: ";
    getline(cin, destination);

    city.findShortestRoute(start, destination);
    return 0;
}