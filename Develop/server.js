const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const notesFilePath = path.join(__dirname, 'db/db.json');

// Function to generate a unique ID
const generateId = () => {
  return '_' + Math.random().toString(36).substr(2, 9);
};

// GET Route for retrieving all the notes
app.get('/api/notes', (req, res) => {
  fs.readFile(notesFilePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.json(JSON.parse(data));
    }
  });
});

// POST Route for a new note
app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  fs.readFile(notesFilePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).json(err);
    } else {
      const notes = JSON.parse(data);
      newNote.id = generateId(); // Generate a unique ID for the new note
      notes.push(newNote);
      fs.writeFile(notesFilePath, JSON.stringify(notes, null, 2), (err) => {
        if (err) {
          res.status(500).json(err);
        } else {
          res.json(newNote);
        }
      });
    }
  });
});

// DELETE Route for a specific note
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  fs.readFile(notesFilePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).json(err);
    } else {
      const notes = JSON.parse(data);
      const newNotes = notes.filter(note => note.id !== noteId);
      fs.writeFile(notesFilePath, JSON.stringify(newNotes, null, 2), err => {
        if (err) {
          res.status(500).json(err);
        } else {
          res.json({ message: 'Deleted successfully' });
        }
      });
    }
  });
});

// HTML Routes
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`App listening on PORT ${PORT}`));
