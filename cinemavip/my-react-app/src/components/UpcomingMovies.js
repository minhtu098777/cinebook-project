import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function UpcomingMovies() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/movies/upcoming')
      .then(response => response.json())
      .then(data => setMovies(data));
  }, []);

  return (
    <div className="container mt-5">
      <h2>Phim Sắp Chiếu</h2>
      <div className="row">
        {movies.map(movie => (
          <div key={movie.id} className="col-md-4 mb-4">
            <div className="card">
              <img src={movie.image} className="card-img-top" alt={movie.title} />
              <div className="card-body">
                <h5 className="card-title">{movie.title}</h5>
                <p className="card-text">{movie.description}</p>
                <Link to={`/movie/${movie.id}`} className="btn btn-primary">Xem Chi Tiết</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UpcomingMovies;