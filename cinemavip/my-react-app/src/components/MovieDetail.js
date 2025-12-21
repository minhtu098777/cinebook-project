import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/movies/${id}`)
      .then(response => response.json())
      .then(data => setMovie(data));
  }, [id]);

  if (!movie) return <div className="container mt-5">Loading...</div>;

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-4">
          <img src={movie.image} className="img-fluid" alt={movie.title} />
        </div>
        <div className="col-md-8">
          <h1>{movie.title}</h1>
          <p><strong>Genre:</strong> {movie.genre}</p>
          <p><strong>Duration:</strong> {movie.duration}</p>
          <p>{movie.description}</p>
          <Link to={`/booking/${movie.id}`} className="btn btn-success btn-lg">Book Tickets</Link>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;