import React from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    Grid,
    Paper,
    MenuItem,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    Autocomplete,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { Passenger, Contact, Errors } from "../Types/FlightTypes";
import { countryCodes } from "../../utils/FlightData";

interface PassengerDetailsFormProps {
    passengers: Passenger[];
    setPassengers: React.Dispatch<React.SetStateAction<Passenger[]>>;
    contact: Contact;
    setContact: React.Dispatch<React.SetStateAction<Contact>>;
    errors: Errors;
    setErrors: React.Dispatch<React.SetStateAction<Errors>>;
    passengersNumber?: number;
    validatePassenger: (passenger: Passenger) => { firstName: string; lastName: string; dob: string; gender: string };
    validateContact: () => { email: string; phone: string; countryCode: string };
}

const PassengerDetailsForm: React.FC<PassengerDetailsFormProps> = ({
    passengers,
    setPassengers,
    contact,
    setContact,
    errors,
    setErrors,
    passengersNumber,
    validatePassenger,
    validateContact,
}) => {
    const handlePassengerChange = (
        index: number,
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }
    ) => {
        const updated = [...passengers];
        updated[index][e.target.name as keyof Passenger] = e.target.value;
        setPassengers(updated);

        const newErrors = [...errors.passengers];
        newErrors[index] = validatePassenger(updated[index]);
        setErrors((prev) => ({ ...prev, passengers: newErrors }));
    };

    const addPassenger = () => {
        setPassengers((prev) => [
            ...prev,
            { title: "Mr.", firstName: "", lastName: "", dob: "", gender: "", passport: "" },
        ]);
        setErrors((prev) => ({
            ...prev,
            passengers: [...prev.passengers, { firstName: "", lastName: "", dob: "", gender: "" }],
        }));
    };

    const removePassenger = (index: number) => {
        setPassengers((prev) => prev.filter((_, i) => i !== index));
        setErrors((prev) => ({
            ...prev,
            passengers: prev.passengers.filter((_, i) => i !== index),
        }));
    };

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContact({ ...contact, [e.target.name]: e.target.value });
        const newErrors = validateContact();
        setErrors((prev) => ({ ...prev, contact: newErrors }));
    };

    const handleCountryCodeChange = (value: string) => {
        setContact({ ...contact, countryCode: value });
        const newErrors = validateContact();
        setErrors((prev) => ({ ...prev, contact: newErrors }));
    };

    return (
        <Paper
            sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 2,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                bgcolor: "#fff",
            }}
        >
            <Typography
                variant="h5"
                fontWeight={700}
                color="primary"
                gutterBottom
                sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}
            >
                Traveler Details
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Please provide details for all travelers as shown on their passports
            </Typography>

            {passengers.map((passenger, index) => (
                <Box
                    key={index}
                    mb={4}
                    sx={{ borderBottom: "1px solid #e0e0e0", pb: 2 }}
                >
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        mb={2}
                    >
                        <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{ fontSize: { xs: "1.2rem", md: "1.5rem" } }}
                        >
                            Traveler {index + 1} {index === 0 && "(Primary Contact)"}
                        </Typography>
                        {index > 0 && (
                            <IconButton
                                onClick={() => removePassenger(index)}
                                aria-label="Remove traveler"
                                color="error"
                            >
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={2}>
                            <FormControl
                                fullWidth
                                error={!!errors.passengers[index].firstName}
                            >
                                <InputLabel>Title</InputLabel>
                                <Select
                                    name="title"
                                    value={passenger.title}
                                    onChange={(e) => handlePassengerChange(index, e as any)}
                                    sx={{ borderRadius: 1 }}
                                >
                                    <MenuItem value="Mr.">Mr.</MenuItem>
                                    <MenuItem value="Ms.">Ms.</MenuItem>
                                    <MenuItem value="Mrs.">Mrs.</MenuItem>
                                    <MenuItem value="Dr.">Dr.</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <TextField
                                label="First Name"
                                name="firstName"
                                value={passenger.firstName}
                                onChange={(e) => handlePassengerChange(index, e)}
                                fullWidth
                                required
                                error={!!errors.passengers[index].firstName}
                                helperText={errors.passengers[index].firstName}
                                InputProps={{
                                    sx: { borderRadius: 1 },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <TextField
                                label="Last Name"
                                name="lastName"
                                value={passenger.lastName}
                                onChange={(e) => handlePassengerChange(index, e)}
                                fullWidth
                                required
                                error={!!errors.passengers[index].lastName}
                                helperText={errors.passengers[index].lastName}
                                InputProps={{
                                    sx: { borderRadius: 1 },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl
                                fullWidth
                                error={!!errors.passengers[index].gender}
                            >
                                <InputLabel>Gender</InputLabel>
                                <Select
                                    name="gender"
                                    value={passenger.gender}
                                    onChange={(e) => handlePassengerChange(index, e as any)}
                                    sx={{ borderRadius: 1 }}
                                >
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                                {!!errors.passengers[index].gender && (
                                    <Typography variant="caption" color="error">
                                        {errors.passengers[index].gender}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Date of Birth"
                                name="dob"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={passenger.dob}
                                onChange={(e) => handlePassengerChange(index, e)}
                                fullWidth
                                required
                                error={!!errors.passengers[index].dob}
                                helperText={errors.passengers[index].dob}
                                InputProps={{
                                    sx: { borderRadius: 1 },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Passport Number (Optional)"
                                name="passport"
                                value={passenger.passport}
                                onChange={(e) => handlePassengerChange(index, e)}
                                fullWidth
                                InputProps={{
                                    sx: { borderRadius: 1 },
                                }}
                            />
                        </Grid>
                    </Grid>
                </Box>
            ))}

            {passengers.length < (passengersNumber || 9) && (
                <Button
                    variant="outlined"
                    startIcon={<PersonAddIcon />}
                    onClick={addPassenger}
                    sx={{ mb: 3, textTransform: "none", borderRadius: 1 }}
                >
                    Add Another Traveler
                </Button>
            )}

            <Typography
                variant="h6"
                fontWeight={600}
                sx={{ mb: 2, fontSize: { xs: "1.2rem", md: "1.5rem" } }}
            >
                Contact Information
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={5}>
                    <TextField
                        label="Email Address"
                        name="email"
                        value={contact.email}
                        onChange={handleContactChange}
                        fullWidth
                        required
                        error={!!errors.contact.email}
                        helperText={errors.contact.email}
                        InputProps={{
                            startAdornment: <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />,
                            sx: { borderRadius: 1 },
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <Autocomplete
                        options={countryCodes}
                        getOptionLabel={(option) => option.label}
                        value={countryCodes.find((c) => c.code === contact.countryCode) || null}
                        onChange={(_, value) => handleCountryCodeChange(value?.code || "+1")}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Country Code"
                                error={!!errors.contact.countryCode}
                                helperText={errors.contact.countryCode}
                                InputProps={{
                                    ...params.InputProps,
                                    sx: { borderRadius: 1, minWidth: 100 },
                                }}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={5}>
                    <TextField
                        label="Phone Number"
                        name="phone"
                        value={contact.phone}
                        onChange={handleContactChange}
                        fullWidth
                        required
                        error={!!errors.contact.phone}
                        helperText={errors.contact.phone}
                        InputProps={{
                            startAdornment: <PhoneIcon sx={{ mr: 1, color: "text.secondary" }} />,
                            sx: { borderRadius: 1 },
                        }}
                    />
                </Grid>
            </Grid>
        </Paper>
    );
};

export default PassengerDetailsForm;