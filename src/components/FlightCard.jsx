import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "../AppContext.jsx";
import { money } from "../utils/flight.js";

export default function FlightCard({ flight }) {
  const { user } = useApp();
  return (
    <article className="flight-card">
      <div className="airline-info"><span className="airline-logo">{flight.airline.slice(0, 1)}</span><span><strong>{flight.airline}</strong><small>{flight.flightNumber}</small></span></div>
      <div className="route-info"><div><strong>{flight.departure}</strong><span>{flight.fromCode}</span></div><div className="route-line"><small>1h 05m</small><i><b></b></i><small>{flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}</small></div><div><strong>{flight.arrival}</strong><span>{flight.toCode}</span></div></div>
      <div className="flight-price"><strong>{money(flight.price)}</strong><span>{flight.availableSeats} seats left</span></div>
      {user?.role === "user" && !flight.live && flight.availableSeats > 0 ? <Link className="button button-small" to={`/book/${flight.id}`}>Select flight <span>→</span></Link> : <span className={flight.availableSeats === 0 && !flight.live ? "status-pill sold-out" : "status-pill"}>{flight.live ? flight.status || "Live data" : flight.availableSeats === 0 ? "Sold out" : flight.status || "On time"}</span>}
    </article>
  );
}
