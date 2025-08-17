import React, { useState, useEffect } from "react";
import { Box, Grid } from "@mui/material";
import { Flight, Passenger, Contact, Errors } from "../Types/FlightTypes";
import PassengerDetailsForm from "./PassengerDetailsForm";
import FlightSummary from "./FlightSummary";

interface PassengerFormProps {
    flight: Flight;
    navigate: (path: string, options: { state: any }) => void;
    passengersNumber?: number;
}

const PassengerForm: React.FC<PassengerFormProps> = ({
    flight,
    navigate,
    passengersNumber,
}) => {
    const [passengers, setPassengers] = useState<Passenger[]>([
        { title: "Mr.", firstName: "", lastName: "", dob: "", gender: "", passport: "" },
    ]);
    const [contact, setContact] = useState<Contact>({ email: "", phone: "", countryCode: "+1" });
    const [errors, setErrors] = useState<Errors>({
        passengers: [{ firstName: "", lastName: "", dob: "", gender: "" }],
        contact: { email: "", phone: "", countryCode: "" },
    });

    useEffect(() => {
        if (passengersNumber && passengersNumber > 1) {
            const initialPassengers = Array.from({ length: passengersNumber }, () => ({
                title: "Mr.",
                firstName: "",
                lastName: "",
                dob: "",
                gender: "",
                passport: "",
            }));
            setPassengers(initialPassengers);
            setErrors({
                passengers: Array.from({ length: passengersNumber }, () => ({
                    firstName: "",
                    lastName: "",
                    dob: "",
                    gender: "",
                })),
                contact: { email: "", phone: "", countryCode: "" },
            });
        }
    }, [passengersNumber]);

    const validatePassenger = (passenger: Passenger) => {
        const newErrors = { firstName: "", lastName: "", dob: "", gender: "" };
        if (!passenger.firstName) newErrors.firstName = "First name is required";
        if (!passenger.lastName) newErrors.lastName = "Last name is required";
        if (!passenger.dob) newErrors.dob = "Date of birth is required";
        if (!passenger.gender) newErrors.gender = "Gender is required";
        return newErrors;
    };

    const validateContact = () => {
        const newErrors = { email: "", phone: "", countryCode: "" };
        if (!contact.email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(contact.email))
            newErrors.email = "Invalid email format";
        if (!contact.phone) newErrors.phone = "Phone number is required";
        if (!contact.countryCode) newErrors.countryCode = "Country code is required";
        return newErrors;
    };

    const handleConfirm = () => {
        const passengerErrors = passengers.map((p) => validatePassenger(p));
        const contactErrors = validateContact();
        setErrors({ passengers: passengerErrors, contact: contactErrors });

        const hasErrors =
            passengerErrors.some((p) => p.firstName || p.lastName || p.dob || p.gender) ||
            contactErrors.email ||
            contactErrors.phone ||
            contactErrors.countryCode;

        if (!hasErrors) {
            navigate("/review-confirmation", {
                state: { passengers, contact, flight },
            });
        }
    };

    return (
        <Box
            sx={{
                width: "100vw",
                bgcolor: "#f4f6f8",
                p: { xs: 2, md: 4 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <Grid container spacing={3} sx={{ maxWidth: 1400, width: "100%" }}>
                <Grid item xs={12} md={8}>
                    <PassengerDetailsForm
                        passengers={passengers}
                        setPassengers={setPassengers}
                        contact={contact}
                        setContact={setContact}
                        errors={errors}
                        setErrors={setErrors}
                        passengersNumber={passengersNumber}
                        validatePassenger={validatePassenger}
                        validateContact={validateContact}
                    />
                </Grid>
                <Grid
                    item
                    xs={12}
                    md={4}
                    sx={{
                        position: { md: "sticky" },
                        top: { md: 20 },
                        alignSelf: { md: "flex-start" },
                    }}
                >
                    <FlightSummary
                        flight={flight}
                        passengers={passengers}
                        totalPricePerTraveler={parseFloat(flight.totalPrice)}
                        basePricePerTraveler={parseFloat(flight.basePrice)}
                        onConfirm={handleConfirm}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default PassengerForm;