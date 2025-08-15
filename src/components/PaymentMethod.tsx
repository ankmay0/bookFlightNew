import React, { useState } from "react";
import {
  Box,
  Card,
  Stack,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Button,
  InputAdornment,
  useTheme,
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { styled } from "@mui/material/styles";

interface PaymentMethodProps {
  onConfirmBooking: (
    payment: {
      cardName: string;
      cardNumber: string;
      expiryMonth: string;
      expiryYear: string;
      cvv: string;
    },
    termsAccepted: boolean
  ) => Promise<void>;
  loading: boolean;
}

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
}));

const PaymentMethod: React.FC<PaymentMethodProps> = ({
  onConfirmBooking,
  loading,
}) => {
  const theme = useTheme();
  const [payment, setPayment] = useState({
    cardName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });
  const [paymentErrors, setPaymentErrors] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(" ").slice(0, 19) : digits;
  };

  const handlePaymentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "cardNumber") {
      setPayment({ ...payment, [name]: formatCardNumber(value) });
    } else if (name === "cvv") {
      setPayment({
        ...payment,
        [name]: value.replace(/\D/g, "").slice(0, 4),
      });
    } else {
      setPayment({ ...payment, [name]: value });
    }
  };

  const validatePayment = () => {
    const errors = { cardName: "", cardNumber: "", expiry: "", cvv: "" };
    let isValid = true;

    if (!payment.cardName.trim()) {
      errors.cardName = "Cardholder name is required";
      isValid = false;
      console.log("Validation failed: Cardholder name is empty");
    }

    const cleanCardNumber = payment.cardNumber.replace(/\s/g, "");
    if (!cleanCardNumber || cleanCardNumber.length !== 16) {
      errors.cardNumber = "Valid 16-digit card number is required";
      isValid = false;
      console.log("Validation failed: Invalid card number");
    }

    if (!payment.expiryMonth || !payment.expiryYear) {
      errors.expiry = "Expiry date is required";
      isValid = false;
      console.log("Validation failed: Expiry date missing");
    } else {
      const expiryDate = new Date(
        parseInt(payment.expiryYear),
        parseInt(payment.expiryMonth) - 1
      );
      if (expiryDate < new Date()) {
        errors.expiry = "Card has expired";
        isValid = false;
        console.log("Validation failed: Card has expired");
      }
    }

    if (!payment.cvv || payment.cvv.length < 3 || payment.cvv.length > 4) {
      errors.cvv = "Valid CVV (3-4 digits) required";
      isValid = false;
      console.log("Validation failed: Invalid CVV");
    }

    setPaymentErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    try {
      if (validatePayment()) {
        console.log("Validation passed, calling onConfirmBooking");
        await onConfirmBooking(payment, termsAccepted);
      } else {
        console.log("Validation failed, not proceeding");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Payment Information
      </Typography>

      <StyledCard>
        <Stack spacing={3}>
          <TextField
            label="Cardholder Name"
            name="cardName"
            value={payment.cardName}
            onChange={handlePaymentChange}
            fullWidth
            error={!!paymentErrors.cardName}
            helperText={paymentErrors.cardName}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CreditCardIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiInputBase-root": { padding: "12px 16px", height: "48px" },
              "& .MuiOutlinedInput-root": {
                borderRadius: theme.shape.borderRadius * 2,
              },
            }}
          />

          <TextField
            label="Card Number"
            name="cardNumber"
            value={payment.cardNumber}
            onChange={handlePaymentChange}
            fullWidth
            inputProps={{ maxLength: 19 }}
            error={!!paymentErrors.cardNumber}
            helperText={paymentErrors.cardNumber}
            variant="outlined"
            size="small"
            placeholder="0000 0000 0000 0000"
            sx={{
              "& .MuiInputBase-root": { padding: "12px 16px", height: "48px" },
              "& .MuiOutlinedInput-root": {
                borderRadius: theme.shape.borderRadius * 2,
              },
            }}
          />

          <Grid container spacing={2}>
            <Grid item xs={4} sx={{ minWidth: 0, padding: theme.spacing(1) }}>
              <FormControl
                fullWidth
                error={!!paymentErrors.expiry}
                size="small"
                sx={{
                  "& .MuiInputBase-root": { padding: "12px 16px", height: "48px" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: theme.shape.borderRadius * 2,
                  },
                }}
              >
                <InputLabel id="expiry-month-label" shrink={!!payment.expiryMonth}>
                  Month
                </InputLabel>
                <Select
                  labelId="expiry-month-label"
                  name="expiryMonth"
                  value={payment.expiryMonth}
                  onChange={(e) =>
                    setPayment({
                      ...payment,
                      expiryMonth: e.target.value as string,
                    })
                  }
                  label="Month"
                  sx={{ fontSize: "0.875rem" }}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem
                      key={i + 1}
                      value={(i + 1).toString().padStart(2, "0")}
                      sx={{ fontSize: "0.875rem" }}
                    >
                      {(i + 1).toString().padStart(2, "0")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4} sx={{ minWidth: 0, padding: theme.spacing(1) }}>
              <FormControl
                fullWidth
                error={!!paymentErrors.expiry}
                size="small"
                sx={{
                  "& .MuiInputBase-root": { padding: "12px 16px", height: "48px" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: theme.shape.borderRadius * 2,
                  },
                }}
              >
                <InputLabel id="expiry-year-label" shrink={!!payment.expiryYear}>
                  Year
                </InputLabel>
                <Select
                  labelId="expiry-year-label"
                  name="expiryYear"
                  value={payment.expiryYear}
                  onChange={(e) =>
                    setPayment({
                      ...payment,
                      expiryYear: e.target.value as string,
                    })
                  }
                  label="Year"
                  sx={{ fontSize: "0.875rem" }}
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = (new Date().getFullYear() + i).toString();
                    return (
                      <MenuItem
                        key={year}
                        value={year}
                        sx={{ fontSize: "0.875rem" }}
                      >
                        {year}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4} sx={{ minWidth: 0, padding: theme.spacing(1) }}>
              <TextField
                label="CVV"
                name="cvv"
                value={payment.cvv}
                onChange={handlePaymentChange}
                fullWidth
                inputProps={{ maxLength: 4 }}
                error={!!paymentErrors.cvv}
                helperText={paymentErrors.cvv}
                variant="outlined"
                size="small"
                placeholder="123"
                sx={{
                  "& .MuiInputBase-root": { padding: "12px 16px", height: "48px" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: theme.shape.borderRadius * 2,
                  },
                }}
              />
            </Grid>
            {!!paymentErrors.expiry && (
              <Grid item xs={12}>
                <FormHelperText error>{paymentErrors.expiry}</FormHelperText>
              </Grid>
            )}
          </Grid>

          <FormControlLabel
            control={
              <Checkbox
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                I agree to the{" "}
                <a href="/terms" style={{ color: theme.palette.primary.main }}>
                  terms and conditions
                </a>{" "}
                and{" "}
                <a href="/privacy" style={{ color: theme.palette.primary.main }}>
                  privacy policy
                </a>
              </Typography>
            }
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={loading || !termsAccepted}
            sx={{ py: 1.5, fontWeight: 700 }}
          >
            {loading ? "Processing..." : "Complete Booking"}
          </Button>
        </Stack>
      </StyledCard>
    </Box>
  );
};

export default PaymentMethod;