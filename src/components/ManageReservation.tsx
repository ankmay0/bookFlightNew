import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  InputAdornment,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Stack,
  Chip,
  Alert,
  IconButton,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import PhoneIcon from '@mui/icons-material/Phone';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FlightIcon from '@mui/icons-material/Flight';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getCityName, getFlightName } from '../utils/FlightData';

interface Traveler {
  id: string;
  dateOfBirth: string;
  gender: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phones: {
    deviceType: string;
    countryCallingCode: string;
    number: string;
  }[];
  documents: {
    number: string;
    expiryDate: string;
    issuanceCountry: string;
    nationality: string;
    documentType: string;
    holder: boolean;
  }[];
}

interface Leg {
  legNo: string;
  flightNumber: string;
  operatingCarrierCode: string;
  aircraftCode: string;
  departureAirport: string;
  departureTerminal: string;
  departureDateTime: string;
  arrivalAirport: string;
  arrivalTerminal: string;
  arrivalDateTime: string;
  duration: string;
  layoverAfter: string | null;
}

interface Trip {
  from: string;
  to: string;
  stops: number;
  totalFlightDuration: string;
  totalLayoverDuration: string;
  legs: Leg[];
}

interface BookingData {
  orderId: string;
  travelers: Traveler[];
  flightOffer: {
    oneWay: boolean;
    seatsAvailable: number;
    currencyCode: string;
    basePrice: string;
    totalPrice: string;
    totalTravelers: number;
    trips: Trip[];
    pricingAdditionalInfo: string | null;
  };
}

