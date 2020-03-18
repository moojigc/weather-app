// declare global vars (doc- prefix means it is a DOM element)
var docCityInput;
var docSearchSubmit = $("#searchSubmit");
var docCityName = $('#cityName');
var docTemp = $('#temp');
var docHumidity = $('#humidity');
var docWind = $('#wind');
var docUVIndex = $('#uvIndex'); 
var ajaxResults;
var APIKey = '4905b4a966ed8015a260f7a118088eb9';
var docPreviousSearches = $('#previousSearches');
var savedUserSearchHistory = JSON.parse(localStorage.getItem("User Search History")); 

savedUserSearchHistory.forEach(city => {
    var row = $("<li>").addClass("list-group-item");
    row.text(city);
    docPreviousSearches.prepend(row);
})

function getCurrentWeather(city) {
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
            docCityName.text(response.name);
            docTemp.text('Current temperature: ' + tempF + '°F');
            docHumidity.text('Humidity: ' + response.main.humidity + '%');
            docWind.text('Wind speed: '+ response.wind.speed + ' MPH');
        }
        printData();
    });
}

function getForecast(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=" + APIKey;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        console.log(response);
        ajaxResults = response;

        // local vars


        // function printForecast() {

        // }
        // printForecast();
    });
}

$("<input>").on("keypress", function(event) {
    event.preventDefault();
    var keycode = (event.keyCode ? event.keyCode : event.which); // listens for the Enter key only
    if (keycode === "13") {
        docSearchSubmit.click();
    }
})

function SaveDataToLocalStorage(data)
{
    var a = [];
    // Parse the serialized data back into an aray of objects
    a = JSON.parse(localStorage.getItem('User Search History')) || [];
    // Push the new data (whether it be an object or anything else) onto the array
    a.push(data);
    // Re-serialize the array back into a string and store it in localStorage
    localStorage.setItem('User Search History', JSON.stringify(a));
}

function displayResultsToPage(search) {
    $("#weather-display").removeClass("display-none");
    
    if (search === "previous") {
        search = $(this).text();
    } else {
        docCityInput = $('#citySearchInput').val();
        getCurrentWeather(docCityInput);
        SaveDataToLocalStorage(docCityInput);
    }
}

docSearchSubmit.on("click", function(event) {
    event.preventDefault();
    displayResultsToPage();
})

$(".list-group-item", displayResultsToPage("previous"));