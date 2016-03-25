//©Isaac Viel v1.0


var lng;
var lat;
var placeName = 0;
var hold = 0;
averageArray = [];



//~~~~~~~~~~~~ If user choses current location run this function ~~~~~~~~~~~~//

//geolocating
function locate() {
    navigator.geolocation.getCurrentPosition(coords);
}

//Parse geolocation into lat,lng data    
function coords(position) {
    lat = position.coords.latitude;
    lng = position.coords.longitude;
    console.log( lat + ' , ' + lng )
    buildScripts();
}

    
//~~~~~~~~~~~~ Get zip code value and geocode it with Geoname's API ~~~~~~~~~~~~//
    
//fires when get weather button is clicked
function getLocation() {

    // get zip code input
    zip = document.getElementById( 'zip' ).value;
    
    // geocode zipcode using GeoName's API
    locateScript = document.createElement('script');
    locateScript.src = "http://api.geonames.org/postalCodeLookupJSON?postalcode=" + zip + "&country=US&username=isaac86hatch&callback=geonamesCallback";
    locateScript.async = true;
    document.getElementsByTagName( 'head' )[ 0 ].appendChild(locateScript);
}


// Parse Geonames API and create give lat, lng values
function geonamesCallback ( data ) {
    if (+data.postalcodes == '') {
        alert( 'Please enter a valid US Zip code');
    }   else {
            lng = +data.postalcodes[0].lng;
            lat = +data.postalcodes[0].lat;
            //placeName = data.postalcodes[0].placeName;
            buildScripts();
        }  
}

//~~~~~~~~~~~~ Create scripts for API endpoints ~~~~~~~~~~~~//

function buildScripts() {
    weatherscripts = [];
    allScripts = [   
        yahooEndpoint = "https://query.yahooapis.com/v1/yql?q=select * from weather.forecast where woeid in (SELECT woeid FROM geo.placefinder WHERE text=\"" + lat + "," + lng + "\"and gflags=\"R\" )&format=json&callback=yahooCallback",
        wuCurrentEndpoint = "http://api.wunderground.com/api/b47611466aefec36/conditions/q/" + lat + "," + lng + ".json?callback=wuCurrent",
        wuForecastEndpoint = "http://api.wunderground.com/api/b47611466aefec36/forecast/q/" + lat + "," + lng + ".json?callback=wuForecast",
        owmCurrentEndpoint = "http://api.openweathermap.org/data/2.5/weather/?lat=" + lat + "&lon=" + lng + "&units=imperial&callback=owmCurrent",
        owmForecastEndpoint = "http://api.openweathermap.org/data/2.5/forecast/daily?lat=" + lat + "&lon=" + lng + "&units=imperial&callback=owmForecast",
        fioEndpoint = "https://api.forecast.io/forecast/b0d5a7c997e089bb86c555d4cb73586e/" + lat + "," + lng + "?exclude=[minutely,hourly,alerts,flags]&callback=forcastioCallback"
    ]
    for ( i = 0; i < allScripts.length; i++ ) {
        weatherscripts[i] = document.createElement( 'script' );
        weatherscripts[i].src = allScripts[i];
        document.getElementsByTagName( 'head' )[ 0 ].appendChild(weatherscripts[i]);    
    }
}


//~~~~~~~~~~~~ API Parsing and averaging of results ~~~~~~~~~~~~//



// Parse data from yahoo api and add it to empty div
function yahooCallback ( data ) {
    yahooJSON = +data.query.results.channel.item.condition.temp;
    yahooHigh = +data.query.results.channel.item.forecast[0].high;
    yahooLow = +data.query.results.channel.item.forecast[0].low;
    yahooLink = data.query.results.channel.link;
    placeName = data.query.results.channel.location.city;
    document.getElementById( 'yahooDiv' ).innerHTML = yahooJSON + '&ordm';
    document.getElementById( 'yahooLink' ).setAttribute( 'href', yahooLink );
    document.getElementById( 'yahooHigh' ).innerHTML = yahooHigh;
    document.getElementById( 'yahooLow' ).innerHTML = yahooLow;
    averageArray.push(yahooJSON);
}

