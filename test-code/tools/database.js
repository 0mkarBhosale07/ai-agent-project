import { ObjectId } from 'mongodb';
import connectDB from './connection.js'; 

async function addTodo(title) {
    // console.log(`TODO: -----> ${title.title}`);
    
    const db = await connectDB();
    const result = await db.collection('todos').insertOne({ title:title.title, createdAt: new Date() });
    console.log('To-Do Added:', result.insertedId);
}

async function deleteTodoById(id) {
    // console.log(`Calling delete todo with id: ${id}`);
    const db = await connectDB();
    const result = await db.collection('todos').deleteOne({ _id: new ObjectId(id) });
    console.log(result.deletedCount ? 'To-Do Deleted' : 'To-Do Not Found');
}

async function deleteTodoByName(name) {
    const db = await connectDB();
        db.todos.delete({ title: new RegExp(name, 'i') });
}

async function searchTodo(query) {
    // console.log(`Calling single todo with query: ${query}`);
    const db = await connectDB();
    return db.collection('todos').find({ title: { $regex: query, $options: 'i' } }).toArray();
}

async function getAllTodos() {
    // console.log(`Calling all todos`);
    const db = await connectDB();
    return db.collection('todos').find({}).toArray();
}

export  {
    addTodo,
    deleteTodoById,
    searchTodo,
    getAllTodos,
    deleteTodoByName
};
