# Ticket Booking System

A simple movie ticket booking system with Next.js frontend and FastAPI backend.

## Project Structure

```
test/
├── backend/          # FastAPI backend
│   ├── main.py      # API server with in-memory data
│   └── requirements.txt
└── frontend/         # Next.js frontend
    ├── app/
    │   ├── page.tsx
    │   ├── layout.tsx
    │   └── globals.css
    ├── lib/
    │   └── utils.ts
    ├── package.json
    ├── tsconfig.json
    └── tailwind.config.ts
```

## Setup & Run

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Server runs on http://localhost:8000

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

App runs on http://localhost:3000

## Features

1. **Selection**: Choose theater location, movie, and show time
2. **Seat Map**: Visual seat selection with category colors (Platinum, Gold, Box)
3. **Multi-seat Selection**: Select multiple seats in one transaction
4. **Payment**: Mock payment gateway for booking confirmation
5. **Booking History**: View all confirmed bookings

## API Endpoints

- `GET /api/theaters` - List all theaters
- `GET /api/movies` - List all movies
- `GET /api/shows` - Filter shows by theater/movie
- `GET /api/shows/{id}/seats` - Get seat availability
- `POST /api/bookings` - Create booking (returns amount)
- `POST /api/payment` - Process mock payment
- `POST /api/bookings/confirm` - Confirm booking after payment
- `GET /api/bookings` - List all bookings
