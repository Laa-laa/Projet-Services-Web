const db = require('../config/db');

const createLoan = async (bookId, borrower) => {
    const connection = db.promise();
    try {
        await connection.beginTransaction();

        const [bookRows] = await connection.query(`
            SELECT quantite - COUNT(emprunt.id) AS available_quantity
            FROM livres
            LEFT JOIN emprunt ON livres.id = emprunt.id_livre AND emprunt.date_retour IS NULL
            WHERE livres.id = ?
            GROUP BY livres.id, livres.quantite
        `, [bookId]);
        
        if (bookRows.length === 0) {
            throw new Error(`Book with ID ${bookId} does not exist`);
        }

        const availableQuantity = bookRows[0].available_quantity;
        if (availableQuantity <= 0) {
            throw new Error(`Book with ID ${bookId} is not available for loan`);
        }

        const [personRows] = await connection.query('SELECT id FROM personnes WHERE email = ?', [borrower.email]);

        let personId;
        if (personRows.length === 0) {
            const [result] = await connection.query(
                'INSERT INTO personnes (nom, prenom, email) VALUES (?, ?, ?)',
                [borrower.nom, borrower.prenom, borrower.email]
            );
            personId = result.insertId;
        } else {
            personId = personRows[0].id;
            await connection.query(
                'UPDATE personnes SET nom = ?, prenom = ? WHERE id = ?',
                [borrower.nom, borrower.prenom, personId]
            );
        }

        const [loanResult] = await connection.query(
            'INSERT INTO emprunt (id_livre, id_personne, date_emprunt) VALUES (?, ?, CURDATE())',
            [bookId, personId]
        );

        await connection.commit();
        return { id: loanResult.insertId, bookId, personId, date_emprunt: new Date().toISOString().split('T')[0] };
    } catch (error) {
        await connection.rollback();
        console.error('Database query failed:', error);
        throw error;
    }
};

const updateLoanReturnDate = async (loanId) => {
    const connection = db.promise();
    try {
        const [result] = await connection.query(
            'UPDATE emprunt SET date_retour = CURDATE() WHERE id = ?',
            [loanId]
        );
        if (result.affectedRows === 0) {
            throw new Error(`Loan with ID ${loanId} does not exist`);
        }
        return { id: loanId, date_retour: new Date().toISOString().split('T')[0] };
    } catch (error) {
        console.error('Database query failed:', error);
        throw error;
    }
};

module.exports = { createLoan, updateLoanReturnDate };
