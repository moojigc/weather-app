$(document).ready(function() {
let currentResults;
let currentUVResults;
let lat;
let lon;

// declare global vars (doc- prefix means it is a DOM element)
const $elements = [$('#searchSubmit'), $('#cityName'), $('#temp'), $('#humidity'), $('#wind'), $('#uvIndex'), $('#previousSearches'), $('#search-box-label') ];
const [ docSearchSubmit, docCityName, docTemp, docHumidity, docWind, docUVIndex, docPreviousSearches, docSearchBoxLabel ] = $elements;

const APIKey = '4905b4a966ed8015a260f7a118088eb9';
let savedUserSearchHistory; 

function getLocation() {
    let lat; let lon;
    docSearchBoxLabel.text('Getting location...');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            $("#weather-display").removeClass("visibility-hidden");
            getCurrentWeatherbyGeo(lat, lon);
            docSearchBoxLabel.text('Search for a City:');
        }, 
        function() {
            docSearchBoxLabel.text('Search for your City:');
        });
    } else {
        docCityName.text('Search for your City:');
        console.log("Geolocation is not supported by this browser.");
    }
}

function getCurrentWeatherbyGeo(lat, lon) {
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKey}`;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        currentResults = response;
        console.log(currentResults);
        // local vars
        const kelvin = parseInt(currentResults.main.temp);
        const tempF = Math.round((kelvin - 273.15)*(1.8) + 32);
        const tempC = Math.round((kelvin - 273.15));
    
        function printData() {
            docCityName.text(currentResults.name);
            docTemp.text('Current temperature: ' + tempF + '°F');
            docHumidity.text('Humidity: ' + currentResults.main.humidity + '%');
            docWind.text('Wind speed: '+ currentResults.wind.speed + ' MPH');
        }
        printData();
        getUVIndex(lat, lon);
        getForecast(currentResults.name);
    });
}

function getCurrentWeather(city) {
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}`;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        currentResults = response;
        console.log(currentResults);

        lat = currentResults.coord.lat;
        lon = currentResults.coord.lon;
        console.log(lat, lon);

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
        getUVIndex(lat, lon);
    });
}

function getUVIndex(lat, lon) {
    var queryURL = 'https://api.openweathermap.org/data/2.5/uvi?appid=' + APIKey + '&lat=' + lat + '&lon=' + lon;
    console.log(lat,lon)
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        currentUVResults = response;
        console.log(currentUVResults);
        var UVIndex = $('<span>').text(currentUVResults.value);
        docUVIndex.text('UV index: ').append(UVIndex);
        if (currentUVResults.value < 3) {
            UVIndex.attr('style', 'background-color: lightgreen; border-radius: .5rem;');
        } else if (3 < currentUVResults.value < 6) {
            UVIndex.attr('style', 'background-color: yellow; border-radius: .5rem;');
        } else if (6 < currentUVResults.value < 8) {
            UVIndex.attr('style', 'background-color: lightorange; border-radius: .5rem;');
        } else if (8 < currentUVResults.value < 10) {
            UVIndex.attr('style', 'background-color: red; border-radius: .5rem;');
        }
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
            dateConvert: function(day, nameOrDate) {
                if (nameOrDate === 'name') {
                    convertedDateName = moment(day.dt_txt).format('dddd');
                    return convertedDateName;
                } else if (nameOrDate === 'date') {
                    convertedDateNumber = moment(day.dt_txt).format('MMMM Do');
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

                    if (day.weather[0].main === 'Clouds') {
                        description.append($('<i class="fas fa-cloud">'))
                        card.attr('style', ' background: rgb(227,255,255); background: linear-gradient(180deg, rgba(227,255,255,0) 0%, rgba(138,138,138,0.6418768190870099) 100%); ');
                        
                    } else if (day.weather[0].main === 'Rain') {
                        description.append($('<i class="fas fa-cloud-showers-heavy">'));
                        card.attr('style', ' background: rgb(119,119,119); background: linear-gradient(180deg, rgba(119,119,119,0.7931373232886905) 0%, rgba(0,125,255,0.6418768190870099) 100%); ');
                    } else {
                        description.append($('<i class="far fa-sun">'))
                        card.attr('style', 'background: rgb(227,255,255); background: linear-gradient(180deg, rgba(227,255,255,0) 0%, rgba(0,95,255,0.6418768190870099) 100%); ');
                    }

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
    console.log('i ran');
    
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
    
    // docPreviousSearches.children().last().remove();
    var row = $("<button>").addClass("list-group-item list-group-item-action");
    row.text(docCityInput);
    docPreviousSearches.prepend(row);    

});

$(document).on("click", ".list-group-item", function() {
    search = $(this).text();
    displayResultsToPage(search);
});

if (localStorage.getItem("User Search History") !== null) {
    savedUserSearchHistory = JSON.parse(localStorage.getItem("User Search History")).slice(0).slice(-5);
    for (var i=0; i<savedUserSearchHistory.length; i++) {
        var row = $("<button>").addClass("list-group-item list-group-item-action");
        row.text(savedUserSearchHistory[i]);
        docPreviousSearches.prepend(row);
    }
    getLocation();
    if (getLocation() === true) {
        // display most recent search
        const mostRecentCity = savedUserSearchHistory.slice(-1)[0];
        displayResultsToPage(mostRecentCity);
    } 
}

}); //End of script! Must write above this line!