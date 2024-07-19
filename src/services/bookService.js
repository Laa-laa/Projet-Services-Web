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

module.exports = { fetchBooksFromDatabase, fetchBookById };