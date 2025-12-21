import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

function Booking() {
  const { id } = useParams();
  const [seats, setSeats] = useState(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ movieId: id, seats, date, time, userId: 1 }) // Dummy userId
      });
      const data = await response.json();
      if (response.ok) {
        alert('Booking confirmed!');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Book Tickets for Movie {id}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Number of Seats</label>
          <input
            type="number"
            className="form-control"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            min="1"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Time</label>
          <select
            className="form-control"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          >
            <option value="">Select Time</option>
            <option value="10:00">10:00 AM</option>
            <option value="14:00">2:00 PM</option>
            <option value="18:00">6:00 PM</option>
            <option value="21:00">9:00 PM</option>
          </select>
        </div>
        <button type="submit" className="btn btn-success">Confirm Booking</button>
      </form>
    </div>
  );
}

export default Booking;