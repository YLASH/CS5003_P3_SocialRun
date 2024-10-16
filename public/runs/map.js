
var map = L.map('map').setView([51.505, -0.09], 13);

function loadMap(lat, lng, zoom = 13) {
    if (map != undefined) {
        map.remove();
    }
    map = L.map('map').setView([lat, lng], zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

console.log("map....")

// This function adds a start point to the map and transfers it to the form at Lat/Lng point (Latitude and Longitude):
function addStartingPointMarker(lat, lng) {
    var marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup("<b>Starting Point: </b> " + lat + ", " + lng).openPopup();
    document.getElementById('startingPoint').value = "Lat: " + lat + ", Lng: " + lng;
}


// This function adds an end point to the map and transfers it to the form:
function addEndPointMarker(lat, lng) {
    var marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup("<b>End Point: </b> " + lat + ", " + lng).openPopup();
    // Set color:
    marker.setIcon(L.icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }));
    document.getElementById('endPoint').value = "Lat: " + lat + ", Lng: " + lng;
}

// Create variable to count all meeting points
var meetingPointCounter = 1;

// This function creates meeting points on the map and transfer them to the form:
function addMeetingPoints(lat, lng) {
    var marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup("<b>Meeting Point " + meetingPointCounter + ": </b> " + lat + ", " + lng).openPopup();
    // Set color
    marker.setIcon(L.icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }));
    document.getElementById('meetingPoints').value += "Meeting Point " + meetingPointCounter + ": Lat: " + lat + ", Lng: " + lng + "; ";
    meetingPointCounter++;
}

// This function undoes start point previously added and remove it from the form:
function undoStartingPoint() {
    var startingPoint = document.getElementById('startingPoint').value;

    if (startingPoint) {
        var lat = startingPoint.split(',')[0].split(':')[1].trim();
        var lng = startingPoint.split(',')[1].split(':')[1].trim();

        map.eachLayer(function (layer) {
            if (layer instanceof L.Marker && layer.getLatLng().lat === parseFloat(lat) && layer.getLatLng().lng === parseFloat(lng)) {
                map.removeLayer(layer);
            }
        });

        document.getElementById('startingPoint').value = "";
        drawRoute();
        document.getElementById('mapMessage').innerHTML = "Click on the map to set the Starting Point";
    } else {
        console.error("Starting point not found");
    }
}

// This function undoes end point previously added and remove it from the form:
function undoEndPoint() {
    var endPoint = document.getElementById('endPoint').value;

    if (endPoint) {
        var lat = endPoint.split(',')[0].split(':')[1].trim();
        var lng = endPoint.split(',')[1].split(':')[1].trim();

        map.eachLayer(function (layer) {
            if (layer instanceof L.Marker && layer.getLatLng().lat === parseFloat(lat) && layer.getLatLng().lng === parseFloat(lng)) {
                map.removeLayer(layer);
            }
        });

        document.getElementById('endPoint').value = "";
        drawRoute();
        document.getElementById('mapMessage').innerHTML = "Click on the map to set the End Point.";
    } else {
        console.error("End point not found");
    }
}

// This function undoes meeting points previously added and remove them from the form:
function undoMeetingPoints() {
    var meetingPoints = document.getElementById('meetingPoints').value;
    var lastMeetingPoint = meetingPoints.split('; ').slice(-2)[0];
    if (lastMeetingPoint) {
        // ['Meeting Point 2', 'Lat', '51.49805040493138, Lng', '-0.09956359863281251']
        var lat_lng = lastMeetingPoint.split(': ');
        // Get lat and lng
        var lat = parseFloat(lat_lng[2].split(',')[0].trim());
        var lng = parseFloat(lat_lng[3].trim());
        map.eachLayer(function (layer) {
            if (layer instanceof L.Marker && layer.getLatLng().lat === lat && layer.getLatLng().lng === lng) {
                map.removeLayer(layer);
            }
        });

        meetingPointCounter--;
        document.getElementById('meetingPoints').value = meetingPoints.slice(0, -lastMeetingPoint.length - 2);
        drawRoute();
    } else {
        console.log('No meeting points to undo.');
    }
}

// This function clears all points:
function clearPoints() {
    undoStartingPoint();
    undoEndPoint();
    for (var i = 0; i <= meetingPointCounter; i++) {
        undoMeetingPoints();
    }
    document.getElementById('mapMessage').innerHTML = "Click on the map to set the Starting Point.";
}

// Draw route
/**
 * This function draws the route on the map and estimate distance and pace.
*/

