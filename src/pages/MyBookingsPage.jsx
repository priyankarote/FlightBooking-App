import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "../AppContext.jsx";
import { money } from "../utils/flight.js";

export default function MyBookingsPage() {
  const { bookings, user } = useApp();
  const ownBookings = bookings.filter((booking) => booking.email === user.email);
  return (
    <main className="page-wrap">
      <div className="page-title"><span className="eyebrow">YOUR TRAVEL HISTORY</span><h1>My trips</h1><p className="muted">Every journey starts somewhere.</p></div>
      {ownBookings.length ? <div className="booking-list">{ownBookings.map((booking) => <article className="panel saved-booking" key={booking.id}>
        <div className="saved-booking-route"><div><span>{booking.fromCode}</span><strong>{booking.from}</strong></div><i>→</i><div><span>{booking.toCode}</span><strong>{booking.to}</strong></div></div>
        <div className="saved-booking-meta"><span>{booking.airline} · {booking.flightNumber}</span><span>{new Date(`${booking.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span><span>{booking.id}</span></div>
        <div className="saved-booking-side"><strong>{money(booking.total)}</strong><span className="status-pill">Confirmed</span></div>
      </article>)}</div> : <div className="panel empty-bookings"><span>✈</span><h2>Your next trip is waiting</h2><p className="muted">You haven’t booked any flights yet.</p><Link className="button" to="/">Find a flight <span>→</span></Link></div>}
    </main>
  );
}
