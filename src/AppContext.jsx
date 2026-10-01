import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AppContext = createContext(null);
const SESSION_KEY = "flightly_session";
const USERS_KEY = "flightly_users";
const FLIGHTS_KEY = "flightly_flights";
const BOOKINGS_KEY = "flightly_bookings";
const SESSION_DURATION = 5 * 60 * 1000;
const USER_ROLES = new Set(["user", "admin"]);
const initialFlights = [
  {
    id: "flight-pnq-bom",
    airline: "Akasa Air",
    flightNumber: "QP 1312",
    from: "Pune",
    fromCode: "PNQ",
    to: "Mumbai",
    toCode: "BOM",
    departure: "09:15",
    arrival: "10:20",
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    price: 2499,
    availableSeats: 50,
    bookedSeats: 12,
    stops: 0,
    status: "On time",
  },
  {
    id: "flight-bom-del",
    airline: "IndiGo",
    flightNumber: "6E 2134",
    from: "Mumbai",
    fromCode: "BOM",
    to: "New Delhi",
    toCode: "DEL",
    departure: "14:35",
    arrival: "16:45",
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    price: 5890,
    availableSeats: 28,
    bookedSeats: 34,
    stops: 0,
    status: "On time",
  },
  {
    id: "flight-del-blr",
    airline: "Air India",
    flightNumber: "AI 807",
    from: "New Delhi",
    fromCode: "DEL",
    to: "Bengaluru",
    toCode: "BLR",
    departure: "18:10",
    arrival: "21:00",
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    price: 7240,
    availableSeats: 19,
    bookedSeats: 41,
    stops: 0,
    status: "On time",
  },
];

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: encoder.encode(salt), iterations: 120000, hash: "SHA-256" },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const session = readStorage(SESSION_KEY, null);
    if (!session || !USER_ROLES.has(session.role) || !Number.isFinite(session.lastActivity)) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    if (Date.now() - session.lastActivity >= SESSION_DURATION) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session ? { name: session.name, email: session.email, role: session.role } : null;
  });
  const [flights, setFlights] = useState(() => {
    const saved = readStorage(FLIGHTS_KEY, null);
    if (saved) return saved;
    writeStorage(FLIGHTS_KEY, initialFlights);
    return initialFlights;
  });
  const [bookings, setBookings] = useState(() => readStorage(BOOKINGS_KEY, []));

  useEffect(() => {
    writeStorage(FLIGHTS_KEY, flights);
  }, [flights]);
  useEffect(() => {
    writeStorage(BOOKINGS_KEY, bookings);
  }, [bookings]);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    function syncSession(event) {
      if (event.key !== SESSION_KEY) return;
      if (!event.newValue) {
        setUser(null);
        return;
      }
      try {
        const session = JSON.parse(event.newValue);
        if (!USER_ROLES.has(session.role) || !Number.isFinite(session.lastActivity) ||
          Date.now() - session.lastActivity >= SESSION_DURATION) {
          setUser(null);
          return;
        }
        setUser({ name: session.name, email: session.email, role: session.role });
      } catch {
        setUser(null);
      }
    }
    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("storage", syncSession);
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    let timer;
    const refresh = () => {
      const stored = readStorage(SESSION_KEY, null);
      if (!stored || !USER_ROLES.has(stored.role) || !Number.isFinite(stored.lastActivity) ||
        Date.now() - stored.lastActivity >= SESSION_DURATION) {
        logout();
        return;
      }
      const updated = { ...stored, lastActivity: Date.now() };
      writeStorage(SESSION_KEY, updated);
      clearTimeout(timer);
      timer = setTimeout(logout, SESSION_DURATION);
    };
    ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach((event) =>
      window.addEventListener(event, refresh, { passive: true }),
    );
    const current = readStorage(SESSION_KEY, null);
    const elapsed = current ? Date.now() - current.lastActivity : SESSION_DURATION;
    if (elapsed >= SESSION_DURATION) logout();
    else timer = setTimeout(logout, SESSION_DURATION - elapsed);
    return () => {
      clearTimeout(timer);
      ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach((event) =>
        window.removeEventListener(event, refresh),
      );
    };
  }, [user, logout]);

  const signup = useCallback(async ({ name, email, password, role }) => {
    const normalizedName = String(name || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedName || !normalizedEmail || String(password || "").length < 8 || !USER_ROLES.has(role)) {
      throw new Error("Enter a name, valid email, password with at least 8 characters, and a valid account type.");
    }
    const users = readStorage(USERS_KEY, []);
    if (users.some((account) => account.email.toLowerCase() === normalizedEmail)) {
      throw new Error("An account with this email already exists.");
    }
    const salt = crypto.randomUUID();
    const account = { name: normalizedName, email: normalizedEmail, role, salt, passwordHash: await hashPassword(password, salt) };
    writeStorage(USERS_KEY, [...users, account]);
    const session = { name: normalizedName, email: account.email, role, lastActivity: Date.now() };
    writeStorage(SESSION_KEY, session);
    setUser(session);
    return session;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const account = readStorage(USERS_KEY, []).find((item) => item.email === normalizedEmail);
    if (!account || !password || account.passwordHash !== (await hashPassword(password, account.salt))) {
      throw new Error("Email or password is incorrect.");
    }
    const session = { name: account.name, email: account.email, role: account.role, lastActivity: Date.now() };
    writeStorage(SESSION_KEY, session);
    setUser(session);
    return session;
  }, []);

  const saveFlight = useCallback((flight) => {
    setFlights((current) => {
      const exists = current.some((item) => item.id === flight.id);
      return exists ? current.map((item) => (item.id === flight.id ? flight : item)) : [flight, ...current];
    });
  }, []);

  const deleteFlight = useCallback((id) => setFlights((current) => current.filter((flight) => flight.id !== id)), []);

  const createBooking = useCallback((flight, passenger, seats) => {
    const booking = {
      id: `FL-${crypto.randomUUID().toUpperCase()}`,
      flightId: flight.id,
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      from: flight.from,
      fromCode: flight.fromCode,
      to: flight.to,
      toCode: flight.toCode,
      date: flight.date,
      departure: flight.departure,
      arrival: flight.arrival,
      passenger,
      seats,
      total: flight.price * seats,
      email: user.email,
      status: "Confirmed",
      createdAt: new Date().toISOString(),
    };
    setBookings((current) => [booking, ...current]);
    setFlights((current) =>
      current.map((item) =>
        item.id === flight.id
          ? { ...item, availableSeats: Math.max(0, item.availableSeats - seats), bookedSeats: item.bookedSeats + seats }
          : item,
      ),
    );
    return booking;
  }, [user]);

  const value = useMemo(
    () => ({ user, flights, bookings, signup, login, logout, saveFlight, deleteFlight, createBooking }),
    [user, flights, bookings, signup, login, logout, saveFlight, deleteFlight, createBooking],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
