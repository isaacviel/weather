//fires when get weather button is clicked

var lng;
var lat;
var placeName;

function geonamesCallback ( data ) {
    lng = +data.postalcodes[0].lng;
    lat = +data.postalcodes[0].lat;
    placeName = data.postalcodes[0].placeName;
    getMap();
}

function getLocation() {
    
    //~~~~~~~~~~~~ Get zip code value and geocode it with Geoname's API ~~~~~~~~~~~~//

    // get zip code input
    var zip = document.getElementById( 'zip' ).value;
    
    // geocode zipcode using GeoName's API
    var locateScript = document.createElement('script');
    locateScript.src = "http://api.geonames.org/postalCodeLookupJSON?postalcode=" + zip + "&country=US&username=isaac86hatch&callback=geonamesCallback";
    locateScript.async = true;
    document.getElementsByTagName( 'head' )[ 0 ].appendChild(locateScript);
    
    
//~~~~~~~~~~~~ Create scripts for API endpoints ~~~~~~~~~~~~//
    
    // build a script for the yahoo API using zip input and add it to the head
    var yahooScript = document.createElement( 'script' );
    yahooScript.src = "https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where location='" + zip + "'&format=json&callback=yahooCallback";
    yahooScript.async = true;
    document.getElementsByTagName( 'head' )[ 0 ].appendChild(yahooScript);

    // create a script for the Open Weather Maps API using zip input and add it to the head
    var wuScript = document.createElement('script');
    wuScript.src = "http://api.wunderground.com/api/b47611466aefec36/conditions/q/" + zip + ".json?callback=wundergroundCallback";
    wuScript.async = true;
    document.getElementsByTagName( 'head' )[ 0 ].appendChild(wuScript);
    
    // create a script for the Open Weather Maps API using zip input and add it to the head
    var owmScript = document.createElement('script');
    owmScript.src = "http://api.openweathermap.org/data/2.5/weather/?zip=" + zip + "&units=imperial&callback=owmCallback";
    owmScript.async = true;
    document.getElementsByTagName( 'head' )[ 0 ].appendChild(owmScript);
    
    // create a script for the Open Weather Maps API using zip input and add it to the head
    setTimeout(function() {
        var fioScript = document.createElement('script');
        fioScript.src = "https://api.forecast.io/forecast/b0d5a7c997e089bb86c555d4cb73586e/" + lat + "," + lng + "?callback=forcastioCallback";
        fioScript.async = true;
        document.getElementsByTagName( 'head' )[ 0 ].appendChild(fioScript);
    },1000);
}

//~~~~~~~~~~~~ API Parsing and averaging of results ~~~~~~~~~~~~//



// Parse data from yahoo api and add it to empty div
function yahooCallback ( data ) {
    yahooJSON = +data.query.results.channel.wind.chill;
    yahooLink = data.query.results.channel.link;
    document.getElementById( 'yahooDiv' ).innerHTML = yahooJSON + '&ordm';
    document.getElementById( 'yahooLink' ).setAttribute( 'href', yahooLink );
}

// Parse data from wunderground api and add it to empty div
function wundergroundCallback ( data ) {
    wuJSON = +data.current_observation.temp_f;
    wuLink = data.current_observation.forecast_url;
    document.getElementById( 'wuDiv' ).innerHTML = wuJSON + '&ordm';
    document.getElementById( 'wuLink' ).setAttribute( 'href', wuLink );
}

// Parse data from open weather maps api and add it to empty div
function owmCallback ( data ) {
    owmJSON = +data.main.temp;
    owmLink = data.dt;
    document.getElementById( 'owmDiv' ).innerHTML = owmJSON + '&ordm';
    document.getElementById( 'owmLink' ).setAttribute( 'href', 'http://openweathermap.org/city/' + owmLink );
}

// Parse data from forecast.io DarkSky api and add it to empty div
function forcastioCallback ( data ) {
    fioJSON = +data.currently.temperature;
    document.getElementById( 'fioDiv' ).innerHTML = fioJSON + '&ordm';
    document.getElementById( 'fioLink' ).setAttribute( 'href', "http://forecast.io/#/f/" + lat + "," + lng );
    getAverage();
}

//find average and inject into page
function getAverage () {
    var average = ( Math.round( ( yahooJSON + owmJSON + wuJSON + fioJSON ) / 4 ) );
    document.getElementById( 'averageDiv' ).innerHTML = average + '&ordm';
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
        .setContent( placeName )
        .openOn( map );
    L.tileLayer('http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png', {
        attribution: 'Map data &#169 OpenWeatherMap',    
    }).addTo(map);
}










