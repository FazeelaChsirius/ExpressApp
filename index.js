const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const fs = require('fs').promises; 

const app = express();
const PORT = 8000;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/my_database', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Schema for MongoDB
const dataSchema = new mongoose.Schema({
    htmlContent: String,
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

// Create MongoDB Model
const Data = mongoose.model('Data', dataSchema);

// Add Middleware
app.use(express.urlencoded({ extended: false }));

// Function to read files
async function readFiles() {
    try {
        const response = await axios.get('https://portal.canadatel.net/s/2bomsq4X9x8ssNz');
        const htmlContent = response.data;

        const newData = new Data({
            htmlContent: htmlContent
        });
        await newData.save();

    } catch (error) {
        console.error('Error in Reading Files', error);
    }
}
// Route handler for the endpoint to display response
app.get('/response', async (req, res) => {
    try {
        await readFiles();
        const dataFromMongo = await Data.findOne().sort({ createdAt: -1 });
        res.send(dataFromMongo.htmlContent);

    } catch (error) {
        console.error('Error:', error);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

