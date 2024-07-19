require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());

const booksRouter = require('./src/api/books');
const loansRouter = require('./src/api/loans');
const searchRouter = require('./src/api/search');

const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.headers['X-Api-Key'];
    console.log('Received API Key:', apiKey);
    if (apiKey === process.env.API_KEY) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized: Invalid API key' });
    }
};

app.use(apiKeyMiddleware);
app.use('/api/livre', booksRouter);
app.use('/api/emprunt', loansRouter);
app.use('/api/recherche', searchRouter);

app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.use((error, req, res, next) => {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/api/`);
    console.log('API Key from .env:', process.env.API_KEY);
});

module.exports = app;
