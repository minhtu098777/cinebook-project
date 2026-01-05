const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sql = require('mssql');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'your-secret-key'; // In production, use environment variable

// SQL Server config
const config = {
  user: 'sa',
  password: 'YourPassword123!',
  server: 'localhost',
  database: 'cinebook',
  options: {
    encrypt: false, // Set to true for Azure
    trustServerCertificate: true
  }
};

app.use(cors());
app.use(express.json());

// Database initialization
async function initDB() {
  try {
    await sql.connect(config);

    await sql.query(`
      CREATE TABLE roles (
        id SMALLINT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255)
      );

      INSERT INTO roles (id, name, description) VALUES
      (1, 'user', 'Standard user'),
      (10, 'moderator', 'Moderator'),
      (100, 'admin', 'Administrator');

      CREATE TABLE users (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(100),
        age INT,
        city VARCHAR(100),
        language VARCHAR(50),
        avatar_url VARCHAR(255),
        role_id SMALLINT NOT NULL DEFAULT 1,
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT fk_users_roles FOREIGN KEY (role_id) REFERENCES roles(id)
      );

      CREATE TABLE movies (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        title VARCHAR(255) NOT NULL,
        genre VARCHAR(100),
        duration VARCHAR(50),
        description NVARCHAR(MAX),
        image VARCHAR(255),
        is_upcoming BIT DEFAULT 0,
        created_at DATETIME2 DEFAULT SYSDATETIME(),
        updated_at DATETIME2 DEFAULT SYSDATETIME()
      );

      CREATE TABLE bookings (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        movie_id UNIQUEIDENTIFIER,
        seats INT,
        date VARCHAR(20),
        time VARCHAR(20),
        user_id UNIQUEIDENTIFIER,
        created_at DATETIME2 DEFAULT SYSDATETIME()
      );
    `);

    // Insert movies with fixed UUIDs for compatibility
    const movieUUIDs = [
      '550E8400-E29B-41D4-A716-446655440000',
      '550E8400-E29B-41D4-A716-446655440001',
      '550E8400-E29B-41D4-A716-446655440002',
      '550E8400-E29B-41D4-A716-446655440003',
      '550E8400-E29B-41D4-A716-446655440004',
      '550E8400-E29B-41D4-A716-446655440005'
    ];

    const movieData = [
      { title: 'Avengers: Endgame', genre: 'Action', duration: '3h 2m', description: 'Epic superhero conclusion.', image: 'https://via.placeholder.com/300x400?text=Avengers', is_upcoming: 0 },
      { title: 'Inception', genre: 'Sci-Fi', duration: '2h 28m', description: 'Mind-bending thriller.', image: 'https://via.placeholder.com/300x400?text=Inception', is_upcoming: 0 },
      { title: 'The Dark Knight', genre: 'Action', duration: '2h 32m', description: 'Batman vs Joker.', image: 'https://via.placeholder.com/300x400?text=Dark+Knight', is_upcoming: 0 },
      { title: 'Titanic', genre: 'Romance', duration: '3h 14m', description: 'Romantic tragedy.', image: 'https://via.placeholder.com/300x400?text=Titanic', is_upcoming: 0 },
      { title: 'The Shawshank Redemption', genre: 'Drama', duration: '2h 22m', description: 'Story of hope.', image: 'https://via.placeholder.com/300x400?text=Shawshank', is_upcoming: 0 },
      { title: 'Avatar 3', genre: 'Sci-Fi', duration: '3h 0m', description: 'Upcoming epic adventure.', image: 'https://via.placeholder.com/300x400?text=Avatar3', is_upcoming: 1 }
    ];

    for (let i = 0; i < movieData.length; i++) {
      const movie = movieData[i];
      const id = movieUUIDs[i];
      await sql.query(`INSERT INTO movies (id, title, genre, duration, description, image, is_upcoming) VALUES ('${id}', '${movie.title}', '${movie.genre}', '${movie.duration}', '${movie.description}', '${movie.image}', ${movie.is_upcoming})`);
    }
  } catch (err) {
    console.error('DB init error:', err);
  }
}

// API Routes

// API: Lấy danh sách tất cả phim
// Mục đích: Trả về danh sách phim để hiển thị trên trang chủ hoặc danh sách phim.
// Chi tiết: Trả về mảng JSON chứa thông tin phim (id, title, genre, duration, description, image).
app.get('/api/movies', async (req, res) => {
  try {
    const result = await sql.query('SELECT id, title, genre, duration, description, image FROM movies');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Lấy danh sách phim sắp chiếu
// Mục đích: Trả về danh sách phim sắp chiếu (is_upcoming = true).
// Chi tiết: Trả về mảng JSON chứa thông tin phim sắp chiếu.
app.get('/api/movies/upcoming', async (req, res) => {
  try {
    const result = await sql.query('SELECT id, title, genre, duration, description, image FROM movies WHERE is_upcoming = 1');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Lấy chi tiết một phim theo ID
app.get('/api/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql.query(`SELECT id, title, genre, duration, description, image FROM movies WHERE id = '${id}'`);
    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Đăng ký người dùng mới
// Mục đích: Cho phép người dùng tạo tài khoản mới.
// Chi tiết: Nhận dữ liệu từ body (name, age, city, language, email, password), mã hóa password bằng bcrypt, lưu vào database, trả về thông báo thành công.
app.post('/api/register', async (req, res) => {
  try {
    const { name, age, city, language, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await sql.query(`INSERT INTO users (email, password_hash, display_name, age, city, language) OUTPUT INSERTED.id VALUES ('${email}', '${hashedPassword}', '${name}', ${age}, '${city}', '${language}')`);
    res.status(201).json({ message: 'User registered successfully', id: result.recordset[0].id });
  } catch (err) {
    if (err.code === '23505') { // unique violation
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// API: Đăng nhập người dùng
// Mục đích: Xác thực thông tin đăng nhập và trả về token JWT để sử dụng cho các API bảo mật.
// Chi tiết: Kiểm tra email và password (so sánh với hash), nếu đúng, tạo và trả về JWT token; nếu sai, trả về lỗi 401.
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await sql.query(`SELECT id, password_hash FROM users WHERE email = '${email}'`);
    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      if (await bcrypt.compare(password, user.password_hash)) {
        const token = jwt.sign({ id: user.id, email: email }, SECRET_KEY);
        res.json({ token });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Đặt vé xem phim
// Mục đích: Cho phép người dùng đặt vé cho một phim cụ thể.
// Chi tiết: Nhận dữ liệu từ body (movieId, seats, date, time, userId), tạo booking mới, lưu vào database, trả về thông tin booking.
app.post('/api/bookings', async (req, res) => {
  try {
    const { movieId, seats, date, time, userId } = req.body;
    const result = await sql.query(`INSERT INTO bookings (movie_id, seats, date, time, user_id) OUTPUT INSERTED.id VALUES ('${movieId}', ${seats}, '${date}', '${time}', '${userId}')`);
    res.status(201).json({ id: result.recordset[0].id, movieId, seats, date, time, userId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database', err);
});