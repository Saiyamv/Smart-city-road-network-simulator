// Same locations as data/city_map.txt
const locations = ["Home", "School", "Market", "Hospital", "Bus Stand"];

const startSelect = document.getElementById("start");
const endSelect = document.getElementById("end");
const result = document.getElementById("result");

for (const name of locations) {
  startSelect.add(new Option(name, name));
  endSelect.add(new Option(name, name));
}

document.getElementById("form").addEventListener("submit", function (event) {
  event.preventDefault();
  result.textContent = "Route finding is not built yet. It comes with Dijkstra's algorithm in the next steps.";
});