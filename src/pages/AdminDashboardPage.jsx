import React, { useState } from "react";
import { useApp } from "../AppContext.jsx";
import AdminStats from "../components/AdminStats.jsx";
import BookingsTable from "../components/BookingsTable.jsx";
import FlightEditor from "../components/FlightEditor.jsx";
import FlightInventoryTable from "../components/FlightInventoryTable.jsx";

export default function AdminDashboardPage() {
  const { flights, bookings, saveFlight, deleteFlight } = useApp();
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const [bookingQuery, setBookingQuery] = useState("");
  const [bookingRoute, setBookingRoute] = useState("All routes");
  const [bookingStatus, setBookingStatus] = useState("All statuses");
  const [notice, setNotice] = useState("");

  const filteredFlights = flights.filter((flight) =>
    `${flight.airline} ${flight.flightNumber} ${flight.from} ${flight.to}`.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredBookings = bookings.filter((booking) =>
    `${booking.id} ${booking.passenger.name} ${booking.email} ${booking.from} ${booking.to}`.toLowerCase().includes(bookingQuery.toLowerCase()) &&
    (bookingRoute === "All routes" || `${booking.fromCode}-${booking.toCode}` === bookingRoute) &&
    (bookingStatus === "All statuses" || booking.status === bookingStatus),
  );
  const bookingRoutes = [...new Set(bookings.map((booking) => `${booking.fromCode}-${booking.toCode}`))];
  const bookingStatuses = [...new Set(bookings.map((booking) => booking.status))];

  function save(data) {
    const available = Number(data.availableSeats);
    const booked = Number(data.bookedSeats);
    if (available < 0 || booked < 0 || Number(data.price) <= 0) {
      setNotice("Price must be greater than zero and seat counts cannot be negative.");
      return;
    }
    saveFlight({
      ...data,
      id: editing?.id || `FL-${crypto.randomUUID().slice(0, 8)}`,
      price: Number(data.price),
      availableSeats: available,
      bookedSeats: booked,
      stops: Number(data.stops),
    });
    setEditing(null);
    setNotice("Flight saved successfully.");
  }

  function edit(flight) {
    setNotice("");
    setEditing(flight);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function remove(flight) {
    if (window.confirm(`Delete ${flight.flightNumber}?`)) deleteFlight(flight.id);
  }

  return (
    <main className="page-wrap admin-wrap">
      <div className="page-title admin-title"><div><span className="eyebrow">FLIGHTLY CONTROL ROOM</span><h1>Good morning, captain.</h1><p className="muted">Manage your routes and keep the journey moving.</p></div><span className="admin-sticker">✳<small>ADMIN<br />MODE</small></span></div>
      <AdminStats flights={flights} bookings={bookings} />
      <section className="admin-section">
        <div className="section-heading"><div><span className="eyebrow">ROUTE CONTROL</span><h2>{editing ? "Edit flight" : "Add a flight"}</h2></div>{editing && <button className="outline-button" onClick={() => setEditing(null)}>Cancel edit</button>}</div>
        {notice && <div className="notice">{notice}</div>}
        <FlightEditor key={editing?.id || "new-flight"} flight={editing} onSave={save} />
        <div className="section-heading table-heading"><div><span className="eyebrow">LIVE INVENTORY</span><h2>Manage flights</h2></div><input className="table-search" placeholder="Search routes…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        <FlightInventoryTable flights={filteredFlights} onEdit={edit} onDelete={remove} />
      </section>
      <section className="admin-section">
        <div className="section-heading"><div><span className="eyebrow">PASSENGER MANIFEST</span><h2>All bookings</h2></div>
          <div className="booking-filters">
            <input className="table-search" placeholder="Search passenger or booking…" value={bookingQuery} onChange={(event) => setBookingQuery(event.target.value)} />
            <select className="table-search" aria-label="Filter bookings by route" value={bookingRoute} onChange={(event) => setBookingRoute(event.target.value)}>
              <option>All routes</option>{bookingRoutes.map((route) => <option key={route}>{route}</option>)}
            </select>
            <select className="table-search" aria-label="Filter bookings by status" value={bookingStatus} onChange={(event) => setBookingStatus(event.target.value)}>
              <option>All statuses</option>{bookingStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
        </div>
        <BookingsTable bookings={filteredBookings} />
      </section>
    </main>
  );
}
