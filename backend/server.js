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

// Update mood
app.put('/api/logs/:id', (req, res) => {
  const { id } = req.params;
  const { mood } = req.body;
  const query = 'UPDATE moods SET mood = ? WHERE id = ?';
  db.query(query, [mood, id], (err, result) => {
    if (err) {
      return res.status(500).send('Error updating mood');
    }
    res.send('Mood updated');
  });
});

// Delete mood
app.delete('/api/logs/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM moods WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).send('Error deleting mood');
    }
    res.send('Mood deleted');
  });
});

//Buat baca index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});