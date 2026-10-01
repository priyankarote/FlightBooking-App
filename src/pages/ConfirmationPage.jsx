import React from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../AppContext.jsx";
import { money } from "../utils/flight.js";

export default function ConfirmationPage() {
  const { bookings, user } = useApp();
  const { id } = useParams();
  const booking = bookings.find((item) => item.id === id && item.email === user.email);
  if (!booking) return <main className="page-wrap"><div className="empty-state"><h2>We couldn’t find that booking</h2><Link to="/my-bookings">View your trips</Link></div></main>;

  return (
    <main className="page-wrap confirmation-wrap">
      <div className="confirmation-card panel">
        <span className="success-mark">✓</span><span className="eyebrow">YOU’RE ALL SET</span><h1>That’s a trip worth taking.</h1><p className="muted">Your booking is confirmed. We’ve saved the details below.</p>
        <div className="booking-id">BOOKING REFERENCE <strong>{booking.id}</strong></div>
        <div className="confirm-route"><span><strong>{booking.departure}</strong>{booking.fromCode}</span><i>→</i><span><strong>{booking.arrival}</strong>{booking.toCode}</span></div>
        <div className="confirm-details"><div><span>Passenger</span><strong>{booking.passenger.name}</strong></div><div><span>Flight</span><strong>{booking.airline} · {booking.flightNumber}</strong></div><div><span>Date</span><strong>{new Date(`${booking.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong></div><div><span>Seats</span><strong>{booking.seats}</strong></div><div><span>Total paid</span><strong>{money(booking.total)}</strong></div><div><span>Status</span><strong className="confirmed-text">Confirmed</strong></div></div>
        <Link className="button full" to="/my-bookings">View my trips <span>→</span></Link>
      </div>
    </main>
  );
}
