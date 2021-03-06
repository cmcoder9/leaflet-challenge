// Store our API endpoint inside queryUrl
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL
d3.json(url, (data) => {
        // Once we get a response, send the data.features object to the createFeatures function
        createFeatures(data.features);
    });

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) +
      "</h3><hr><p>" + feature.properties.mag + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var depth_categories = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];
  function getColor(depth){
    var fillColor='';
    if (depth > 90) {
      fillColor = 'red'
    } 
    else if (depth <=90 + depth> 70) { 
        fillColor = 'OrangeRed'
    } 
    else if (depth <=70 + depth> 50) { 
        fillColor = 'DarkOrange'
    }
    else if (depth <=50 + depth> 30) { 
        fillColor = 'Orange'
    }
    else if (depth <=30 + depth> 10) { 
        fillColor = 'Yellow'
    }
    else {
        fillColor = 'LawnGreen'
    };
    return fillColor
  };
 
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    }, 
    style: function(feature) {
      return {
        fillOpacity: 0.75,
        color:"DimGray",
        fillColor: getColor(feature.geometry.coordinates[2]),
        radius: feature.properties.mag *3
      }
    }, 
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define lightmap, darkmap, and layers
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY,

  });
  
  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY,
    
  });
  
  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY,
    
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Light Map": lightmap,
    "Dark Map": darkmap,
    "Satellite": satellite
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it earthquakes layers to display on load
  var myMap = L.map("mapid", {
    center: [15.5994, -28.6731],
    zoom: 3,
    layers: [lightmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

// Keep the earthquakes layer on top at all times when it is on
myMap.on("overlayadd", function (event) {
  earthquakes.bringToFront();
});

// Set up the legend
var legend = L.control({ position: "bottomright" });

// When the layer control is added, insert a div with the class of "legend"
legend.onAdd = function(myMap) {
  var div = L.DomUtil.create('div', 'info legend');
  var depth_categories = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];
  var labels = ['<strong>Depths:</strong>'];
  for(var i = 0; i < depth_categories.length; i++) {
    var color_text = depth_categories[i];
    if( i == depth_categories.length - 1) {
        color_text += "+";
      }
    //Add min & max
  var legendInfo = `<h1>Earthquake Depth</h1><div class="labels"><div class="min">${depth_categories[0]}</div><div class="max">${depth_categories[depth_categories.length - 1]}</div></div>`;

  div.innerHTML = legendInfo;
  
  limits.forEach((depth_categories, index) => {
        labels.push(`<li style="background:${getColor(depth_categories[i])}"></li> ${color_text ? color_text : '+'}`);
    });

  div.innerHTML += "<ul>" + labels.join("") + "</ul>";
  return div;
  };
  
// Adding legend to the map
legend.addTo(myMap);

}};
