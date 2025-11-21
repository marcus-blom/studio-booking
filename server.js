const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(cors()); // Tillater at frontend appen din snakker med denne serveren
app.use(bodyParser.json());

// Hjelpefunksjon for å lese data
const readData = () => {
    if (!fs.existsSync(DB_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
};

// Hjelpefunksjon for å skrive data
const writeData = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Endpoints

// 1. Hent alle bookinger
app.get('/bookings', (req, res) => {
    try {
        const bookings = readData();
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Kunne ikke hente bookinger' });
    }
});

// 2. Lagre en ny booking
app.post('/bookings', (req, res) => {
    try {
        const newBooking = req.body;
        
        // Enkel validering
        if (!newBooking.date || !newBooking.userName) {
            return res.status(400).json({ error: 'Mangler nødvendig data' });
        }

        const bookings = readData();
        
        // Generer en ID hvis den mangler (frontend gjør dette ofte, men trygt å ha her)
        if (!newBooking.id) {
            newBooking.id = Math.random().toString(36).substring(7);
        }

        bookings.push(newBooking);
        writeData(bookings);

        res.status(201).json(newBooking);
    } catch (error) {
        res.status(500).json({ error: 'Kunne ikke lagre booking' });
    }
});

// Start serveren
app.listen(PORT, () => {
    console.log(`Server kjører på port ${PORT}`);
});