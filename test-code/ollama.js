import ollama from 'ollama';
import readlineSync from 'readline-sync';

import {getWeather} from './tools/weather.js';
import {getStockValue} from './tools/stock.js';

import {addTodo,
    deleteTodoById,
    searchTodo,
    getAllTodos, deleteTodoByName} from "./tools/database.js"


const tools = { getWeather,addTodo,
    deleteTodoById,
    searchTodo,
    getAllTodos, deleteTodoByName, getStockValue };

const SYSTEM_PROMPT = `
AVAILABLE FUNCTIONS:
- getWeather (input: string)
- addTodo (input: {title: string})
- deleteTodoById (input: string (ID))
- deleteTodoByName (input: string (name))
- searchTodo (input: string (query))
- getAllTodos (no input)
- getStockValue (input: string (symbol))


You MUST respond with SINGLE VALID JSON OBJECTS only. Follow this template:

{
  "type": "plan"|"action"|"output",
  "plan": "...",          // Only for type=plan
  "function": "...",      // Only for type=action
  "input": "...",         // Only for type=action
  "output": "..."         // Only for type=output
}

Examples of VALID RESPONSES:
{"type":"plan","plan":"Get weather for Mumbai"}
{"type":"action","function":"getWeather","input":"Mumbai"}
{"type":"output","output":"Weather is 75°F"}

Example of adding todos as a title of Buy Groceries to the database:
{"type":"plan","plan":"Get the todo task"}
{"type":"action","function":"addTodo","input":{"title":"Buy Groceries"}}
{"type":"output","output":"Buy Groceries added to the list"}

After adding the todo make sure to responce like ""{"type":"output","output":"Buy Groceries added to the list"}""
After deleting the todo make sure to responce like ""{"type":"output","output":"Buy Groceries deleted from the list"}""
After searching the todo make sure to responce like ""{"type":"output","output":"Buy Groceries found in the list"}""
After getting all the todos make sure to responce like this and new task on new line ""{"type":"output","output":"1. Buy Groceries, 2.Buy Vegetables"}""

getStockValue function will return the stock value of the given symbol
{"type":"Output","output":"Stock value of DJI.INDX \n Symbol: INDX, \nOpen: 345.67, \nHigh: 345.67, \nLow: 345.67, \nClose: 345.67, \nVolume: 345.67, \nDate: 2021-09-09"}

Make sure to add the new line character after each value in the output


NEVER:
- Add text outside JSON
- Use multi-line JSON
- Leave JSON incomplete
- Add comments
`;

const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

while (true) {
  const query = readlineSync.question('>> ');
  messages.push({ role: 'user', content: JSON.stringify({ type: 'user', user: query }) });

  while (true) {
    try {
      const chat = await ollama.chat({
        model: 'llama3.1', // Changed to mistral for better JSON handling
        messages,
        format: 'json',
        options: { temperature: 0.5 } // Lower temperature for more consistency
      });

      const result = chat.message.content;
      messages.push({ role: 'assistant', content: result });

      // Sanitize JSON response
      const sanitized = result
        .replace(/^[^{]*/, '') // Remove leading non-JSON text
        .replace(/[^}]*$/, '') // Remove trailing non-JSON text
        .trim();

      if (!sanitized.startsWith('{') || !sanitized.endsWith('}')) {
        throw new Error('Invalid JSON structure');
      }

      const call = JSON.parse(sanitized);

      if (call.type === 'output') {
        console.log(`🤖 : ${call.output}`);
        break;
      } else if (call.type === 'action') {
        const observation = await tools[call.function](call.input);
        messages.push({
          role: 'user',
          content: JSON.stringify({ type: 'observation', observation })
        });
      } else if (call.type === 'plan') {
        continue; // Proceed to next step
      } else {
        console.log('⚠️  Unknown response type:', call.type);
        break;
      }
    } catch (error) {
      console.error('🛑 JSON Error:', error.message);
      messages.push({
        role: 'user',
        content: JSON.stringify({
          type: 'error',
          error: 'INVALID_JSON_RESPONSE'
        })
      });
      continue; // Retry the request
    }
  }
}