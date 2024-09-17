const APIkey = 'c57586f78199aaa4318f82049325b058';

const city = 'London';
const limit = '';
// Grabs lat and Lon from City name
const getLatLong = async () => {
    const result = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=${limit}&appid=${APIkey}`);

    const data = await result.json();
    return data[0]
};

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

//Creates a record of previously looked up cities and generates their lat and lon
const NametoCoords = async () => {
    const name = `${city}`
    const cities = await getLatLong(name);
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
        console.log(latLonArray);
    } else {
        latLonArray.push(precastInfo);
        localStorage.setItem('latLonArray', JSON.stringify(latLonArray));
        console.log(precastInfo);
    }
    console.log(latLonArray);
    CoordstoWeather();
};
//Generates the API coords to a functioning weather display
const CoordstoWeather = async () => {
    const coords = JSON.parse(localStorage.getItem('latLonArray'));
    const i = 0
    console.log(i);
    const lat = coords[0].latitude
    const lon = coords[0].longitude
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

NametoCoords();