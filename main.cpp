// Smart City Road Network Simulator - Step 2: the city as a graph
#include <iostream>

#include "graph.h"

int main() {
    Graph city;

    // Locations
    city.addLocation("Home");
    city.addLocation("School");
    city.addLocation("Market");
    city.addLocation("Hospital");
    city.addLocation("Bus Stand");

    // Roads (same as data/city_map.txt)
    city.addRoad("Home", "School", 4);
    city.addRoad("School", "Market", 2);
    city.addRoad("Market", "Hospital", 3);
    city.addRoad("Market", "Bus Stand", 5);
    city.addRoad("Home", "Bus Stand", 6);

    std::cout << "City network:\n";
    city.display();
    std::cout << '\n'
              << city.locationCount() << " locations, "
              << city.roadCount() << " roads\n";
    return 0;
}
