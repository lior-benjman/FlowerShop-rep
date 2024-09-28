let map;
let geocoder;

function initMap() {
    if (typeof google === 'undefined') {
      console.error('Google Maps API not loaded');
      return;
    }
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 3,
      center: { lat: 0, lng: 0 },
    });
    geocoder = new google.maps.Geocoder();
    console.log("Map initialized");
    fetchProcessingOrders();
  }

async function fetchProcessingOrders() {
    try {
        const response = await fetch('/api/admin/status/Processing',{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const locations = await response.json();
        console.log(locations);
        locations.forEach(location => {
            geocodeAddress(location.address, location.id);
        });
    } catch (error) {
        console.error('Error fetching order locations:', error);
    }
}

function geocodeAddress(address, orderId) {
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK') {
            const marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location,
                title: `Order ID: ${orderId}`
            });

            const infowindow = new google.maps.InfoWindow({
                content: `<strong>Order ID:</strong> ${orderId}<br><strong>Address:</strong> ${address}`
            });

            marker.addListener('click', () => {
                infowindow.open(map, marker);
            });
        } else {
            console.error('Geocode was not successful for the following reason: ' + status);
        }
    });
}