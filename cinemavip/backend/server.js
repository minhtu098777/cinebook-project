const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'your-secret-key'; // In production, use environment variable

app.use(cors());
app.use(express.json());

// Dummy data
let users = [];
let movies = [
  { id: 1, title: 'Avengers: Endgame', genre: 'Action', duration: '3h 2m', description: 'Epic superhero conclusion.', image: 'https://via.placeholder.com/300x400?text=Avengers' },
  { id: 2, title: 'Inception', genre: 'Sci-Fi', duration: '2h 28m', description: 'Mind-bending thriller.', image: 'https://via.placeholder.com/300x400?text=Inception' },
  { id: 3, title: 'The Dark Knight', genre: 'Action', duration: '2h 32m', description: 'Batman vs Joker.', image: 'https://via.placeholder.com/300x400?text=Dark+Knight' },
  { id: 4, title: 'Titanic', genre: 'Romance', duration: '3h 14m', description: 'Romantic tragedy.', image: 'https://via.placeholder.com/300x400?text=Titanic' },
  { id: 5, title: 'The Shawshank Redemption', genre: 'Drama', duration: '2h 22m', description: 'Story of hope.', image: 'https://via.placeholder.com/300x400?text=Shawshank' },
];
let bookings = [];

// Routes
app.get('/api/movies', (req, res) => {
  res.json(movies);
});

app.get('/api/movies/:id', (req, res) => {
  const movie = movies.find(m => m.id == req.params.id);
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).json({ message: 'Movie not found' });
  }
});

app.post('/api/register', async (req, res) => {
  const { name, age, city, language, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { id: users.length + 1, name, age, city, language, email, password: hashedPassword };
  users.push(user);
  res.status(201).json({ message: 'User registered successfully' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY);
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.post('/api/bookings', (req, res) => {
  const { movieId, seats, date, time, userId } = req.body;
  const booking = { id: bookings.length + 1, movieId, seats, date, time, userId };
  bookings.push(booking);
  res.status(201).json(booking);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});