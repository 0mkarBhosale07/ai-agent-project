import axios from 'axios';


export const getStockValue = async (symbol) => {
    
  try {
    const options = {
      method: 'GET',
      url: `http://api.marketstack.com/v1/eod?access_key=231bd7a7304a88a38e5cbc2d065a2fcc&symbols=${symbol}`,
    };

    const response = await axios.request(options);

    
    return `Stock value for ${symbol} are\n Date ${response.data.date} \n Exchange: ${response.data.exchange} \n Open: ${response.data.open} \n High: ${response.data.high} \n Low: ${response.data.low} \n Close: ${response.data.close} \n Volume: ${response.data.volume}`;
  } catch (error) {
    return `Error fetching weather data for ${city}`;
  }
};
