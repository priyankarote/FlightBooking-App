import React from "react";

export default function AdminStats({ flights, bookings }) {
  const bookedSeats = flights.reduce((total, flight) => total + Number(flight.bookedSeats), 0);
  return (
    <div className="stats-grid">
      <div className="stat-card"><span>ACTIVE FLIGHTS</span><strong>{flights.length.toString().padStart(2, "0")}</strong><small>Across all routes</small></div>
      <div className="stat-card"><span>TOTAL BOOKINGS</span><strong>{bookings.length.toString().padStart(2, "0")}</strong><small>Confirmed reservations</small></div>
      <div className="stat-card"><span>SEATS BOOKED</span><strong>{bookedSeats.toString().padStart(2, "0")}</strong><small>Across managed flights</small></div>
    </div>
  );
}
