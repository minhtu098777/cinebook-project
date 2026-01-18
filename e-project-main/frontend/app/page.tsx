"use client";

import { useState, useEffect } from "react";

const API_BASE = "http://localhost:8000/api";

interface Theater {
  id: string;
  name: string;
  location: string;
}

interface Movie {
  id: string;
  title: string;
  duration: number;
  genre: string;
}

interface Show {
  id: string;
  theaterId: string;
  movieId: string;
  datetime: string;
}

interface SeatCategory {
  id: string;
  name: string;
  price: number;
  rows: string[];
}

interface Seat {
  id: string;
  category: string;
  available: boolean;
}

interface Booking {
  id: string;
  showId: string;
  theater: string;
  movie: string;
  datetime: string;
  seats: string[];
}

export default function Home() {
  // Selection state
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [seatCategories, setSeatCategories] = useState<SeatCategory[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [selectedTheater, setSelectedTheater] = useState<string>("");
  const [selectedMovie, setSelectedMovie] = useState<string>("");
  const [selectedShow, setSelectedShow] = useState<string>("");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [step, setStep] = useState<"selection" | "seats" | "payment" | "confirmation">("selection");
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  // Fetch initial data
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/theaters`).then((r) => r.json()),
      fetch(`${API_BASE}/movies`).then((r) => r.json()),
      fetch(`${API_BASE}/seat-categories`).then((r) => r.json()),
      fetch(`${API_BASE}/bookings`).then((r) => r.json()),
    ]).then(([theatersData, moviesData, categoriesData, bookingsData]) => {
      setTheaters(theatersData);
      setMovies(moviesData);
      setSeatCategories(categoriesData);
      setBookings(bookingsData);
    });
  }, []);

  // Fetch shows when theater or movie changes
  useEffect(() => {
    if (selectedTheater || selectedMovie) {
      const params = new URLSearchParams();
      if (selectedTheater) params.append("theaterId", selectedTheater);
      if (selectedMovie) params.append("movieId", selectedMovie);

      fetch(`${API_BASE}/shows?${params}`)
        .then((r) => r.json())
        .then((data) => setShows(data));
    } else {
      setShows([]);
    }
    setSelectedShow("");
  }, [selectedTheater, selectedMovie]);

  // Fetch seats when show is selected
  useEffect(() => {
    if (selectedShow) {
      fetch(`${API_BASE}/shows/${selectedShow}/seats`)
        .then((r) => r.json())
        .then((data) => setSeats(data.seats));
    }
  }, [selectedShow]);

  const handleSeatToggle = (seatId: string) => {
    const seat = seats.find((s) => s.id === seatId);
    if (!seat?.available) return;

    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  const calculateTotal = () => {
    let total = 0;
    selectedSeats.forEach((seatId) => {
      const seat = seats.find((s) => s.id === seatId);
      const category = seatCategories.find((c) => c.id === seat?.category);
      if (category) total += category.price;
    });
    return total;
  };

  useEffect(() => {
    setTotalAmount(calculateTotal());
  }, [selectedSeats]);

  const handleProceedToSeats = () => {
    if (selectedShow) {
      setStep("seats");
    }
  };

  const handleProceedToPayment = () => {
    if (selectedSeats.length > 0) {
      setStep("payment");
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Process payment
      const paymentRes = await fetch(`${API_BASE}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentForm,
          amount: totalAmount,
        }),
      });

      const paymentData = await paymentRes.json();
      if (!paymentData.success) throw new Error("Payment failed");

      // Confirm booking
      const bookingRes = await fetch(`${API_BASE}/bookings/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: selectedShow,
          seats: selectedSeats,
        }),
      });

      const bookingData = await bookingRes.json();
      if (!bookingData.success) throw new Error("Booking failed");

      // Update bookings list
      fetch(`${API_BASE}/bookings`)
        .then((r) => r.json())
        .then((data) => setBookings(data));

      setStep("confirmation");
      setSelectedSeats([]);
      setPaymentForm({ cardNumber: "", expiryDate: "", cvv: "" });
    } catch (error) {
      alert("Payment or booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep("selection");
    setSelectedShow("");
    setSelectedSeats([]);
    setTotalAmount(0);
  };

  const getSeatColor = (seat: Seat) => {
    if (!seat.available) return "bg-gray-300 cursor-not-allowed";
    if (selectedSeats.includes(seat.id)) {
      const category = seatCategories.find((c) => c.id === seat.category);
      if (category?.id === "platinum") return "bg-purple-500";
      if (category?.id === "gold") return "bg-yellow-500";
      if (category?.id === "box") return "bg-blue-500";
    }
    const category = seatCategories.find((c) => c.id === seat.category);
    if (category?.id === "platinum") return "bg-purple-200 hover:bg-purple-300";
    if (category?.id === "gold") return "bg-yellow-200 hover:bg-yellow-300";
    if (category?.id === "box") return "bg-blue-200 hover:bg-blue-300";
    return "bg-gray-200";
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8">Movie Ticket Booking</h1>

      {/* Step 1: Selection */}
      {step === "selection" && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h2 className="text-2xl font-semibold">Select Your Options</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Theater Location</label>
              <select
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedTheater}
                onChange={(e) => setSelectedTheater(e.target.value)}
              >
                <option value="">Select a theater</option>
                {theaters.map((theater) => (
                  <option key={theater.id} value={theater.id}>
                    {theater.name} - {theater.location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Movie</label>
              <select
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedMovie}
                onChange={(e) => setSelectedMovie(e.target.value)}
              >
                <option value="">Select a movie</option>
                {movies.map((movie) => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title} ({movie.genre}, {movie.duration} min)
                  </option>
                ))}
              </select>
            </div>

            {shows.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Show Date & Time</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {shows.map((show) => {
                    const date = new Date(show.datetime);
                    return (
                      <button
                        key={show.id}
                        onClick={() => setSelectedShow(show.id)}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          selectedShow === show.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-blue-300"
                        }`}
                      >
                        <div className="font-medium">
                          {date.toLocaleDateString()}
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedShow && (
              <button
                onClick={handleProceedToSeats}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Select Seats
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Seat Selection */}
      {step === "seats" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={() => setStep("selection")}
              className="text-blue-600 hover:underline mb-4"
            >
              ← Back to selection
            </button>

            <h2 className="text-2xl font-semibold mb-4">Select Your Seats</h2>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-6">
              {seatCategories.map((category) => (
                <div key={category.id} className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded ${
                      category.id === "platinum"
                        ? "bg-purple-500"
                        : category.id === "gold"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <span className="text-sm">
                    {category.name} (${category.price})
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gray-300" />
                <span className="text-sm">Occupied</span>
              </div>
            </div>

            {/* Screen */}
            <div className="text-center mb-8">
              <div className="inline-block bg-gray-800 text-white px-12 py-2 rounded-t-lg">
                SCREEN
              </div>
              <div className="h-4 bg-gradient-to-b from-gray-800 to-transparent" />
            </div>

            {/* Seat Map */}
            <div className="flex justify-center mb-6">
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(10, 1fr)" }}>
                {seats.map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatToggle(seat.id)}
                    disabled={!seat.available}
                    className={`w-10 h-10 rounded text-sm font-medium transition-all ${getSeatColor(
                      seat
                    )}`}
                    title={`${seat.id} - ${seatCategories.find((c) => c.id === seat.category)?.name}`}
                  >
                    {seat.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Seats */}
            {selectedSeats.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Selected Seats: {selectedSeats.join(", ")}</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      Total: ${totalAmount}
                    </p>
                  </div>
                  <button
                    onClick={handleProceedToPayment}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === "payment" && (
        <div className="max-w-md mx-auto">
          <button
            onClick={() => setStep("seats")}
            className="text-blue-600 hover:underline mb-4"
          >
            ← Back to seats
          </button>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Payment Details</h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Seats: {selectedSeats.join(", ")}</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">Total: ${totalAmount}</p>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={paymentForm.cardNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={paymentForm.expiryDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, expiryDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={paymentForm.cvv}
                  onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? "Processing..." : `Pay $${totalAmount}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === "confirmation" && (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-semibold mb-4">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">Your tickets have been booked successfully.</p>
            <button
              onClick={resetFlow}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Book Another Ticket
            </button>
          </div>
        </div>
      )}

      {/* My Bookings Section */}
      {bookings.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{booking.movie}</h3>
                    <p className="text-gray-600">{booking.theater}</p>
                    <p className="text-gray-600">
                      {new Date(booking.datetime).toLocaleString()}
                    </p>
                    <p className="text-blue-600 font-medium mt-2">
                      Seats: {booking.seats.join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Booking ID</p>
                    <p className="font-mono text-sm">{booking.id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
