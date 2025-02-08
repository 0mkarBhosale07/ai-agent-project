// Required dependencies
import { Ollama } from "@langchain/ollama";
import { MongoClient } from 'mongodb';
import axios from 'axios';
import readline from 'readline';

// MongoDB Configuration
const uri = 'mongodb://localhost:27017';
const dbName = 'aiAgentDB';
const collectionName = 'data';

// Weather API Configuration (replace with your API key)
const WEATHER_API_KEY = 'e7e52de1d03c2de6fe0c0b4b77cc1d58';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Initialize MongoDB Client
const client = new MongoClient(uri);

// Initialize Langchain Models
const ollamaModel = new Ollama({
  model: "deepseek-r1:latest", // Default value
  temperature: 0.7,
});

// Console Interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to fetch real-time weather

async function Instagram(username) {
    const options = {
  method: 'GET',
  url: 'https://instagram-scraper-api2.p.rapidapi.com/v1/info',
  params: {
    username_or_id_or_url: `${username}`
  },
  headers: {
    'x-rapidapi-key': '4841331acemshe3f84a034ba55cdp1ce1fdjsn800f7d3307f1',
    'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
  }
};

try {
	const response = await axios.request(options);
    const data = await response.data.data;
    // console.log(data.data.full_name);
    // console.log(`Instagram User: ${data.username}, Full Name: ${data.full_name}, Followers: ${data.follower_count}, Following: ${data.following_count}`);
    
    return `Instagram User: ${data.username}, Full Name: ${data.full_name}, Followers: ${data.follower_count}, Following: ${data.following_count}`;
} catch (error) {
	console.error(error);
}
}

// Function for MongoDB CRUD Operations
async function performCRUD(action, data) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    switch (action) {
      case 'create':
        await collection.insertOne(data);
        return 'Data inserted successfully.';
      case 'read':
        const result = await collection.find({}).toArray();
        return JSON.stringify(result, null, 2);
      case 'update':
        await collection.updateOne({ _id: data.id }, { $set: data.update });
        return 'Data updated successfully.';
      case 'delete':
        await collection.deleteOne({ _id: data.id });
        return 'Data deleted successfully.';
      default:
        return 'Invalid CRUD operation.';
    }
  } finally {
    await client.close();
  }
}

// Main function to handle user input
async function main() {
  rl.question('Enter your command: ', async (command) => {
    if (command.startsWith('weather')) {
      const city = command.split(' ')[1];
      console.log(await getWeather(city));
    } else if (command.startsWith('instagram')) {
        const username = command.split(' ')[1];
      console.log(await Instagram(username));
    }
    else if (command.startsWith('crud')) {
      const [_, action, ...params] = command.split(' ');
      const data = JSON.parse(params.join(' '));
      console.log(await performCRUD(action, data));
    } else {
      const response = await ollamaModel.call(command);
      console.log('AI Response:', response);
    }
    main(); // Keep the console active
  });
}

main();
