require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const defaultPortNumber = 3000;
const PORT = process.env.PORT || defaultPortNumber;

mongoose.connect('mongodb://127.0.0.1:27017/test')
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const AuthorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  birthday: { type: Date, required: true },
});

const Author = mongoose.model('Author', AuthorSchema);

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  pages: { type: Number, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
});

const Book = mongoose.model('Book', BookSchema);

app.post('/authors', async (req, res) => {
  try {
    const { name, birthday } = req.body;
    const author = new Author({ name, birthday });
    await author.save();
    res.status(201).json(author);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/books', async (req, res) => {
  try {
    const { title, pages, authorId } = req.body;

    const author = await Author.findById(authorId);
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }

    const book = new Book({ title, pages, author: authorId });
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/books', async (req, res) => {
  try {
    const books = await Book.find().populate('author');
    res.json(books);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

