import React from "react";
import { money } from "../utils/flight.js";

export default function FlightInventoryTable({ flights, onEdit, onDelete }) {
  return (
    <div className="table-scroll"><table><thead><tr><th>FLIGHT</th><th>ROUTE</th><th>DEPARTURE</th><th>SEATS</th><th>PRICE</th><th>ACTIONS</th></tr></thead><tbody>
      {flights.map((flight) => <tr key={flight.id}>
        <td><strong>{flight.airline}</strong><small>{flight.flightNumber}</small></td>
        <td>{flight.fromCode} <span className="table-arrow">→</span> {flight.toCode}<small>{flight.from} to {flight.to}</small></td>
        <td>{flight.departure}<small>{new Date(`${flight.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</small></td>
        <td><strong>{flight.availableSeats}</strong> available<small>{flight.bookedSeats} booked</small></td>
        <td>{money(flight.price)}</td>
        <td><button className="table-action" onClick={() => onEdit(flight)}>Edit</button><button className="table-action delete-action" onClick={() => onDelete(flight)}>Delete</button></td>
      </tr>)}
    </tbody></table></div>
  );
}