// Parse data from current wunderground api and add it to empty div
function wuCurrent ( data ) {
    wuJSON = +data.current_observation.temp_f;
    wuLink = data.current_observation.forecast_url;
    document.getElementById( 'wuDiv' ).innerHTML = wuJSON + '&ordm';
    document.getElementById( 'wuLink' ).setAttribute( 'href', wuLink );
    averageArray.push(wuJSON);
}

// Parse data from weather wunderground api and add it to empty div
function wuForecast ( data ) {
    wuHigh = +data.forecast.simpleforecast.forecastday[0].high.fahrenheit;
    wuLow = +data.forecast.simpleforecast.forecastday[0].low.fahrenheit;
    document.getElementById( 'wuHigh' ).innerHTML = wuHigh;
    document.getElementById( 'wuLow' ).innerHTML = wuLow;
}

// Parse data from open weather maps current api and add it to empty div
function owmCurrent ( data ) {
    owmJSON = +data.main.temp;
    owmLink = data.id;
    document.getElementById( 'owmDiv' ).innerHTML = owmJSON + '&ordm';
    document.getElementById( 'owmLink' ).setAttribute( 'href', 'http://openweathermap.org/city/' + owmLink );
    averageArray.push(owmJSON);
}

// Parse data from open weather maps forcast api and add it to empty div
function owmForecast ( data ) {
    owmHigh = +data.list[0].temp.max;
    owmLow = +data.list[0].temp.min;
    document.getElementById( 'owmHigh' ).innerHTML = owmHigh;
    document.getElementById( 'owmLow' ).innerHTML = owmLow;
}


// Parse data from forecast.io DarkSky api and add it to empty div
function forcastioCallback ( data ) {
    fioLow = +data.daily.data[0].temperatureMin;
    fioHigh = +data.daily.data[0].temperatureMax;
    fioJSON = +data.currently.temperature;
    document.getElementById( 'fioLow' ).innerHTML = fioLow;
    document.getElementById( 'fioHigh' ).innerHTML = fioHigh;
    document.getElementById( 'fioDiv' ).innerHTML = fioJSON + '&ordm';
    document.getElementById( 'fioLink' ).setAttribute( 'href', "http://forecast.io/#/f/" + lat + "," + lng );
    averageArray.push(fioJSON);
    getAverage();
}   

//~~~~~~~~~~~~ Get average and and call map positioning ~~~~~~~~~~~~

function getAverage() {
    for (var i = 0, sum = 0; i < averageArray.length; sum += averageArray[i++]);
    averageMath = (Math.round( sum / averageArray.length) );
    getMap();
}

//~~~~~~~~~~~~ Leaftlet.js and Mapbox ~~~~~~~~~~~~

// Build map onload
L.mapbox.accessToken = 'pk.eyJ1IjoiaXNhYWM4NmhhdGNoIiwiYSI6ImY1N2IyOTFkYmE2ODRiYzVjZDRjYTMwZjI4OTBiODMwIn0.i_AegoD95bTWOGXmMSmSJQ';
map = L.mapbox.map( 'map', 'isaac86hatch.molik5lf' ).setView( [ 39.833333, -98.583333 ], 3 );

// Updated map with input location
function getMap() {
    map.setView( [ lat, lng ], 6 );
    var popup = L.popup()
        .setLatLng( [ lat, lng ] )
        if (placeName == 0 ) {
            popup.setContent( "Average Reported Temp for this location:" + averageMath  + '&ordm' )
        } else {
        popup.setContent( "Average Reported Temp for " + placeName + ": " + averageMath  + '&ordm' )
        }
        popup.openOn( map );
}


//~~~~~~~~~~~~ Card Flipping ~~~~~~~~~~~~

(function() {
  var cards = document.querySelectorAll(".card.effect__click");
  for ( var i  = 0, len = cards.length; i < len; i++ ) {
    var card = cards[i];
    clickListener( card );
  }

  function clickListener(card) {
    card.addEventListener( "click", function() {
      var c = this.classList;
      c.contains("flipped") === true ? c.remove("flipped") : c.add("flipped");
    });
  }
})();








