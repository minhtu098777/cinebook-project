/* =========================
   CINEBOOK - SQL SERVER SCHEMA
   ========================= */

-- =========================
-- ROLES
-- =========================
CREATE TABLE roles (
  id SMALLINT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255)
);

INSERT INTO roles (id, name, description) VALUES
(1, 'user', 'Standard user'),
(10, 'moderator', 'Moderator'),
(100, 'admin', 'Administrator');

-- =========================
-- USERS
-- =========================
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

  CONSTRAINT fk_users_roles FOREIGN KEY (role_id)
    REFERENCES roles(id)
);

-- =========================
-- PEOPLE
-- =========================
CREATE TABLE people (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  full_name VARCHAR(255) NOT NULL,
  bio NVARCHAR(MAX),
  date_of_birth DATE,
  country VARCHAR(100),
  image_url VARCHAR(255),
  created_at DATETIME2 DEFAULT SYSDATETIME(),
  updated_at DATETIME2 DEFAULT SYSDATETIME()
);

-- =========================
-- GENRES
-- =========================
CREATE TABLE genres (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  kind VARCHAR(10) CHECK (kind IN ('movie','book')),
  created_at DATETIME2 DEFAULT SYSDATETIME()
);

-- =========================
-- MOVIES
-- =========================
CREATE TABLE movies (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  synopsis NVARCHAR(MAX),
  release_date DATE,
  duration_minutes INT,
  language VARCHAR(50),
  country VARCHAR(50),
  poster_url VARCHAR(255),
  created_at DATETIME2 DEFAULT SYSDATETIME(),
  updated_at DATETIME2 DEFAULT SYSDATETIME()
);

-- =========================
-- BOOKS
-- =========================
CREATE TABLE books (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  synopsis NVARCHAR(MAX),
  published_date DATE,
  page_count INT,
  isbn VARCHAR(20) UNIQUE,
  publisher VARCHAR(100),
  language VARCHAR(50),
  cover_url VARCHAR(255),
  created_at DATETIME2 DEFAULT SYSDATETIME(),
  updated_at DATETIME2 DEFAULT SYSDATETIME()
);

-- =========================
-- MANY TO MANY
-- =========================
CREATE TABLE movie_genres (
  movie_id UNIQUEIDENTIFIER,
  genre_id UNIQUEIDENTIFIER,
  PRIMARY KEY (movie_id, genre_id),
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);

CREATE TABLE book_genres (
  book_id UNIQUEIDENTIFIER,
  genre_id UNIQUEIDENTIFIER,
  PRIMARY KEY (book_id, genre_id),
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);

CREATE TABLE movie_cast (
  movie_id UNIQUEIDENTIFIER,
  person_id UNIQUEIDENTIFIER,
  character_name VARCHAR(255),
  billing_order SMALLINT,
  PRIMARY KEY (movie_id, person_id),
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE
);

CREATE TABLE book_authors (
  book_id UNIQUEIDENTIFIER,
  person_id UNIQUEIDENTIFIER,
  contribution_role VARCHAR(50),
  author_order SMALLINT,
  PRIMARY KEY (book_id, person_id),
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE
);

-- =========================
-- REVIEWS
-- =========================
CREATE TABLE reviews (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  user_id UNIQUEIDENTIFIER NULL,
  subject_type VARCHAR(10) NOT NULL CHECK (subject_type IN ('movie','book')),
  subject_id UNIQUEIDENTIFIER NOT NULL,
  title VARCHAR(255),
  body NVARCHAR(MAX),
  rating SMALLINT CHECK (rating BETWEEN 0 AND 10),
  is_published BIT DEFAULT 1,
  created_at DATETIME2 DEFAULT SYSDATETIME(),
  updated_at DATETIME2 DEFAULT SYSDATETIME(),

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_reviews_subject ON reviews(subject_type, subject_id);

-- =========================
-- COMMENTS
-- =========================
CREATE TABLE comments (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  review_id UNIQUEIDENTIFIER NOT NULL,
  user_id UNIQUEIDENTIFIER NULL,
  parent_id UNIQUEIDENTIFIER NULL,
  body NVARCHAR(MAX) NOT NULL,
  created_at DATETIME2 DEFAULT SYSDATETIME(),
  updated_at DATETIME2 DEFAULT SYSDATETIME(),

  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parent_id) REFERENCES comments(id)
);

-- =========================
-- THEATERS / SCREENS / SEATS
-- =========================
CREATE TABLE theaters (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  description NVARCHAR(MAX),
  created_at DATETIME2 DEFAULT SYSDATETIME()
);

