import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./components/Home";
import MovieList from "./components/MovieList";
import MovieDetail from "./components/MovieDetail";
import Booking from "./components/Booking";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<MovieList />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;