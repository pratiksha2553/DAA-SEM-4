// Declare global variables for map, marker, and geocoder
let map;
let marker;
let geocoder;

// Function to initialize the map with the user's location
function initMap() {
    // Check if the browser supports geolocation
    if (navigator.geolocation) {
        // Get the user's current location
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const userLatLng = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Create a new map centered on the user's location
                map = new google.maps.Map(document.getElementById('map'), {
                    center: userLatLng,
                    zoom: 15
                });

                // Add a marker at the user's location
                marker = new google.maps.Marker({
                    position: userLatLng,
                    map: map,
                    title: 'Your Location'
                });
            },
            function (error) {
                console.error('Error getting user location:', error);
                alert('Error getting user location. Please try again later.');
            }
        );
    } else {
        console.error('Geolocation is not supported by this browser.');
        alert('Geolocation is not supported by this browser. Please try again later.');
    }
}

// Your existing functions from payment.js
// ...
