// Import Package node.js yang dibutuhin
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');

// Buat aplikasi express
const app = express();

// Buat middleware buat parsing JSON
// dan enable CORS
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

// Buat konfig untuk nyambung ke database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '', 
  database: 'mood_tracker',
});

// Koneksi ke database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database');
});

// Ini buat ambil data dari db
app.get('/api/logs', (req, res) => {
  const query = 'SELECT * FROM moods ORDER BY date DESC';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Error fetching mood data');
    }
    res.json(results);
  });
});

// Insert mood baruuuuuuuuuuuuuuuuu 
app.post('/api/logs', (req, res) => {
  const { mood, date } = req.body;
  const query = 'INSERT INTO moods (mood, date) VALUES (?, ?)'; 
  db.query(query, [mood, date], (err, result) => {
    if (err) {
      return res.status(500).send('Error logging mood');
    }
    res.json({ id: result.insertId, mood, date });
  });
});
