const APIkey = 'c57586f78199aaa4318f82049325b058';
const citynametext = document.getElementById('cityname');
const button = document.getElementById('myBtn');
const previousCities = JSON.parse(localStorage.getItem('latLonArray'))

if (previousCities !== null) {
    let pastCities = '';
    for (cityIndex in previousCities) {
        const pastCity = previousCities[cityIndex].city
        console.log(pastCity);
        pastCities += `
            <div>
                <h3> ${pastCity} <h3>
            </div>
        `
    }
    document.getElementById('citieslist').innerHTML = pastCities;
}

//adds click event to submit button to start city lookup
button.addEventListener('click', (event) => {
    const pickedCity = citynametext.value
    NametoCoords(pickedCity);
    event.preventDefault()
});

// Grabs lat and Lon from City name
const getLatLong = async (cityName, limitNumber) => {
    const city = cityName
    const limit = limitNumber
    console.log(`${city} + ${limit}`)
    const result = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=${limit}&appid=${APIkey}`);

    const data = await result.json();
    return data[0]
};

//Gets current forecast of area
const currentForecastByArea = async (lat, lon) => {
    const result = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIkey}`);
    const returns = await result.json();
    const currentForecast = {
        Icon: returns.weather[0].icon,
        Temp: returns.main.temp,
        Wind: returns.wind.speed,
        Humidity: returns.main.humidity,
    };
    return currentForecast;
}

//Returns Forecast by lat and lon
const forecastByArea = async (lat, lon) => {
    const result = await fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${APIkey}`);

    const returns = await result.json();
    const middayarray = [];
    for (returnIndex in returns.list) {
        const singlereturn = returns.list[returnIndex]
        const midday = singlereturn.dt_txt
        if (midday.includes('15:00:00')) {
            const middayforecast = {
                Date: singlereturn.dt_txt,
                Icon: singlereturn.weather[0].icon,
                Temp: singlereturn.main.temp,
                Wind: singlereturn.wind.speed,
                Humidity: singlereturn.main.humidity,
            };
            middayarray.push(middayforecast);
        }
    }
    return middayarray;
};

//Creates a record of looked up cities and generates their lat and lon
const NametoCoords = async (pickedCity) => {
    const cityName = pickedCity;
    const limitNumber = '';
    const cities = await getLatLong(cityName, limitNumber);
    const precastInfo = {
        city: cities.name,
        latitude: cities.lat,
        longitude: cities.lon,
    };
    const latLonArray = JSON.parse(localStorage.getItem('latLonArray'));
    if (latLonArray == null) {
        const latLonArray = [];
        latLonArray.push(precastInfo);
        localStorage.setItem('latLonArray', JSON.stringify(latLonArray));
    } else {
        latLonArray.push(precastInfo);
        localStorage.setItem('latLonArray', JSON.stringify(latLonArray));
    }
    CoordstoWeather();
};
//Generates the API coords to a functioning weather display
const CoordstoWeather = async () => {
    const coords = JSON.parse(localStorage.getItem('latLonArray'));
    const i = 0
    console.log(i);
    const lat = coords[0].latitude
    const lon = coords[0].longitude
    const currentForecast = await currentForecastByArea(lat, lon);
    let currentInfo = '';
    const realIcon = `https://openweathermap.org/img/wn/${currentForecast.Icon}@2x.png`
    const fahTemp = Math.round(((currentForecast.Temp - 273.15) * 9 / 5 + 32) * 10) / 10
    currentInfo += `
        <div id="forecastNow">
            <h2> Right Now in ${citynametext.value} </h2>
            <img src="${realIcon}">
            <h4> Temp: ${fahTemp} </h4>
            <h4> Humidity: ${currentForecast.Humidity} g/kg </h4>
            <h4> Wind Speed: ${currentForecast.Wind} MPH </h4>
        </div>
        `
    document.getElementById('currentForecast').innerHTML = currentInfo;
    const forecasts = await forecastByArea(lat, lon);
    let infoPlacer = '';
    for (forecastIndex in forecasts) {
        const forecast = forecasts[forecastIndex]
        const realDate = forecast.Date.slice(0, 10)
        const iconImg = `https://openweathermap.org/img/wn/${forecast.Icon}@2x.png`
        const temp = forecast.Temp
        const fTemp = Math.round(((temp - 273.15) * 9 / 5 + 32) * 10) / 10
        infoPlacer += `
        <div id="forecasts">
            <h2> ${realDate} </h2>
            <img src="${iconImg}">
            <p> Temp: ${fTemp} </p>
            <p> Humidity: ${forecast.Humidity} g/kg </p>
            <p> Wind Speed: ${forecast.Wind} MPH </p>
        </div>
        `
    }
    document.getElementById('forecast').innerHTML = infoPlacer;
}