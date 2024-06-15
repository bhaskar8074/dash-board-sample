const express = require('express');
const cors = require('cors');
const fs = require('fs');
const Papa = require('papaparse');

const app = express();
app.use(cors());

let inventoryData = [];

// Read and parse the CSV file
fs.readFile('sample-data.csv', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the CSV file', err);
        return;
    }
    Papa.parse(data, {
        header: true,
        complete: (results) => {
            inventoryData = results.data;
        }
    });
});

// API endpoint to serve inventory data
app.get('/api/inventory', (req, res) => {
    const { make, duration } = req.query;

    // Filter the data based on query parameters
    let filteredData = inventoryData;

    if (make) {
        filteredData = filteredData.filter(item => item.brand && item.brand.toLowerCase() === make.toLowerCase());
    }

    if (duration) {
        const durationMap = {
            'last-month': 1,
            'this-month': 0,
            'last-3-months': 3,
            'last-6-months': 6,
            'this-year': new Date().getFullYear(),
            'last-year': new Date().getFullYear() - 1,
        };
        const monthsToSubtract = durationMap[duration];
        
        if (typeof monthsToSubtract === 'number') {
            const filterDate = new Date();
            filterDate.setMonth(filterDate.getMonth() - monthsToSubtract);
            
            filteredData = filteredData.filter(item => new Date(item.timestamp) >= filterDate);
        } else if (typeof monthsToSubtract === 'string') {
            filteredData = filteredData.filter(item => new Date(item.timestamp).getFullYear() === monthsToSubtract);
        }
    }

    // Sort the data by date (assuming 'timestamp' field is in a valid date format)
    filteredData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(filteredData);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
