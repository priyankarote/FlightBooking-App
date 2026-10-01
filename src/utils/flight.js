export const money = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

export const timeSlot = (time) => {
  const hour = Number(time?.slice(0, 2));
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 21) return "Evening";
  return "Night";
};

export const defaultSearch = {
  from: "Pune",
  to: "Mumbai",
  date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  type: "one-way",
  returnDate: "",
};

export const blankFlight = {
  airline: "",
  flightNumber: "",
  from: "",
  fromCode: "",
  to: "",
  toCode: "",
  departure: "",
  arrival: "",
  date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  price: "",
  availableSeats: 50,
  bookedSeats: 0,
  stops: 0,
  status: "On time",
};
