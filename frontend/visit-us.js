// ===== MAP =====
const lat = 13.756331;
const lng = 100.501765;

const map = L.map('map').setView([lat, lng], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

// custom icon
const icon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40,40]
});

const marker = L.marker([lat, lng], {icon}).addTo(map);

marker.bindPopup(`
  <div style="text-align:center;">
    <b>ECLIPSE Restaurant</b><br>
    Bangkok, Thailand
  </div>
`).openPopup();

// ===== USER LOCATION =====
if(navigator.geolocation){
  navigator.geolocation.getCurrentPosition(pos => {
    const userLat = pos.coords.latitude;
    const userLng = pos.coords.longitude;

    L.marker([userLat, userLng]).addTo(map)
      .bindPopup("You are here");

    L.polyline([
      [userLat, userLng],
      [lat, lng]
    ], {color:"gold"}).addTo(map);

  });
}

// ===== OPEN DIRECTIONS =====
function openDirections(){
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
}