function drawRoute() {
    var startingPoint = document.getElementById('startingPoint').value;
    var endPoint = document.getElementById('endPoint').value;
    var meetingPoints = document.getElementById('meetingPoints').value;

    // Check if starting point or end point is not set
    if (startingPoint == "" || endPoint == "") {
        // Clear previous route
        map.eachLayer(function (layer) {
            if (layer instanceof L.Polyline) {
                map.removeLayer(layer);
            }
        });
        console.error("Starting point or End point not set");
        return;
    }

    // Get start point coordinates
    var startLat = parseFloat(startingPoint.split(':')[1].split(',')[0].trim());
    var startLng = parseFloat(startingPoint.split(':')[2].split(',')[0].trim());

    // Get end point coordinates
    var endLat = parseFloat(endPoint.split(':')[1].split(',')[0].trim());
    var endLng = parseFloat(endPoint.split(':')[2].split(',')[0].trim());

    // Route coordinates
    var routeCoordinates = [];

    // Add starting point
    routeCoordinates.push([startLat, startLng]);

    // Add meeting points
    var meetingPointsArray = meetingPoints.split(';');
    meetingPointsArray.forEach(function (meetingPoint) {
        if (meetingPoint.trim() !== '') { // Check if meeting point is not empty
            // ['Meeting Point 1', 'Lat', '51.49805040493138, Lng', '-0.09956359863281251']
            var point = meetingPoint.split(':');
            // Get lat and lng
            var lat = parseFloat(point[2].split(',')[0].trim());
            var lng = parseFloat(point[3].trim());
            routeCoordinates.push([lat, lng]);
        }
    });

    // Add end point
    routeCoordinates.push([endLat, endLng]);

    // Clear previous route
    map.eachLayer(function (layer) {
        if (layer instanceof L.Polyline) {
            map.removeLayer(layer);
        }
    });

    // Draw route
    var route = L.polyline(routeCoordinates, { color: 'blue' }).addTo(map);
    map.fitBounds(route.getBounds()); // Zoom to route

    // Estimate distance (in kilometers)
    var distance = calculateDistance(startLat, startLng, endLat, endLng);

    // Estimate pace (meters per second)
    var duration = calculateDuration(distance);

    // Add route distance 
    document.getElementById('distance').value = "About " + distance + " km";

    // Add route pace
    document.getElementById('pace').value = "About " + duration + " m/s";

    // Add route information to the hidden input field for form submission
    document.getElementById('route').value = "Starting Point: " + startingPoint + "; End Point: " + endPoint + "; Meeting Points: [" + meetingPoints + "]";
}

/**
 * Calculate the distance (in meters) between two points using Haversine formula.
 * @param {number} lat1 - Latitude of the first point.
 * @param {number} lng1 - Longitude of the first point.
 * @param {number} lat2 - Latitude of the second point.
 * @param {number} lng2 - Longitude of the second point.
 * @returns {number} The distance between the two points in meters.
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    var earthRadius = 6371e3; // Earth's radius in meters
    var φ1 = toRadians(lat1);
    var φ2 = toRadians(lat2);
    var Δφ = toRadians(lat2 - lat1);
    var Δλ = toRadians(lng2 - lng1);

    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var distance = earthRadius * c; // Distance in meters
    // Round to the nearest kilometer
    distance = Math.round(distance / 1000 * 100) / 100;
    return distance;
}

/**
 * Convert degrees to radians.
 * @param {number} degrees - Angle in degrees.
 * @returns {number} Angle in radians.
 */

function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Estimate the pace (meters per second) based on the distance.
 * @param {number} distance - Distance between starting point and end point in meters.
 * @returns {number} Estimated pace in meters per second.
 */

function calculateDuration(distance) {
    var pace = distance / 3600; // Convert meters per hour to meters per second
    return pace;
}



// This loads the map on the page with all corresponding buttons to modify the map: 
document.addEventListener('DOMContentLoaded', (event) => {
    // Load Map
    loadMap(51.505, -0.09); // London

    // Add starting point, end point, meeting point, route
    map.on('click', function (e) {
        var lat = e.latlng.lat;
        var lng = e.latlng.lng;

        if (document.getElementById('startingPoint').value == "") {
            addStartingPointMarker(lat, lng);
            document.getElementById('mapMessage').innerHTML = "Click on the map to set the End Point.";
        } else if (document.getElementById('endPoint').value == "") {
            addEndPointMarker(lat, lng);
            document.getElementById('mapMessage').innerHTML = "Click on the map to set the Meeting Point" + meetingPointCounter + ".";
        } else {
            // Meeting point
            addMeetingPoints(lat, lng);
            document.getElementById('mapMessage').innerHTML = "Click on the map to set the Meeting Point " + meetingPointCounter + ".";
        }

        // Draw route
        drawRoute();
    });

    document.getElementById('undoStartingPoint').addEventListener('click', undoStartingPoint);
    document.getElementById('undoEndPoint').addEventListener('click', undoEndPoint);
    document.getElementById('undoMeetingPoints').addEventListener('click', undoMeetingPoints);
    document.getElementById('clearPoints').addEventListener('click', clearPoints);

});