const ManageReservation: React.FC = () => {
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [error, setError] = useState('');

  const formatDateTime = (dateTime: string) => {
    const dateObj = new Date(dateTime);
    return {
      date: dateObj.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: dateObj.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const handleSearch = async () => {
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
      const res = await fetch(`http://localhost:8080/booking/flight-order/${encodedId}`, {
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

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'white',
      py: 4,
      px: { xs: 2, sm: 3 }
    }}>
      {/* Hero Section */}
      <Box textAlign="center" mb={6}>
        <FlightIcon sx={{ fontSize: 48, color: 'black', mb: 2 }} />
        <Typography 
          variant="h3" 
          fontWeight="bold" 
          color="black" 
          mb={1}
          sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
        >
          Manage Your Booking
        </Typography>
        <Typography 
          variant="h6" 
          color="black" 
          fontWeight={300}
          sx={{ maxWidth: 600, mx: 'auto' }}
        >
          Enter your booking ID to view your itinerary and passenger details
        </Typography>
      </Box>

      {/* Search Section */}
      <Paper 
        elevation={6} 
        sx={{ 
          p: 4, 
          borderRadius: 4, 
          maxWidth: 800, 
          mx: 'auto', 
          mb: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Enter Booking ID"
              variant="outlined"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyPress={handleKeyPress}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSearch}
              disabled={loading}
              sx={{ 
                height: 56,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 15px rgba(33, 203, 243, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error State */}
      {error && (
        <Fade in={true}>
          <Alert 
            severity="error" 
            sx={{ 
              maxWidth: 800, 
              mx: 'auto', 
              mb: 4,
              borderRadius: 2
            }}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={handleSearch}
              >
                <RefreshIcon />
              </IconButton>
            }
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Loading State */}
      {loading && (
        <Box textAlign="center" py={4}>
          <CircularProgress size={40} sx={{ color: theme.palette.primary.main }} />
          <Typography color="text.primary" mt={2}>
            Searching for your booking...
          </Typography>
        </Box>
      )}

      {/* Booking Results */}
      {bookingData && (
        <Fade in={true}>
          <Box maxWidth={1200} mx="auto">
            {/* Booking Summary Card */}
            <Card 
              elevation={6} 
              sx={{ 
                borderRadius: 3, 
                mb: 4, 
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5" fontWeight="bold">
                    Booking Confirmed
                  </Typography>
                  <Chip 
                    label="CONFIRMED" 
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      color: 'white',
                      fontWeight: 'bold'
                    }} 
                  />
                </Stack>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AttachMoneyIcon />
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Price</Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {bookingData.flightOffer.currencyCode} {bookingData.flightOffer.totalPrice}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AirlineSeatReclineNormalIcon />
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Travelers</Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {bookingData.flightOffer.totalTravelers}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <DescriptionIcon />
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Booking ID</Typography>
                        <Typography variant="h6" fontWeight="bold" sx={{ wordBreak: 'break-all' }}>
                          {bookingData.orderId}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Passenger Information */}
            <Card elevation={4} sx={{ borderRadius: 3, mb: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                  <PersonIcon color="primary" sx={{ fontSize: 28 }} />
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    Passenger Information
                  </Typography>
                </Stack>

                {bookingData.travelers.map((traveler, index) => (
                  <React.Fragment key={traveler.id}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 3, 
                        mb: index < bookingData.travelers.length - 1 ? 3 : 0,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={3} mb={2}>
                        <Box flex={1}>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {traveler.firstName} {traveler.lastName}
                          </Typography>
                          <Stack direction="row" spacing={2} flexWrap="wrap">
                            <Chip 
                              icon={<PersonIcon />} 
                              label={traveler.gender || 'N/A'} 
                              size="small" 
                              variant="outlined"
                            />
                            <Chip 
                              icon={<EventIcon />} 
                              label={traveler.dateOfBirth || 'N/A'} 
                              size="small" 
                              variant="outlined"
                            />
                          </Stack>
                        </Box>
                      </Stack>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PhoneIcon color="action" fontSize="small" />
                            <Typography variant="body2">
                              <strong>Phone:</strong> {traveler.phones[0]?.countryCallingCode || ''} {traveler.phones[0]?.number || 'N/A'}
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <DescriptionIcon color="action" fontSize="small" />
                            <Typography variant="body2">
                              <strong>Document:</strong> {traveler.documents[0]?.documentType || 'N/A'} {traveler.documents[0]?.number || 'N/A'}
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>
                  </React.Fragment>
                ))}
              </CardContent>
            </Card>

            {/* Flight Itinerary */}
            <Card elevation={4} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                  <FlightIcon color="primary" sx={{ fontSize: 28 }} />
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    Flight Itinerary
                  </Typography>
                </Stack>

                {bookingData.flightOffer.trips.map((trip, idx) => (
                  <Paper 
                    key={idx} 
                    elevation={2} 
                    sx={{ 
                      p: 3, 
                      mb: idx < bookingData.flightOffer.trips.length - 1 ? 3 : 0,
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.02) 0%, rgba(156, 39, 176, 0.02) 100%)'
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {idx === 0 ? 'Outbound Flight' : 'Return Flight'}: {getCityName(trip.from) || 'Unknown'} → {getCityName(trip.to) || 'Unknown'}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {trip.totalFlightDuration || 'N/A'}
                        </Typography>
                      </Stack>
                    </Stack>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    {trip.legs.map((leg, legIndex) => {
                      const departureTime = formatDateTime(leg.departureDateTime);
                      const arrivalTime = formatDateTime(leg.arrivalDateTime);
                      
                      return (
                        <Box key={leg.legNo} sx={{ mb: legIndex < trip.legs.length - 1 ? 3 : 0 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <FlightTakeoffIcon color="primary" />
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    Departure
                                  </Typography>
                                  <Typography variant="body1">
                                    {getCityName(leg.departureAirport) || 'Unknown'} Terminal {leg.departureTerminal || 'N/A'}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {departureTime.date} • {departureTime.time}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <FlightLandIcon color="secondary" />
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    Arrival
                                  </Typography>
                                  <Typography variant="body1">
                                    {getCityName(leg.arrivalAirport) || 'Unknown'} Terminal {leg.arrivalTerminal || 'N/A'}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {arrivalTime.date} • {arrivalTime.time}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Grid>
                          </Grid>
                          
                          <Stack direction="row" spacing={2} mt={2} flexWrap="wrap">
                            <Chip 
                              label={getFlightName(leg.operatingCarrierCode, leg.flightNumber) || 'Unknown Flight'} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                            />
                            <Chip 
                              label={leg.aircraftCode || 'N/A'} 
                              size="small" 
                              variant="outlined"
                            />
                            <Chip 
                              label={leg.duration || 'N/A'} 
                              size="small" 
                              variant="outlined"
                            />
                          </Stack>
                          
                          {leg.layoverAfter && (
                            <Typography variant="body2" color="text.secondary" mt={2}>
                              <strong>Layover:</strong> {leg.layoverAfter}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Paper>
                ))}
              </CardContent>
            </Card>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default ManageReservation;