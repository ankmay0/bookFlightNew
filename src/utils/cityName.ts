const airportCityMap: { [key: string]: string } = {
  EWR: "Newark",
  JFK: "New York",
  LGA: "New York",
  LAX: "Los Angeles",
  ORD: "Chicago",
  ATL: "Atlanta",
  DFW: "Dallas",
  SFO: "San Francisco",
  SEA: "Seattle",
  BOS: "Boston",
  DEL: "Delhi",
  BOM: "Mumbai",
  BLR: "Bengaluru",
  MAA: "Chennai",
  HYD: "Hyderabad",
  CCU: "Kolkata",
  DXB: "Dubai",
  // ...add more as needed
};

export function getCityName(code: string): string {
  return airportCityMap[code.toUpperCase()] || code;
}