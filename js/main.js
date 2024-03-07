//MAP 
var map = L.map('map').setView([43.8, -120.55], 7)
;


var CartoDB_DarkMatterNoLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);



var myStyle = {
    "color": "#8787A2",  
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


/*
//--Making a marker-->
var sMarker = {
  radius: 6,
  fillColor: "#09f9df",
  color: "#ff0000",
  weight: 1,
  opacity: 1,
  fillOpacity: 1,
};
//--hot springs Data Layer-->
var hotSprings = L.geoJSON(wtsGeo, {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, sMarker);
  },
});
//--Adding the markers and data to map-->
Leafmap.addLayer(hotSprings);
*/