let map;
let geocoder;
let markers = [];

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
    
    const mapDiv = document.getElementById('map');
    if (window.processingOrders && window.processingOrders.length > 0) {
        mapDiv.style.display = 'block';
        mapDiv.style.height = '400px';
        mapDiv.style.width = '100%';
        displayProcessingOrders(window.processingOrders);
    } else {
        mapDiv.style.display = 'none';
    }
}

function displayProcessingOrders(orders) {
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    orders.forEach(order => {
        geocodeAddress(order.shippingAddress, order._id);
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
            markers.push(marker);
        } else {
            console.error('Geocode was not successful for the following reason: ' + status);
        }
    });
}