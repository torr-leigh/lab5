//MAP 
var map = L.map('map').setView([43.8, -120.55], 6)
;

var Esri_WorldPhysical = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
	maxZoom: 8
}).addTo(map);


// style for watershed boundaries
var myStyle = {
    "color": "#8A51FD",  
    "weight": 2,
    dashArray: '4',
    "fillOpacity": 0
};


//___add geojson from data folder to map
fetch('data/watershed_boundaries_OR.json') 
.then(response => response.json())
.then(geojsonData => {
    var geojson = L.geoJSON(geojsonData, {
        style: myStyle,
        onEachFeature: onEachFeature
    }).addTo(map);
})
.catch(error => console.error('Error: ', error));

    // Event handling functions
    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#40ABCF',
            dashArray: '',
            fillOpacity: 0.1
        });

        layer.bringToFront();
    }

    function resetHighlight(e) {
        var layer = e.target;
        layer.setStyle(myStyle);
    }

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }


    fetch('data/thermal_springs_OR.geojson.json') 
    .then(response => response.json())
    .then(data => {
        riversLayer = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                // Define marker options
                var hotSpringMarker = {
                    radius: 5, // Adjust the size of the circle
                    fillColor: getColor(feature.properties.newTemp), // Call a function to get the color based on the value in one of the fields
                    color: "#000", // Border color
                    weight: 1, // Border width
                    opacity: 1, // Border opacity
                    fillOpacity: 0.8 // Fill opacity
                };
                return L.circleMarker(latlng, hotSpringMarker);
            }
        }).addTo(map);
    })
    .catch(error => console.error('Error: ', error));

// Function to get color based on value
function getColor(newTemp) {
    // Define temperature ranges and corresponding colors
    if (newTemp < 82) {
        return '#FFDD62'; // color for temperature < 82
    } else if (newTemp >= 82 && newTemp <= 106) {
        return 'green'; // color for temperature between 82 and 106
    } else {
        return '#F1515E'; // color for temperature > 106
    }
}


// Load your GeoJSON datasets
// below: It fetches the GeoJSON data for hot springs and watershed boundaries using fetch.
// It uses Promise.all to wait for both fetch requests to resolve.
// When both GeoJSON datasets are successfully loaded, it converts them into Turf.js feature 
// collections. It iterates over each watershed polygon, filters the hot springs that fall 
// within each watershed using Turf.js pointsWithinPolygon, and counts them.
// It stores the counts in an object hotSpringsCountByWatershed, where the keys are the watershed IDs.
// Finally, it logs the hotSpringsCountByWatershed object to the console.
 
// Load your GeoJSON datasets
Promise.all([
    fetch('data/thermal_springs_OR.geojson').then(response => response.json()),
    fetch('data/watershed_boundaries_OR.json').then(response => response.json())
]).then(([hotSpringsData, watershedsData]) => {
    var hotSprings = turf.featureCollection(hotSpringsData.features.map(feature => ({
        type: 'Feature',
        geometry: feature.geometry,
        properties: feature.properties
    })));
    var watersheds = turf.featureCollection(watershedsData.features);

    // Create an empty object to store the count of hot springs in each watershed
    var hotSpringsCountByWatershed = {};

    // Iterate over each watershed polygon
    watersheds.features.forEach(function(watershed) {
        // Check if the ID property exists before accessing it
        if (watershed.properties && watershed.properties.id) {
            var watershedId = watershed.properties.id;

            // Use Turf.js to filter hot springs that are within the current watershed polygon
            var hotSpringsWithinWatershed = turf.pointsWithinPolygon(hotSprings, watershed.geometry);

            // Get the count of hot springs within the current watershed
            var hotSpringsCount = hotSpringsWithinWatershed.features.length;

            // Store the count in the object with the watershed ID as key
            hotSpringsCountByWatershed[watershedId] = hotSpringsCount;
        }
    });

    // Now hotSpringsCountByWatershed object contains the count of hot springs within each watershed
    console.log(hotSpringsCountByWatershed);
}).catch(error => console.error('Error loading GeoJSON: ', error));



//_________________________