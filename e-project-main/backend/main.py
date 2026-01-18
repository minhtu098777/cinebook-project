from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory Data
theaters = [
    {"id": "t1", "name": "Downtown Cinema", "location": "123 Main St, Downtown"},
    {"id": "t2", "name": "Mall Multiplex", "location": "456 Shopping Ave, Mall"},
    {"id": "t3", "name": "Suburban Theater", "location": "789 Suburb Rd, Suburbs"},
]

movies = [
    {"id": "m1", "title": "Action Thriller", "duration": 120, "genre": "Action"},
    {"id": "m2", "title": "Romantic Comedy", "duration": 105, "genre": "Romance"},
    {"id": "m3", "title": "Sci-Fi Adventure", "duration": 135, "genre": "Sci-Fi"},
]

seat_categories = [
    {"id": "platinum", "name": "Platinum", "price": 25, "rows": ["A", "B"]},
    {"id": "gold", "name": "Gold", "price": 18, "rows": ["C", "D", "E"]},
    {"id": "box", "name": "Box", "price": 30, "rows": ["F"]},
]

# Generate shows for next 7 days
shows = []
base_date = datetime.now()
for theater in theaters:
    for movie in movies:
        for day_offset in range(7):
            show_date = base_date + timedelta(days=day_offset)
            for hour in [10, 14, 18, 22]:
                show_time = show_date.replace(hour=hour, minute=0, second=0, microsecond=0)
                show_id = f"{theater['id']}_{movie['id']}_{day_offset}_{hour}"
                shows.append({
                    "id": show_id,
                    "theaterId": theater["id"],
                    "movieId": movie["id"],
                    "datetime": show_time.isoformat(),
                })

# Seat storage: show_id -> {seat_number: booking_status}
# booking_status: None (available) or booking_id
show_seats: Dict[str, Dict[str, Optional[str]]] = {}

# Bookings storage
bookings = []


def initialize_seats_for_show(show_id: str):
    if show_id not in show_seats:
        seats = {}
        for category in seat_categories:
            for row in category["rows"]:
                for seat_num in range(1, 11):  # 10 seats per row
                    seat_id = f"{row}{seat_num}"
                    seats[seat_id] = None
        show_seats[show_id] = seats


# Initialize all shows
for show in shows:
    initialize_seats_for_show(show["id"])


class PaymentRequest(BaseModel):
    amount: float
    cardNumber: str
    expiryDate: str
    cvv: str


class BookingRequest(BaseModel):
    showId: str
    seats: List[str]


# API Endpoints
@app.get("/api/theaters")
def get_theaters():
    return theaters


@app.get("/api/movies")
def get_movies():
    return movies


@app.get("/api/shows")
def get_shows(theaterId: Optional[str] = None, movieId: Optional[str] = None):
    filtered_shows = shows
    if theaterId:
        filtered_shows = [s for s in filtered_shows if s["theaterId"] == theaterId]
    if movieId:
        filtered_shows = [s for s in filtered_shows if s["movieId"] == movieId]
    return filtered_shows


@app.get("/api/seat-categories")
def get_seat_categories():
    return seat_categories


@app.get("/api/shows/{show_id}/seats")
def get_show_seats(show_id: str):
    if show_id not in show_seats:
        return {"error": "Show not found"}

    seats_data = []
    for seat_id, booking_id in show_seats[show_id].items():
        category = None
        for cat in seat_categories:
            if seat_id[0] in cat["rows"]:
                category = cat["id"]
                break

        seats_data.append({
            "id": seat_id,
            "category": category,
            "available": booking_id is None,
        })

    return {"seats": seats_data}


@app.post("/api/payment")
def process_payment(payment: PaymentRequest):
    # Mock payment - always succeeds
    return {"success": True, "transactionId": str(uuid.uuid4())}


@app.post("/api/bookings")
def create_booking(booking: BookingRequest):
    show_id = booking.showId

    # Check availability
    if show_id not in show_seats:
        return {"error": "Show not found"}

    for seat in booking.seats:
        if show_seats[show_id].get(seat) is not None:
            return {"error": f"Seat {seat} is already booked"}

    # Calculate total
    total = 0
    for seat in booking.seats:
        for category in seat_categories:
            if seat[0] in category["rows"]:
                total += category["price"]
                break

    return {
        "requiresPayment": True,
        "amount": total,
        "pendingBooking": {
            "showId": show_id,
            "seats": booking.seats,
        }
    }


@app.post("/api/bookings/confirm")
def confirm_booking(booking: BookingRequest):
    show_id = booking.showId
    booking_id = str(uuid.uuid4())

    # Book seats
    for seat in booking.seats:
        show_seats[show_id][seat] = booking_id

    # Create booking record
    show = next(s for s in shows if s["id"] == show_id)
    theater = next(t for t in theaters if t["id"] == show["theaterId"])
    movie = next(m for m in movies if m["id"] == show["movieId"])

    booking_record = {
        "id": booking_id,
        "showId": show_id,
        "theater": theater["name"],
        "movie": movie["title"],
        "datetime": show["datetime"],
        "seats": booking.seats,
    }
    bookings.append(booking_record)

    return {"success": True, "booking": booking_record}


@app.get("/api/bookings")
def get_bookings():
    return bookings


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
