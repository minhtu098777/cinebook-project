import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/movies')
      .then(response => response.json())
      .then(data => setMovies(data.slice(0, 3))); // Show first 3 as featured
  }, []);

  return (
    <div className="container mt-5">
      <div className="jumbotron bg-primary text-white p-5 mb-4">
        <h1 className="display-4">Welcome to CineBook</h1>
        <p className="lead">Book your movie tickets online easily!</p>
      </div>
      <h2>Featured Movies</h2>
      <div className="row">
        {movies.map(movie => (
          <div key={movie.id} className="col-md-4 mb-4">
            <div className="card">
              <img src={movie.image} className="card-img-top" alt={movie.title} />
              <div className="card-body">
                <h5 className="card-title">{movie.title}</h5>
                <p className="card-text">{movie.description}</p>
                <Link to={`/movie/${movie.id}`} className="btn btn-primary">View Details</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;