//fires when get weather button is clicked

var lng;
var lat;
var placeName;
var hold = 0;

function geonamesCallback ( data ) {
    if (+data.postalcodes == '') {
        alert( 'Please enter a valid US Zip code');
    }   else {
            lng = +data.postalcodes[0].lng;
            lat = +data.postalcodes[0].lat;
            placeName = data.postalcodes[0].placeName;
            buildScripts();
        }  
}
    
function getLocation() {
    
    //~~~~~~~~~~~~ Get zip code value and geocode it with Geoname's API ~~~~~~~~~~~~//

    // get zip code input
    zip = document.getElementById( 'zip' ).value;
    
    // geocode zipcode using GeoName's API
    locateScript = document.createElement('script');
    locateScript.src = "http://api.geonames.org/postalCodeLookupJSON?postalcode=" + zip + "&country=US&username=isaac86hatch&callback=geonamesCallback";
    locateScript.async = true;
    document.getElementsByTagName( 'head' )[ 0 ].appendChild(locateScript);
}

//~~~~~~~~~~~~ Create scripts for API endpoints ~~~~~~~~~~~~//

function buildScripts() {   
    // build a script for the yahoo API using zip input and add it to the head  
        var yahooScript = document.createElement( 'script' );
        yahooScript.src = "https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where location='" + zip + "'&format=json&callback=yahooCallback";
        yahooScript.async = true;
        document.getElementsByTagName( 'head' )[ 0 ].appendChild(yahooScript);

    // create a script for the Weather Underground Current Conditions API using zip input and add it to the head
        var wuCurrentScript = document.createElement('script');
        wuCurrentScript.src = "http://api.wunderground.com/api/b47611466aefec36/conditions/q/" + zip + ".json?callback=wuCurrent";
        wuCurrentScript.async = true;
        document.getElementsByTagName( 'head' )[ 0 ].appendChild(wuCurrentScript);
        
    // create a script for the Weather Underground Forecast API using zip input and add it to the head
        var wuForecastScript = document.createElement('script');
        wuForecastScript.src = "http://api.wunderground.com/api/b47611466aefec36/forecast/q/" + zip + ".json?callback=wuForecast";
        wuForecastScript.async = true;
        document.getElementsByTagName( 'head' )[ 0 ].appendChild(wuForecastScript);
         
    // create a script for the Open Weather Maps Current API using zip input and add it to the head
        var owmCurrentScript = document.createElement('script');
        owmCurrentScript.src = "http://api.openweathermap.org/data/2.5/weather/?lat=" + lat + "&lon=" + lng + "&units=imperial&callback=owmCurrent";
        owmCurrentScript.async = true;
        document.getElementsByTagName( 'head' )[ 0 ].appendChild(owmCurrentScript);
        
    // create a script for the Open Weather Maps Forecast API using zip input and add it to the head
        var owmForecastScript = document.createElement('script');
        owmForecastScript.src = "http://api.openweathermap.org/data/2.5/forecast/daily?lat=" + lat + "&lon=" + lng + "&units=imperial&callback=owmForecast";
        owmForecastScript.async = true;
        document.getElementsByTagName( 'head' )[ 0 ].appendChild(owmForecastScript);
        
        
    // create a script for the Open Weather Maps API using zip input and add it to the head
        var fioScript = document.createElement('script');
        fioScript.src = "https://api.forecast.io/forecast/b0d5a7c997e089bb86c555d4cb73586e/" + lat + "," + lng + '?exclude=[minutely,hourly,alerts,flags]&callback=forcastioCallback';
        document.getElementsByTagName( 'head' )[ 0 ].appendChild(fioScript);
}

//~~~~~~~~~~~~ API Parsing and averaging of results ~~~~~~~~~~~~//



// Parse data from yahoo api and add it to empty div
function yahooCallback ( data ) {
    yahooJSON = +data.query.results.channel.item.condition.temp;
    yahooHigh = +data.query.results.channel.item.forecast[0].high;
    yahooLow = +data.query.results.channel.item.forecast[0].low;
    yahooLink = data.query.results.channel.link;
    document.getElementById( 'yahooDiv' ).innerHTML = yahooJSON + '&ordm';
    document.getElementById( 'yahooLink' ).setAttribute( 'href', yahooLink );
    document.getElementById( 'yahooHigh' ).innerHTML = yahooHigh;
    document.getElementById( 'yahooLow' ).innerHTML = yahooLow;
}

// Parse data from current wunderground api and add it to empty div
function wuCurrent ( data ) {
    wuJSON = +data.current_observation.temp_f;
    wuLink = data.current_observation.forecast_url;
    document.getElementById( 'wuDiv' ).innerHTML = wuJSON + '&ordm';
    document.getElementById( 'wuLink' ).setAttribute( 'href', wuLink );
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
    getAverage();
}   

//find average and inject into page
function getAverage () {
    averageMath = ( Math.round( ( yahooJSON + owmJSON + wuJSON + fioJSON ) / 4 ) );
    getMap();
}    


//~~~~~~~~~~~~ Leaftlet.js and Mapbox ~~~~~~~~~~~~

function getMap() {
    
    //create empty result divs
    buildMap = document.createElement( 'div' );
    buildMap.setAttribute( 'id', 'map' );
    currentDiv = document.getElementById( "input" );
    document.body.insertBefore( buildMap, currentDiv );
    L.mapbox.accessToken = 'pk.eyJ1IjoiaXNhYWM4NmhhdGNoIiwiYSI6ImY1N2IyOTFkYmE2ODRiYzVjZDRjYTMwZjI4OTBiODMwIn0.i_AegoD95bTWOGXmMSmSJQ';
    var map = L.mapbox.map( 'map', 'isaac86hatch.molik5lf' ).setView( [ lat, lng ], 6 );
    var popup = L.popup()
        .setLatLng( [ lat, lng ] )
        .setContent( "Average Reported Temp for " + placeName + ": " + averageMath  + '&ordm' )
        .openOn( map );
    L.tileLayer('http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png', {
        attribution: 'Data &#169 OpenWeatherMap',    
    }).addTo(map);
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








