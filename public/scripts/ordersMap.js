let map;
let geocoder;

function initMap() {
    if (typeof google === 'undefined') {
      console.error('Google Maps API not loaded');
      return;
    }
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 7,
      center: { lat: 31.5, lng: 35 },
    });
    geocoder = new google.maps.Geocoder();
    console.log("Map initialized");
    fetchProcessingOrders();
}

function fetchProcessingOrders() {
    $.ajax({
        url: '/api/admin/status/Processing',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        success: function(locations) {
            console.log(locations);
            locations.forEach(location => {
                geocodeAddress(location.address, location.id);
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching order locations:', textStatus, errorThrown);
        }
    });
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