const express = require('express');
const router = express.Router();
const { fetchBooksFromDatabase, fetchBookById } = require('../services/bookService');

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

router.get('/:id', async (req, res) => {
    const bookId = req.params.id;
    try {
        console.log(`Fetching book with ID ${bookId} from database...`);
        const book = await fetchBookById(bookId);
        if (book) {
            console.log("Book fetched:", book);
            res.json(book);
        } else {
            res.status(404).json({ error: 'Book not found' });
        }
    } catch (error) {
        console.error("Error fetching book:", error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
