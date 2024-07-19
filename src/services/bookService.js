const db = require('../config/db');  // Ensure this path is correct

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
        
        // Insert the new book
        const [result] = await connection.query(
            'INSERT INTO livres (titre, annee_publication, quantite) VALUES (?, ?, ?)',
            [title, publicationYear, quantity]
        );
        const bookId = result.insertId;

        // Validate and insert author associations
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

module.exports = { fetchBooksFromDatabase, fetchBookById, createBook  };