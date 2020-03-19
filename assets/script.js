$(document).ready(function() {

// declare global vars (doc- prefix means it is a DOM element)
var docSearchSubmit = $("#searchSubmit");
var docCityName = $('#cityName');
var docTemp = $('#temp');
var docHumidity = $('#humidity');
var docWind = $('#wind');
var docUVIndex = $('#uvIndex'); 
var ajaxResults;
var APIKey = '4905b4a966ed8015a260f7a118088eb9';
var docPreviousSearches = $('#previousSearches');
var savedUserSearchHistory; 
if (localStorage.getItem("User Search History") !== null) {
    savedUserSearchHistory = JSON.parse(localStorage.getItem("User Search History")).slice(0).slice(-5);
    for (var i=0; i<savedUserSearchHistory.length; i++) {
        var row = $("<button>").addClass("list-group-item list-group-item-action");
        row.text(savedUserSearchHistory[i]);
        docPreviousSearches.prepend(row);
    }
} 



function getCurrentWeather(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        let currentResults = response;
        console.log(currentResults);

        // local vars
        let kelvin = parseInt(currentResults.main.temp);
        let tempF = Math.round((kelvin - 273.15)*(1.8) + 32);
        let tempC = Math.round((kelvin - 273.15));

        function printData() {
            docCityName.text(currentResults.name);
            docTemp.text('Current temperature: ' + tempF + '°F');
            docHumidity.text('Humidity: ' + currentResults.main.humidity + '%');
            docWind.text('Wind speed: '+ currentResults.wind.speed + ' MPH');
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
        let forecastAJAXResults = response;
        console.log(forecastAJAXResults);

        let tomorrow = forecastAJAXResults.list[0];
        let dayTwo = forecastAJAXResults.list[8];
        let dayThree = forecastAJAXResults.list[16];
        let dayFour = forecastAJAXResults.list[24];
        let dayFive = forecastAJAXResults.list[32];

        var forecastData = {
            days: [tomorrow,dayTwo,dayThree,dayFour,dayFive],
            kelvinConvert: function(day, fahrOrCelcius) {
                var temp;
                if (fahrOrCelcius === "f") {
                    temp = Math.round((day.main.temp - 273.15)*(1.8) + 32);
                    return temp;
                } else if (fahrOrCelcius === "c") {
                    temp = Math.round((day.main.temp - 273.15));
                    return temp;
                }
            },
            dateConvert: function(day) {
                convertedDate = moment(day.dt_txt).format('dddd, MM/DD');
                return convertedDate;
            },
            printData: function() {
                this.days.forEach(day => {
                    let card = $('<div>').addClass('card');
                    let cardBody = $('<div>').addClass('card-body');
                    let cardTitle = $("<h2>").addClass('card-title');
                    let description = $('<p>').text(day.weather[0].main);
                    let date = $('<p>').text(this.dateConvert(day));
                    let temp = $('<p>').text(this.kelvinConvert(day, 'f'));

                    cardBody.append(cardTitle, date, description, temp);
                    card.append(cardBody);
                    $('#weather-display').append(card);
                    // console.log(date + ': ' + temp + ' degrees. It will be: ' + description);
                });
            },
        };

        console.log(forecastData.days);
        console.log(forecastData.dateConvert(tomorrow));
        console.log(forecastData.kelvinConvert(tomorrow, 'f'));
        forecastData.printData();

    });

}

$("<input>").on("keypress", function(event) {
    event.preventDefault();
    var keycode = (event.keyCode ? event.keyCode : event.which); // listens for the Enter key only
    if (keycode === "13") {
        docSearchSubmit.click();
    }
})

function SaveDataToLocalStorage(data) {
    var a = [];
    // Parse the serialized data back into an array of objects
    a = JSON.parse(localStorage.getItem('User Search History')) || [];
    // Push the new data (whether it be an object or anything else) onto the array
    a.push(data);
    // Re-serialize the array back into a string and store it in localStorage
    localStorage.setItem('User Search History', JSON.stringify(a));
}

function displayResultsToPage(search) {
    $("#weather-display").removeClass("display-none");
    
    getCurrentWeather(search);
    SaveDataToLocalStorage(search);
}

// Event listeners
docSearchSubmit.on("click", function(event) {
    event.preventDefault();

    var docCityInput = $('#citySearchInput').val();
    docCityName.text('Loading...') // Show user loading text while waiting for API
    displayResultsToPage(docCityInput);
    
    var row = $("<button>").addClass("list-group-item list-group-item-action");
    row.text(docCityInput);
    docPreviousSearches.prepend(row);
    
    getForecast(docCityInput);
});

$(".list-group-item").on('click', function() {
    search = $(this).text();
    displayResultsToPage(search);
});

}); //End of script! Must write above this line!