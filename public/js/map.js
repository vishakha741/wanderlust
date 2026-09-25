// Mapbox का एक्सेस टोकन सेट करना
mapboxgl.accessToken = mapToken;

// 1. चेक करें कि listing और geometry दोनों मौजूद हैं या नहीं
const coordinates = (listing && listing.geometry && listing.geometry.coordinates)
    ? listing.geometry.coordinates
    : [77.2090, 28.6139]; // अगर डेटा न मिले, तो डिफ़ॉल्ट दिल्ली की लोकेशन

// 2. मैप को इनिशियलाइज करना
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12', 
    center: coordinates, // अब यह वेरिएबल एकदम सही काम करेगा
    zoom: 9
});

// 3. मैप पर रेड मार्कर और पॉपअप लगाना (सिर्फ तभी जब असली कोऑर्डिनेट्स मौजूद हों)
if (listing && listing.geometry && listing.geometry.coordinates) {
    new mapboxgl.Marker({ color: 'red' })
        .setLngLat(coordinates)
        .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<h4>${listing.title}</h4><p>Exact Location will be provided after booking</p>`
            )
        )
        .addTo(map);
}