  
// mapboxgl.accessToken = 'pk.eyJ1Ijoic2FiYnkxOTg5IiwiYSI6ImNraWtlZzU5dzA4eTQydG84N2V4MXNudHcifQ.O-0iFgxN1mgn65YKWgZU4w';
mapboxgl.accessToken = maptoken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )
    )
    .addTo(map)
