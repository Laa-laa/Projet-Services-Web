const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,      
  database: process.env.DB_NAME   
});

connection.connect(error => {
  if (error) {
    console.error("Failed to connect to the database:", error);
    return;
  }
  console.log("Successfully connected to the database.");
});

module.exports = connection;
