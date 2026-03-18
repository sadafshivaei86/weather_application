document.addEventListener('DOMContentLoaded', () => {
    const countrySelect = document.getElementById('country-select');
    const resultsSection = document.getElementById('results-section');
    const loading = document.getElementById('loading');
    const errorToast = document.getElementById('error-message');

    // UI Elements
    const flagImg = document.getElementById('country-flag');
    const countryName = document.getElementById('country-name');
    const countryCapital = document.getElementById('country-capital');
    const countryPop = document.getElementById('country-population');
    const countryRegion = document.getElementById('country-region');
    const countryCurrency = document.getElementById('country-currency');
    const countryLanguages = document.getElementById('country-languages');

    const tempVal = document.getElementById('temperature');
    const windSpeed = document.getElementById('wind-speed');
    const weatherCondition = document.getElementById('weather-condition');
    const weatherDesc = document.getElementById('weather-desc');

    let countriesData = [];

    // Fetch all countries
    async function init() {
        try {
            showLoading(true);
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,population,region,currencies,languages,flags,latlng');
            if (!response.ok) throw new Error('Failed to fetch countries');
            
            countriesData = await response.json();
            
            // Sort countries alphabetically
            countriesData.sort((a, b) => a.name.common.localeCompare(b.name.common));
            
            // Populate select
            populateSelect(countriesData);
            countrySelect.disabled = false;
        } catch (err) {
            showError('Could not load countries. Please refresh the page.');
        } finally {
            showLoading(false);
        }
    }

    function populateSelect(countries) {
        countrySelect.innerHTML = '<option value="" selected disabled>Select a country...</option>';
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.name.common;
            option.textContent = country.name.common;
            countrySelect.appendChild(option);
        });
    }

    // Handle Selection
    countrySelect.addEventListener('change', async (e) => {
        const selectedName = e.target.value;
        const country = countriesData.find(c => c.name.common === selectedName);
        
        if (!country) return;

        try {
            showLoading(true);
            resultsSection.classList.add('hidden');
            
            // Update Country Info
            updateCountryUI(country);
            
            // Fetch Weather
            await fetchWeather(country.latlng[0], country.latlng[1]);
            
            resultsSection.classList.remove('hidden');
        } catch (err) {
            showError('Failed to fetch weather data.');
        } finally {
            showLoading(false);
        }
    });

    function updateCountryUI(country) {
        flagImg.src = country.flags.svg || country.flags.png;
        flagImg.alt = `Flag of ${country.name.common}`;
        countryName.textContent = country.name.common;
        countryCapital.textContent = country.capital ? country.capital[0] : 'No Capital';
        countryPop.textContent = country.population.toLocaleString();
        countryRegion.textContent = country.region;
        
        // Currency
        const currencies = country.currencies ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol})`).join(', ') : 'N/A';
        countryCurrency.textContent = currencies;
        
        // Languages
        const languages = country.languages ? Object.values(country.languages).join(', ') : 'N/A';
        countryLanguages.textContent = languages;
    }

    async function fetchWeather(lat, lon) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather fetch failed');
        
        const data = await response.json();
        const weather = data.current_weather;
        
        tempVal.textContent = Math.round(weather.temperature);
        windSpeed.textContent = `${weather.windspeed} km/h`;
        
        const condition = getWeatherCondition(weather.weathercode);
        weatherCondition.textContent = condition;
        weatherDesc.textContent = condition;
    }

    function getWeatherCondition(code) {
        const codes = {
            0: '☀️ Clear sky',
            1: '🌤️ Mainly clear', 2: '⛅ Partly cloudy', 3: '☁️ Overcast',
            45: '🌫️ Fog', 48: '🌫️ Depositing rime fog',
            51: '🌦️ Light drizzle', 53: '🌦️ Moderate drizzle', 55: '🌦️ Dense drizzle',
            61: '🌧️ Slight rain', 63: '🌧️ Moderate rain', 65: '🌧️ Heavy rain',
            71: '❄️ Slight snow', 73: '❄️ Moderate snow', 75: '❄️ Heavy snow',
            80: '🌦️ Slight rain showers', 81: '🌦️ Moderate rain showers', 82: '🌧️ Violent rain showers',
            95: '⛈️ Thunderstorm'
        };
        return codes[code] || '☁️ Cloudy';
    }

    function showLoading(show) {
        if (show) loading.classList.remove('hidden');
        else loading.classList.add('hidden');
    }

    function showError(msg) {
        errorToast.textContent = msg;
        errorToast.classList.remove('hidden');
        setTimeout(() => errorToast.classList.add('hidden'), 5000);
    }

    init();
});
