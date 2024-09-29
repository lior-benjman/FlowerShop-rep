function loadMapsAPI() {
    fetch('/api/admin/fetchMapsApi', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
        }
        })
        .then(response => response.json())
        .then(data => {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${data.mapsApiKey}&callback=initMap&libraries=maps,marker&v=beta`;
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        })
        .catch(error => console.error('Error loading Maps API:', error));
}

function reloadMap() {
    if (map) {
        map.setCenter(null);
        map = null;
    }

    const existingScript = document.querySelector('script[src^="https://maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
        existingScript.remove();
    }

    loadMapsAPI();
}

loadMapsAPI();