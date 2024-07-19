const express = require('express');
const router = express.Router();
const { searchBooks } = require('../services/searchService');

router.get('/:mots', async (req, res) => {
    const keywords = req.params.mots;
    try {
        console.log(`Searching for books with keywords: ${keywords}...`);
        const results = await searchBooks(keywords);
        console.log("Search results:", results);
        res.json(results);
    } catch (error) {
        console.error("Error during search:", error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
