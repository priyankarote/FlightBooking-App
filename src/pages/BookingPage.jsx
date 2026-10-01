import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../AppContext.jsx";
import FlightRouteMap from "../components/FlightRouteMap.jsx";
import { money } from "../utils/flight.js";

export default function BookingPage() {
  const { flights, createBooking } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const flight = flights.find((item) => item.id === id);
  const [seats, setSeats] = useState(1);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState("idle");
  const [statusKey, setStatusKey] = useState(import.meta.env.VITE_AVIATIONSTACK_ACCESS_KEY || "");
  const [pollStatus, setPollStatus] = useState(false);
  const [flightStatus, setFlightStatus] = useState(flight?.status || "Scheduled");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusUpdatedAt, setStatusUpdatedAt] = useState("");

  useEffect(() => {
    if (!flight || !pollStatus || !statusKey.trim()) return undefined;
    let active = true;
    async function refreshStatus() {
      try {
        const params = new URLSearchParams({
          access_key: statusKey.trim(),
          dep_iata: flight.fromCode,
          arr_iata: flight.toCode,
          flight_iata: flight.flightNumber.replace(/\s+/g, ""),
        });
        const response = await fetch(`https://api.aviationstack.com/v1/flights?${params}`);
        if (!response.ok) throw new Error("Could not refresh flight status. Check your API key or connection.");
        const payload = await response.json();
        if (payload.error) throw new Error(payload.error.message || "AviationStack returned an error.");
        const records = Array.isArray(payload.results) ? payload.results : payload.data;
        const matchingFlight = Array.isArray(records)
          ? records.find((record) =>
            record.flight?.iata?.replace(/\s+/g, "") === flight.flightNumber.replace(/\s+/g, ""),
          ) || records[0]
          : null;
        if (!matchingFlight) throw new Error("No live status is available for this flight right now.");
        if (!active) return;
        setFlightStatus(
          matchingFlight.live?.is_ground === false
            ? "In the air"
            : matchingFlight.live?.is_ground === true
              ? "On the ground"
              : matchingFlight.flight_status || "Scheduled",
        );
        setStatusUpdatedAt(new Date().toLocaleTimeString());
        setStatusMessage("");
      } catch (statusError) {
        if (active) setStatusMessage(statusError.message || "Unable to refresh flight status.");
      }
    }
    refreshStatus();
    const interval = window.setInterval(refreshStatus, 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [pollStatus, statusKey, flight]);

  if (!flight) return <main className="page-wrap"><div className="empty-state"><h2>Flight not found</h2><Link to="/">Back to search</Link></div></main>;
  if (flight.availableSeats <= 0) {
    return <main className="page-wrap"><div className="empty-state"><h2>This flight is sold out</h2><p>Choose another flight to continue booking.</p><Link className="button" to="/">Back to flights</Link></div></main>;
  }

  async function pay(event) {
    event.preventDefault();
    const passenger = Object.fromEntries(new FormData(event.currentTarget));
    setError("");
    setPayment("processing");
    await new Promise((resolve) => setTimeout(resolve, 650));
    if (passenger.simulate === "failure") {
      setPayment("idle");
      setError("Payment didn’t go through. Your card was not charged—please try again.");
      return;
    }
    if (seats > flight.availableSeats) {
      setPayment("idle");
      setError("There aren’t enough seats available. Please choose fewer seats.");
      return;
    }
    const booking = createBooking(flight, { name: passenger.name, email: passenger.email, phone: passenger.phone }, seats);
    navigate(`/confirmation/${booking.id}`);
  }

  return (
    <main className="page-wrap">
      <Link className="back-link" to="/">← Back to flights</Link>
      <div className="page-title"><span className="eyebrow">ALMOST THERE</span><h1>Let’s make this trip yours.</h1><p className="muted">Add your passenger details to continue.</p></div>
      <div className="booking-layout">
        <form className="panel booking-form" onSubmit={pay}>
          <div className="panel-heading"><span className="step-number">1</span><div><h2>Passenger details</h2><p>Use the name exactly as it appears on your ID.</p></div></div>
          {error && <div className="notice error">{error}</div>}
          <label>Full name<input name="name" required minLength="2" placeholder="Passenger's full name" /></label>
          <div className="form-row"><label>Email address<input name="email" type="email" required placeholder="you@example.com" /></label><label>Phone number<input name="phone" type="tel" required pattern="[0-9+() -]{8,18}" placeholder="+91 98765 43210" /></label></div>
          <label>Number of seats<select value={seats} onChange={(event) => setSeats(Number(event.target.value))}>{Array.from({ length: Math.min(6, flight.availableSeats) }, (_, index) => <option value={index + 1} key={index}>{index + 1} {index === 0 ? "seat" : "seats"}</option>)}</select></label>
          <div className="panel-heading payment-heading"><span className="step-number">2</span><div><h2>Payment</h2><p>Secure checkout · No real charge will be made.</p></div></div>
          <label>Payment simulation<select name="simulate"><option value="success">Simulate successful payment</option><option value="failure">Simulate declined payment</option></select></label>
          <button className="button full" disabled={payment === "processing"}>{payment === "processing" ? "Processing payment…" : `Pay ${money(flight.price * seats)}`} <span>→</span></button>
        </form>
        <aside className="panel trip-summary">
          <span className="eyebrow">YOUR FLIGHT</span>
          <div className="summary-airline"><span className="airline-logo">{flight.airline.slice(0, 1)}</span><span><strong>{flight.airline}</strong><small>{flight.flightNumber}</small></span></div>
          <div className="summary-route"><div><strong>{flight.departure}</strong><span>{flight.from} ({flight.fromCode})</span></div><div className="summary-connector"><span>✈</span></div><div><strong>{flight.arrival}</strong><span>{flight.to} ({flight.toCode})</span></div></div>
          <h3 className="map-heading">Flight path</h3>
          <FlightRouteMap flight={flight} />
          <div className="summary-date">{new Date(`${flight.date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
          <div className="status-updater">
            <div className="status-update-heading"><strong>Flight status</strong><span className="status-pill">{flightStatus}</span></div>
            <label className="status-key-field">AviationStack API key<input type="password" autoComplete="off" value={statusKey} onChange={(event) => setStatusKey(event.target.value)} placeholder="Enter key to enable live updates" /></label>
            <button type="button" className="outline-button" disabled={!statusKey.trim()} onClick={() => { setStatusMessage(""); setPollStatus((current) => !current); }}>
              {pollStatus ? "Stop live updates" : "Enable 30-second updates"}
            </button>
            {statusUpdatedAt && <small className="status-help">Last updated {statusUpdatedAt}</small>}
            {statusMessage && <small className="status-error">{statusMessage}</small>}
          </div>
          <div className="price-breakdown"><div><span>{money(flight.price)} × {seats} {seats === 1 ? "seat" : "seats"}</span><strong>{money(flight.price * seats)}</strong></div><div><span>Taxes & fees</span><strong>Included</strong></div><hr /><div className="total-line"><strong>Total</strong><strong>{money(flight.price * seats)}</strong></div></div>
        </aside>
      </div>
    </main>
  );
}
