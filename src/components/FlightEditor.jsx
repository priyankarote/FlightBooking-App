import React from "react";
import { blankFlight } from "../utils/flight.js";

const fields = [
  ["airline", "Airline", "Akasa Air", "text"],
  ["flightNumber", "Flight number", "QP 1312", "text"],
  ["from", "Origin city", "Pune", "text"],
  ["fromCode", "Origin code", "PNQ", "text"],
  ["to", "Destination city", "Mumbai", "text"],
  ["toCode", "Destination code", "BOM", "text"],
  ["departure", "Departure", "09:15", "time"],
  ["arrival", "Arrival", "10:20", "time"],
  ["date", "Date", "", "date"],
  ["price", "Price (₹)", "2499", "number"],
  ["availableSeats", "Available seats", "50", "number"],
  ["bookedSeats", "Booked seats", "12", "number"],
];

export default function FlightEditor({ flight, onSave }) {
  function submit(event) {
    event.preventDefault();
    onSave(Object.fromEntries(new FormData(event.currentTarget)));
  }

  return (
    <form className="panel flight-editor" onSubmit={submit}>
      {fields.map(([name, label, placeholder, type]) => (
        <label key={name}>{label}<input
          name={name}
          type={type}
          placeholder={placeholder}
          required
          min={type === "number" ? "0" : undefined}
          defaultValue={flight?.[name] ?? (name === "date" ? blankFlight.date : "")}
        /></label>
      ))}
      <label>Stops<select name="stops" defaultValue={flight?.stops ?? 0}><option value="0">Non-stop</option><option value="1">1 stop</option><option value="2">2+ stops</option></select></label>
      <button className="button editor-submit">{flight ? "Save changes" : "Add flight"} <span>→</span></button>
    </form>
  );
}
