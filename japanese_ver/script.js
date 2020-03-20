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

    // display most recent search
    var mostRecentCity = savedUserSearchHistory.slice(-1)[0]
    displayResultsToPage(mostRecentCity);
} 


function getCurrentWeather(city) {
    var lat; var lon;
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey + '&lang=ja';
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        let currentResults = response;
        console.log(currentResults);

        lat = currentResults.coord.lat;
        lon = currentResults.coord.lon;

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
    function getUVIndex() {
        var queryURL = "https://api.openweathermap.org/data/2.5/uvi?q=" + lat + '&' + lon + "&appid=" + APIKey;
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
            let currentUVResults = response;
            console.log(currentUVResults);
            // var UVIndex =  
            // docUVIndex.text('UV Index:')
        });
    }
    getUVIndex();
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
            dateConvert: function(day, nameOrDate) {
                if (nameOrDate === 'name') {
                    convertedDateName = moment(day.dt_txt).format('dddd');
                    return convertedDateName;
                } else if (nameOrDate === 'date') {
                    convertedDateNumber = moment(day.dt_txt).format('MM/DD');
                    return convertedDateNumber;
                }
            },
            printData: function() {
                $("#weather-display").find('.row').empty();
                this.days.forEach(day => {
                    let card = $('<div>').addClass('card col-lg-2 forecast-card');
                    let cardBody = $('<div>').addClass('card-body');
                    let dayName = $("<h3>").addClass('card-title').text(this.dateConvert(day, 'name'));
                    let date = $('<p>').text(this.dateConvert(day, 'date'));
                    let description = $('<p>').text(day.weather[0].main);
                    let temp = $('<p>').text(this.kelvinConvert(day, 'f') + '°F');

                    cardBody.append(dayName, date, description, temp);
                    card.append(cardBody);

                    $('#weather-display').find('.row').append(card);
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
    $("#weather-display").removeClass("visibility-hidden");
    
    getCurrentWeather(search);
    getForecast(search);
}

// Event listeners
docSearchSubmit.on("click", function(event) {
    event.preventDefault();

    var docCityInput = $('#citySearchInput').val();
    docCityName.text('Loading...') // Show user loading text while waiting for API
    displayResultsToPage(docCityInput);
    SaveDataToLocalStorage(docCityInput);
    
    docPreviousSearches.children().last().remove();
    var row = $("<button>").addClass("list-group-item list-group-item-action");
    row.text(docCityInput);
    docPreviousSearches.prepend(row);    

});

$(".list-group-item").on('click', function() {
    search = $(this).text();
    displayResultsToPage(search);
});

}); //End of script! Must write above this line!