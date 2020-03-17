// declare global vars (doc- prefix means it is a DOM element)
var docCityInput = $('#citySearchInput').text();
var docSearchSubmit = $("#searchSubmit");
var docCityName = $('#cityName').text();
var docTemp = $('#temp').text();
var docHumidity = $('#humidity').text();
var docWind = $('#wind').text();
var docUVIndex = $('#uvIndex').text(); 
var ajaxResults;
var APIKey = '4905b4a966ed8015a260f7a118088eb9';

function getWeatherData(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        console.log(response);
        ajaxResults = response;

        // local vars
        let kelvin = parseInt(response.main.temp);
        let tempF = Math.round((kelvin - 273.15)*(1.8) + 32);
        let tempC = Math.round((kelvin - 273.15));

        function printData() {
        
        }
    });
}

docSearchSubmit.on("click", function(event) {
    event.preventDefault();
    getWeatherData(docCityInput);
}) 