const express = require('express');
const router = express.Router();
const { fetchBooksFromDatabase } = require('../services/bookService');

router.get('/', async (req, res) => {
    try {
        console.log("Fetching books from database...");
        const books = await fetchBooksFromDatabase();
        console.log("Books fetched:", books);
        res.json(books);
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
