const express = require('express');
const router = express.Router();
const { createLoan, updateLoanReturnDate } = require('../services/loanService');

router.post('/', async (req, res) => {
    const { bookId, borrower } = req.body;
    try {
        console.log(`Creating new loan for book ID ${bookId}...`);
        const newLoan = await createLoan(bookId, borrower);
        console.log("New loan created:", newLoan);
        res.status(201).json(newLoan);
    } catch (error) {
        console.error("Error creating loan:", error);
        res.status(400).json({ error: 'Failed to create loan', details: error.message });
    }
});

router.put('/:id', async (req, res) => {
    const loanId = req.params.id;
    try {
        console.log(`Updating return date for loan ID ${loanId}...`);
        const updatedLoan = await updateLoanReturnDate(loanId);
        console.log("Loan updated:", updatedLoan);
        res.json(updatedLoan);
    } catch (error) {
        console.error("Error updating loan:", error);
        res.status(400).json({ error: 'Failed to update loan', details: error.message });
    }
});
module.exports = router;
