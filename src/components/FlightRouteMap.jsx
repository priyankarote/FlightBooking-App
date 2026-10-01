import React, { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { createGreatCirclePath, getFlightCoordinates } from "../utils/airportCoordinates.js";

function FitRoute({ positions }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(positions, { padding: [28, 28], maxZoom: 6 });
  }, [map, positions]);
  return null;
}

export default function FlightRouteMap({ flight }) {
  const [tileError, setTileError] = useState(false);
  const coordinates = getFlightCoordinates(flight.fromCode, flight.toCode);
  if (!coordinates) {
    return (
      <div className="map-fallback" role="status">
        Route map unavailable for {flight.fromCode}–{flight.toCode}. Add airport coordinates to enable the map.
      </div>
    );
  }

  const { origin, destination } = coordinates;
  const path = createGreatCirclePath(origin, destination);
  const positions = [origin, destination];

  return (
    <div className="flight-map-wrap">
      <MapContainer
        className="flight-map"
        scrollWheelZoom={false}
        aria-label={`Flight route map from ${flight.from} to ${flight.to}`}
      >
        <FitRoute positions={positions} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{ tileerror: () => setTileError(true) }}
        />
        <Polyline positions={path} pathOptions={{ color: "#3158e8", weight: 3, opacity: 0.85, dashArray: "7 7" }} />
        <CircleMarker center={origin} radius={7} pathOptions={{ color: "#fff", weight: 3, fillColor: "#3158e8", fillOpacity: 1 }}>
          <Tooltip direction="top" offset={[0, -7]} permanent>{flight.fromCode}</Tooltip>
        </CircleMarker>
        <CircleMarker center={destination} radius={7} pathOptions={{ color: "#fff", weight: 3, fillColor: "#f1a66d", fillOpacity: 1 }}>
          <Tooltip direction="top" offset={[0, -7]} permanent>{flight.toCode}</Tooltip>
        </CircleMarker>
      </MapContainer>
      {tileError && <p className="map-error" role="status">Map tiles could not load. Check your internet connection.</p>}
    </div>
  );
}
