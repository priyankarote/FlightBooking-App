import React, { useMemo, useState } from "react";
import { useApp } from "../AppContext.jsx";
import FlightCard from "../components/FlightCard.jsx";
import { defaultSearch, timeSlot } from "../utils/flight.js";

const initialFilters = {
  minPrice: "0",
  maxPrice: "20000",
  airline: "All airlines",
  departure: "Any time",
  arrival: "Any time",
  stops: "Any stops",
};
const cities = ["Pune", "Mumbai", "New Delhi", "Bengaluru", "Chennai", "Hyderabad", "Goa", "Kolkata"];
const MAX_ADDED_DESTINATIONS = 3;

export default function FlightSearchPage() {
  const { flights } = useApp();
  const [search, setSearch] = useState(defaultSearch);
  const [filters, setFilters] = useState(initialFilters);
  const [flightData, setFlightData] = useState(flights);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_AVIATIONSTACK_ACCESS_KEY || "");
  const [apiMessage, setApiMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const invalidPriceRange = Number(filters.minPrice || 0) > Number(filters.maxPrice || Infinity);

  const results = useMemo(() => invalidPriceRange ? [] : flightData.filter((flight) => {
    const itinerary = search.type === "multi-city"
      ? [{ from: search.from, to: search.to, date: search.date }, ...(search.legs || []).filter((leg) => leg.from && leg.to)]
      : [{ from: search.from, to: search.to, date: search.date }];
    const matchesPlace = (place, city, code) =>
      city.toLowerCase().includes(place.toLowerCase()) || code.toLowerCase().includes(place.toLowerCase());
    const routeMatches = itinerary.some((leg) =>
      matchesPlace(leg.from, flight.from, flight.fromCode) &&
      matchesPlace(leg.to, flight.to, flight.toCode) &&
      flight.date === (leg.date || search.date),
    ) || (search.type === "round-trip" &&
      matchesPlace(search.to, flight.from, flight.fromCode) &&
      matchesPlace(search.from, flight.to, flight.toCode) &&
      flight.date === search.returnDate);
    const priceMatches = Number(flight.price) >= Number(filters.minPrice || 0) &&
      Number(flight.price) <= Number(filters.maxPrice || Infinity);
    const airlineMatches = filters.airline === "All airlines" || flight.airline === filters.airline;
    const departureMatches = filters.departure === "Any time" || timeSlot(flight.departure) === filters.departure;
    const arrivalMatches = filters.arrival === "Any time" || timeSlot(flight.arrival) === filters.arrival;
    const stopMatches = filters.stops === "Any stops" ||
      (filters.stops === "Non-stop" && flight.stops === 0) ||
      (filters.stops === "1 stop" && flight.stops === 1) ||
      (filters.stops === "2+ stops" && flight.stops >= 2);
    return routeMatches && priceMatches && airlineMatches && departureMatches && arrivalMatches && stopMatches;
  }), [flightData, search, filters, invalidPriceRange]);

  function updateSearch(name, value) {
    setSearch((current) => ({ ...current, [name]: value }));
  }

  function addLeg() {
    if ((search.legs?.length || 0) >= MAX_ADDED_DESTINATIONS) return;
    setSearch((current) => {
      const previousDestination = current.legs?.at(-1)?.to || current.to;
      return { ...current, legs: [...(current.legs || []), { from: previousDestination, to: "", date: current.date }] };
    });
  }

  function updateLeg(index, key, value) {
    setSearch((current) => ({
      ...current,
      legs: current.legs.map((leg, legIndex) => legIndex === index ? { ...leg, [key]: value } : leg),
    }));
  }

  async function loadLiveFlights() {
    if (!apiKey.trim()) {
      setApiMessage("Add an AviationStack access key to search live flight data.");
      return;
    }
    setLoading(true);
    setApiMessage("");
    try {
      const origin = flights.find((flight) => flight.from.toLowerCase() === search.from.toLowerCase())?.fromCode ||
        search.from.toUpperCase().slice(0, 3);
      const destination = flights.find((flight) => flight.to.toLowerCase() === search.to.toLowerCase())?.toCode ||
        search.to.toUpperCase().slice(0, 3);
      const params = new URLSearchParams({
        access_key: apiKey.trim(),
        dep_iata: origin,
        arr_iata: destination,
      });
      const response = await fetch(`https://api.aviationstack.com/v1/flights?${params}`, { method: "GET" });
      if (!response.ok) throw new Error("AviationStack could not complete the request. Check your key and try again.");
      const payload = await response.json();
      if (payload.error) throw new Error(payload.error.message || "AviationStack returned an error.");
      const records = Array.isArray(payload.results)
        ? payload.results
        : Array.isArray(payload.data)
          ? payload.data
          : [];
      const liveFlights = records
        .filter((item) => item.live?.is_ground === false)
        .map((item, index) => ({
        id: `live-${item.flight?.iata || index}`,
        airline: item.airline?.name || "Airline",
        flightNumber: item.flight?.iata || item.flight?.number || "Flight",
        from: item.departure?.airport || search.from,
        fromCode: item.departure?.iata || origin,
        to: item.arrival?.airport || search.to,
        toCode: item.arrival?.iata || destination,
        departure: item.departure?.scheduled?.slice(11, 16) || "—",
        arrival: item.arrival?.scheduled?.slice(11, 16) || "—",
        date: item.departure?.scheduled?.slice(0, 10) || search.date,
        price: 4999,
        availableSeats: 0,
        bookedSeats: 0,
        stops: 0,
        status: "In the air",
        live: true,
      }));
      setFlightData(liveFlights);
      setApiMessage(liveFlights.length
        ? `${liveFlights.length} live flight${liveFlights.length === 1 ? "" : "s"} loaded. Estimated prices shown.`
        : "No live flights found for this route.");
    } catch (error) {
      setApiMessage(error.message || "Network error while loading live flights.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-copy"><span className="eyebrow light">LESS PLANNING. MORE WANDERING.</span><h1>Good trips start<br />with a <em>little looking.</em></h1><p>Find your next flight and get out there.</p></div>
        <div className="hero-stamp"><span>✳</span><small>THE LONG WAY<br />IS OVERRATED</small></div>
        <div className="hero-cloud cloud-one"></div><div className="hero-cloud cloud-two"></div>
      </section>
      <section className="search-panel">
        <div className="trip-tabs">
          {[["one-way", "One way"], ["round-trip", "Round trip"], ["multi-city", "Multi-city"]].map(([value, label]) =>
            <button key={value} className={search.type === value ? "trip-tab active" : "trip-tab"} onClick={() => updateSearch("type", value)}>{label}</button>
          )}
        </div>
        <form onSubmit={(event) => { event.preventDefault(); setFlightData(flights); }} className="search-grid">
          <label className="search-field"><span>FROM</span><input list="cities" value={search.from} onChange={(event) => updateSearch("from", event.target.value)} required placeholder="City or airport" /></label>
          <button type="button" className="swap-button" title="Swap destinations" onClick={() => setSearch((current) => ({ ...current, from: current.to, to: current.from }))}>⇄</button>
          <label className="search-field"><span>TO</span><input list="cities" value={search.to} onChange={(event) => updateSearch("to", event.target.value)} required placeholder="City or airport" /></label>
          <label className="search-field"><span>DEPART</span><input type="date" value={search.date} onChange={(event) => updateSearch("date", event.target.value)} required /></label>
          {search.type === "round-trip" && <label className="search-field"><span>RETURN</span><input type="date" min={search.date} value={search.returnDate} onChange={(event) => updateSearch("returnDate", event.target.value)} required /></label>}
          <button className="button search-button">Search flights <span>→</span></button>
          {search.type === "multi-city" && <div className="multi-legs">
            {(search.legs || []).map((leg, index) => <div className="leg-row" key={index}>
              <b>Leg {index + 2}</b>
              <input aria-label={`Leg ${index + 2} origin`} list="cities" value={leg.from} onChange={(event) => updateLeg(index, "from", event.target.value)} placeholder="From" required />
              <input aria-label={`Leg ${index + 2} destination`} list="cities" value={leg.to} onChange={(event) => updateLeg(index, "to", event.target.value)} placeholder="To" required />
              <input aria-label={`Leg ${index + 2} date`} type="date" value={leg.date} onChange={(event) => updateLeg(index, "date", event.target.value)} required />
            </div>)}
            {(search.legs || []).length < MAX_ADDED_DESTINATIONS && (
              <button type="button" className="text-button add-leg" onClick={addLeg}>
                ＋ Add destination ({(search.legs || []).length}/{MAX_ADDED_DESTINATIONS} added)
              </button>
            )}
          </div>}
          <datalist id="cities">{cities.map((city) => <option key={city} value={city} />)}</datalist>
        </form>
        <div className="live-search"><span>Looking for real-time data?</span><input value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="AviationStack API key (optional)" type="password" aria-label="AviationStack API key" /><button className="outline-button" onClick={loadLiveFlights} disabled={loading}>{loading ? "Loading…" : "Search live flights"}</button></div>
        {apiMessage && <p className="api-message">{apiMessage}</p>}
      </section>
      <section className="results-section">
        <div className="section-heading"><div><span className="eyebrow">YOUR OPTIONS</span><h2>Flights worth catching <span className="count-badge">{results.length}</span></h2></div><span className="muted">Showing available flights</span></div>
        <div className="results-layout">
          <aside className="filters">
            <h3>Filter by</h3>
            <label className="filter-label">Price range
              <span className="price-filter"><input type="number" min="0" aria-label="Minimum price" placeholder="Min ₹" value={filters.minPrice} onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })} /><input type="number" min="0" aria-label="Maximum price" placeholder="Max ₹" value={filters.maxPrice} onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })} /></span>
            </label>
            <label className="filter-label">Airline<select value={filters.airline} onChange={(event) => setFilters({ ...filters, airline: event.target.value })}><option>All airlines</option>{[...new Set(flightData.map((flight) => flight.airline))].map((airline) => <option key={airline}>{airline}</option>)}</select></label>
            <label className="filter-label">Stops<select value={filters.stops} onChange={(event) => setFilters({ ...filters, stops: event.target.value })}><option>Any stops</option><option>Non-stop</option><option>1 stop</option><option>2+ stops</option></select></label>
            <label className="filter-label">Departure time<select value={filters.departure} onChange={(event) => setFilters({ ...filters, departure: event.target.value })}><option>Any time</option><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Night</option></select></label>
            <label className="filter-label">Arrival time<select value={filters.arrival} onChange={(event) => setFilters({ ...filters, arrival: event.target.value })}><option>Any time</option><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Night</option></select></label>
          </aside>
          <div className="flight-list">
            {invalidPriceRange
              ? <div className="empty-state"><h3>Check your price range</h3><p>Minimum price must be less than or equal to maximum price.</p></div>
              : results.length
                ? results.map((flight) => <FlightCard flight={flight} key={flight.id} />)
                : <div className="empty-state"><span>⌁</span><h3>No flights found just yet</h3><p>Try changing your route or filters to see more options.</p></div>}
          </div>
        </div>
      </section>
      <section className="bottom-note"><span>✳</span><p>Good journeys aren’t just about where you’re going.<br /><strong>They’re about everything you discover along the way.</strong></p><span>✳</span></section>
    </main>
  );
}
