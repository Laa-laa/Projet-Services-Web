const db = require('../config/db');

// Search for books based on keywords
const searchBooks = async (keywords) => {
    try {
        const [rows] = await db.promise().query(`
            SELECT 
                livres.id AS book_id, 
                livres.titre AS title, 
                GROUP_CONCAT(CONCAT(auteurs.prenom, ' ', auteurs.nom) SEPARATOR ', ') AS authors 
            FROM livres 
            JOIN auteur_livre ON livres.id = auteur_livre.id_livre 
            JOIN auteurs ON auteur_livre.id_auteur = auteurs.id 
            WHERE livres.titre LIKE ? OR auteurs.nom LIKE ? OR auteurs.prenom LIKE ?
            GROUP BY livres.id, livres.titre
        `, [`%${keywords}%`, `%${keywords}%`, `%${keywords}%`]);

        // Sort the results in JavaScript after retrieving from the database
        const sortedRows = rows.sort((a, b) => {
            if (a.title.includes(keywords)) return -1;
            if (b.title.includes(keywords)) return 1;
            if (a.authors.includes(keywords)) return -1;
            if (b.authors.includes(keywords)) return 1;
            return 0;
        });

        console.log("Search results from database:", sortedRows);
        return sortedRows;
    } catch (error) {
        console.error('Database query failed:', error);
        throw error;
    }
};

module.exports = { searchBooks };
