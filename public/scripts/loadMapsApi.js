function loadMapsAPI() {
    $.ajax({
        url: '/api/admin/fetchMapsApi',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        success: function(data) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${data.mapsApiKey}&callback=initMap&libraries=maps,marker&v=beta`;
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error loading Maps API:', textStatus, errorThrown);
        }
    });
}

function reloadMap(processingOrders) {
    if (map) {
        map.setCenter(null);
        map = null;
    }

    const existingScript = document.querySelector('script[src^="https://maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
        existingScript.remove();
    }

    window.processingOrders = processingOrders;
    loadMapsAPI();
}

loadMapsAPI();