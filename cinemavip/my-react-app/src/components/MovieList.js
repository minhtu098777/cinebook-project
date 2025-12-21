import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MovieList() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/movies')
      .then(response => response.json())
      .then(data => setMovies(data));
  }, []);

  return (
    <div className="container mt-5">
      <h2>All Movies</h2>
      <div className="row">
        {movies.map(movie => (
          <div key={movie.id} className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{movie.title}</h5>
                <p className="card-text">Genre: {movie.genre}</p>
                <p className="card-text">Duration: {movie.duration}</p>
                <Link to={`/movie/${movie.id}`} className="btn btn-primary">Book Now</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MovieList;