CREATE TABLE screens (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  theater_id UNIQUEIDENTIFIER NOT NULL,
  name VARCHAR(100),
  capacity INT,
  created_at DATETIME2 DEFAULT SYSDATETIME(),

  FOREIGN KEY (theater_id) REFERENCES theaters(id) ON DELETE CASCADE
);

CREATE TABLE seats (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  screen_id UNIQUEIDENTIFIER NOT NULL,
  row_label VARCHAR(5) NOT NULL,
  seat_number INT NOT NULL CHECK (seat_number > 0),
  seat_type VARCHAR(20) DEFAULT 'standard',

  UNIQUE (screen_id, row_label, seat_number),
  FOREIGN KEY (screen_id) REFERENCES screens(id) ON DELETE CASCADE
);

-- =========================
-- SCREENINGS
-- =========================
CREATE TABLE screenings (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  movie_id UNIQUEIDENTIFIER NOT NULL,
  screen_id UNIQUEIDENTIFIER NOT NULL,
  start_time DATETIME2 NOT NULL,
  end_time DATETIME2 NOT NULL,
  language VARCHAR(50),
  subtitles VARCHAR(50),
  base_price DECIMAL(10,2) DEFAULT 0,
  created_at DATETIME2 DEFAULT SYSDATETIME(),

  CHECK (end_time > start_time),
  FOREIGN KEY (movie_id) REFERENCES movies(id),
  FOREIGN KEY (screen_id) REFERENCES screens(id)
);

CREATE INDEX idx_screenings_movie_start
ON screenings(movie_id, start_time);

-- =========================
-- BOOKINGS / TICKETS
-- =========================
CREATE TABLE bookings (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  user_id UNIQUEIDENTIFIER NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','paid','cancelled')),
  payment_provider VARCHAR(50),
  payment_reference VARCHAR(100),
  created_at DATETIME2 DEFAULT SYSDATETIME(),
  updated_at DATETIME2 DEFAULT SYSDATETIME(),

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tickets (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  booking_id UNIQUEIDENTIFIER NOT NULL,
  screening_id UNIQUEIDENTIFIER NOT NULL,
  seat_id UNIQUEIDENTIFIER NULL,
  price DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'reserved'
    CHECK (status IN ('reserved','purchased','cancelled')),
  purchased_at DATETIME2,

  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE CASCADE,
  FOREIGN KEY (seat_id) REFERENCES seats(id)
);

-- =========================
-- FAVORITES
-- =========================
CREATE TABLE favorites (
  user_id UNIQUEIDENTIFIER,
  subject_type VARCHAR(10) CHECK (subject_type IN ('movie','book')),
  subject_id UNIQUEIDENTIFIER,
  created_at DATETIME2 DEFAULT SYSDATETIME(),
  PRIMARY KEY (user_id, subject_type, subject_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================
-- USER SESSIONS
-- =========================
CREATE TABLE user_sessions (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  user_id UNIQUEIDENTIFIER NOT NULL,
  provider VARCHAR(50),
  provider_uid VARCHAR(100),
  ip_address VARCHAR(50),
  user_agent NVARCHAR(255),
  created_at DATETIME2 DEFAULT SYSDATETIME(),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================
-- UPDATED_AT TRIGGERS
-- =========================
GO
CREATE TRIGGER trg_users_updated_at ON users
AFTER UPDATE AS
BEGIN
  UPDATE users SET updated_at = SYSDATETIME()
  FROM users u JOIN inserted i ON u.id = i.id;
END;
GO

CREATE TRIGGER trg_movies_updated_at ON movies
AFTER UPDATE AS
BEGIN
  UPDATE movies SET updated_at = SYSDATETIME()
  FROM movies m JOIN inserted i ON m.id = i.id;
END;
GO

CREATE TRIGGER trg_books_updated_at ON books
AFTER UPDATE AS
BEGIN
  UPDATE books SET updated_at = SYSDATETIME()
  FROM books b JOIN inserted i ON b.id = i.id;
END;
GO

CREATE TRIGGER trg_reviews_updated_at ON reviews
AFTER UPDATE AS
BEGIN
  UPDATE reviews SET updated_at = SYSDATETIME()
  FROM reviews r JOIN inserted i ON r.id = i.id;
END;
GO

CREATE TRIGGER trg_bookings_updated_at ON bookings
AFTER UPDATE AS
BEGIN
  UPDATE bookings SET updated_at = SYSDATETIME()
  FROM bookings b JOIN inserted i ON b.id = i.id;
END;
GO
