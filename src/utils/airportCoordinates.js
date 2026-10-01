const airportCoordinates = {
  BLR: [13.1986, 77.7066],
  BOM: [19.0896, 72.8656],
  CCU: [22.6547, 88.4467],
  COK: [10.152, 76.4019],
  DEL: [28.5562, 77.1],
  GOI: [15.3808, 73.8314],
  HYD: [17.2403, 78.4294],
  JAI: [26.8242, 75.8122],
  MAA: [12.9941, 80.1709],
  PNQ: [18.5822, 73.9197],
  AMD: [23.0772, 72.6347],
  ATQ: [31.7096, 74.7973],
  BBI: [20.2444, 85.8178],
  IXC: [30.6735, 76.7885],
  IXE: [12.9613, 74.8901],
  LKO: [26.7606, 80.8893],
  NAG: [21.0922, 79.0472],
  PAT: [25.5913, 85.088],
  SXR: [33.9871, 74.7742],
  TRV: [8.4821, 76.9201],
  VNS: [25.4524, 82.8593],
  DXB: [25.2532, 55.3657],
  DOH: [25.2731, 51.6081],
  LHR: [51.47, -0.4543],
  SIN: [1.3644, 103.9915],
};

export function getFlightCoordinates(fromCode, toCode) {
  const origin = airportCoordinates[String(fromCode || "").toUpperCase()];
  const destination = airportCoordinates[String(toCode || "").toUpperCase()];
  return origin && destination ? { origin, destination } : null;
}

export function createGreatCirclePath(origin, destination, steps = 48) {
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const degrees = (value) => (value * 180) / Math.PI;
  const toVector = ([latitude, longitude]) => {
    const lat = radians(latitude);
    const lon = radians(longitude);
    return [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)];
  };
  const fromVector = ([x, y, z]) => [degrees(Math.atan2(z, Math.hypot(x, y))), degrees(Math.atan2(y, x))];
  const start = toVector(origin);
  const end = toVector(destination);
  const dot = Math.max(-1, Math.min(1, start.reduce((sum, value, index) => sum + value * end[index], 0)));
  const angle = Math.acos(dot);
  if (angle < 1e-7) return [origin, destination];

  return Array.from({ length: steps + 1 }, (_, index) => {
    if (index === 0) return origin;
    if (index === steps) return destination;
    const fraction = index / steps;
    const startWeight = Math.sin((1 - fraction) * angle) / Math.sin(angle);
    const endWeight = Math.sin(fraction * angle) / Math.sin(angle);
    return fromVector(start.map((value, vectorIndex) => value * startWeight + end[vectorIndex] * endWeight));
  });
}
