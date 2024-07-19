const express = require('express');
const router = express.Router();
const { fetchBooksFromDatabase, fetchBookById, createBook  } = require('../services/bookService');

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

router.post('/', async (req, res) => {
    const { title, publicationYear, authorIds, quantity } = req.body;
    try {
        console.log(`Creating new book with title ${title}...`);
        const newBook = await createBook(title, publicationYear, authorIds, quantity);
        console.log("New book created:", newBook);
        res.status(201).json(newBook);
    } catch (error) {
        console.error("Error creating book:", error);
        res.status(400).json({ error: 'Failed to create book', details: error.message });
    }
});

module.exports = router;
