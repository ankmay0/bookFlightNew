import { BookingData } from "../components/ManageReservation";

export const fetchBooking = async (
  searchText: string,
  setBookingData: React.Dispatch<React.SetStateAction<BookingData | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string>>,
  getFlightName: (carrierCode: string, flightNumber: string) => string
) => {
  if (!searchText.trim()) {
    setError('Please enter a valid booking ID.');
    return;
  }
  setLoading(true);
  setError('');
  setBookingData(null);

  try {
    const encodedId = encodeURIComponent(searchText);
    console.log(`Fetching booking for ID: ${encodedId}`);
    const res = await fetch(`http://localhost:8080/flights/flight-order/${encodedId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`Response status: ${res.status}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Booking not found. Please check your booking ID.');
      } else if (res.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        const text = await res.text();
        console.log('Raw response:', text);
        throw new Error(`Failed to fetch booking (Status: ${res.status})`);
      }
    }
    let data: BookingData;
    try {
      data = await res.json();
      console.log('Booking data:', data);
    } catch (jsonError) {
      throw new Error('Invalid response format from server.');
    }
    if (!data.orderId || !data.flightOffer?.trips) {
      throw new Error('Incomplete booking data received.');
    }
    // Validate leg data for flight names
    data.flightOffer.trips.forEach((trip, idx) => {
      trip.legs.forEach((leg) => {
        console.log(`Flight name for leg ${leg.legNo}:`, getFlightName(leg.operatingCarrierCode, leg.flightNumber));
      });
    });
    setBookingData(data);
  } catch (err: any) {
    console.error('Fetch error:', err.message);
    setError(err.message || 'Could not fetch booking details. Please check your booking ID and try again.');
  } finally {
    setLoading(false);
  }
};