import axios from 'axios';


export const getWeather = async (city) => {
    // console.log(`Weather function called for the city ${city}`);
    
  try {
    const options = {
      method: 'GET',
      url: `http://api.weatherstack.com/current?access_key=4449982314f23a85276932de775ad45c&query=${city}`,
    };

    const response = await axios.request(options);
    // console.log(`Weather ----->`);
    // console.log(response.data);
    
    return `Weather in ${city} Feels Like ${response.data.current.weather_descriptions}, Temperature: ${response.data.current.temperature}°c`;
  } catch (error) {
    return `Error fetching weather data for ${city}`;
  }
};
