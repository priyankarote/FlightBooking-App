import React from "react";
import { money } from "../utils/flight.js";

export default function BookingsTable({ bookings }) {
  return bookings.length ? (
    <div className="table-scroll"><table><thead><tr><th>BOOKING</th><th>PASSENGER</th><th>ROUTE</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th></tr></thead><tbody>
      {bookings.map((booking) => <tr key={booking.id}>
        <td><strong>{booking.id}</strong><small>{booking.email}</small></td>
        <td>{booking.passenger.name}<small>{booking.passenger.phone}</small></td>
        <td>{booking.fromCode} <span className="table-arrow">→</span> {booking.toCode}</td>
        <td>{new Date(`${booking.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
        <td>{money(booking.total)}</td>
        <td><span className="status-pill">Confirmed</span></td>
      </tr>)}
    </tbody></table></div>
  ) : <div className="panel empty-admin"><p>No bookings match your search.</p></div>;
}
