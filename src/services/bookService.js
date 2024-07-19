const db = require('../config/db'); 

const fetchBooksFromDatabase = async () => {
    try {
        const [rows] = await db.promise().query(`
            SELECT 
                livres.id AS book_id, 
                livres.titre AS title, 
                livres.annee_publication AS publication_year, 
                livres.quantite AS quantity, 
                GROUP_CONCAT(CONCAT(auteurs.prenom, ' ', auteurs.nom) SEPARATOR ', ') AS authors 
            FROM livres 
            JOIN auteur_livre ON livres.id = auteur_livre.id_livre 
            JOIN auteurs ON auteur_livre.id_auteur = auteurs.id 
            GROUP BY livres.id, livres.titre, livres.annee_publication, livres.quantite
        `);
        console.log("Data received from database:", rows);
        return rows;
    } catch (error) {
        console.error('Database query failed:', error);
        throw error;
    }
};

const fetchBookById = async (bookId) => {
    try {
        const [rows] = await db.promise().query(`
            SELECT 
                livres.id AS book_id, 
                livres.titre AS title, 
                livres.annee_publication AS publication_year, 
                livres.quantite AS quantity, 
                GROUP_CONCAT(CONCAT(auteurs.prenom, ' ', auteurs.nom) SEPARATOR ', ') AS authors 
            FROM livres 
            JOIN auteur_livre ON livres.id = auteur_livre.id_livre 
            JOIN auteurs ON auteur_livre.id_auteur = auteurs.id 
            WHERE livres.id = ? 
            GROUP BY livres.id, livres.titre, livres.annee_publication, livres.quantite
        `, [bookId]);
        console.log("Data received from database for book ID", bookId, ":", rows);
        return rows.length ? rows[0] : null;
    } catch (error) {
        console.error('Database query failed:', error);
        throw error;
    }
};

const createBook = async (title, publicationYear, authorIds, quantity = 1) => {
    const connection = db.promise();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO livres (titre, annee_publication, quantite) VALUES (?, ?, ?)',
            [title, publicationYear, quantity]
        );
        const bookId = result.insertId;

        for (const authorId of authorIds) {
            const [authorRows] = await connection.query('SELECT id FROM auteurs WHERE id = ?', [authorId]);
            if (authorRows.length === 0) {
                throw new Error(`Author with ID ${authorId} does not exist`);
            }
            await connection.query('INSERT INTO auteur_livre (id_auteur, id_livre) VALUES (?, ?)', [authorId, bookId]);
        }

        await connection.commit();
        return { id: bookId, title, publicationYear, quantity };
    } catch (error) {
        await connection.rollback();
        console.error('Database query failed:', error);
        throw error;
    }
};

const updateBook = async (bookId, title, publicationYear, authorIds) => {
    const connection = db.promise();
    try {
        await connection.beginTransaction();

        await connection.query(
            'UPDATE livres SET titre = ?, annee_publication = ? WHERE id = ?',
            [title, publicationYear, bookId]
        );

        await connection.query('DELETE FROM auteur_livre WHERE id_livre = ?', [bookId]);

        for (const authorId of authorIds) {
            const [authorRows] = await connection.query('SELECT id FROM auteurs WHERE id = ?', [authorId]);
            if (authorRows.length === 0) {
                throw new Error(`Author with ID ${authorId} does not exist`);
            }
            await connection.query('INSERT INTO auteur_livre (id_auteur, id_livre) VALUES (?, ?)', [authorId, bookId]);
        }

        await connection.commit();
        return { id: bookId, title, publicationYear };
    } catch (error) {
        await connection.rollback();
        console.error('Database query failed:', error);
        throw error;
    }
};

const fetchBookQuantity = async (bookId) => {
    try {
        const [rows] = await db.promise().query(`
            SELECT 
                livres.quantite AS total_quantity, 
                (livres.quantite - COUNT(emprunt.id)) AS available_quantity 
            FROM livres 
            LEFT JOIN emprunt ON livres.id = emprunt.id_livre AND emprunt.date_retour IS NULL
            WHERE livres.id = ? 
            GROUP BY livres.id, livres.quantite
        `, [bookId]);
        console.log("Quantity data received from database for book ID", bookId, ":", rows);
        return rows.length ? rows[0] : null; 
    } catch (error) {
        console.error('Database query failed:', error);
        throw error;
    }
};

const updateBookQuantity = async (bookId, newQuantity) => {
    const connection = db.promise();
    try {
        await connection.beginTransaction();

        const [loanRows] = await connection.query(`
            SELECT COUNT(*) AS ongoing_loans 
            FROM emprunt 
            WHERE id_livre = ? AND date_retour IS NULL
        `, [bookId]);
        const ongoingLoans = loanRows[0].ongoing_loans;

        if (newQuantity < ongoingLoans) {
            throw new Error(`New quantity ${newQuantity} is less than the number of ongoing loans ${ongoingLoans}`);
        }

        await connection.query('UPDATE livres SET quantite = ? WHERE id = ?', [newQuantity, bookId]);

        await connection.commit();
        return { id: bookId, newQuantity };
    } catch (error) {
        await connection.rollback();
        console.error('Database query failed:', error);
        throw error;
    }
};

const deleteBook = async (bookId) => {
    const connection = db.promise();
    try {
        await connection.beginTransaction();

        const [loanRows] = await connection.query(`
            SELECT COUNT(*) AS ongoing_loans 
            FROM emprunt 
            WHERE id_livre = ? AND date_retour IS NULL
        `, [bookId]);
        const ongoingLoans = loanRows[0].ongoing_loans;

        if (ongoingLoans > 0) {
            throw new Error(`Cannot delete book with ID ${bookId} because there are ongoing loans`);
        }

        await connection.query('DELETE FROM auteur_livre WHERE id_livre = ?', [bookId]);

        await connection.query('DELETE FROM livres WHERE id = ?', [bookId]);

        await connection.commit();
        return { id: bookId };
    } catch (error) {
        await connection.rollback();
        console.error('Database query failed:', error);
        throw error;
    }
};

module.exports = { fetchBooksFromDatabase, fetchBookById, createBook, updateBook, fetchBookQuantity, updateBookQuantity, deleteBook };