import React from "react";
import { Box, Card, Stack, Typography } from "@mui/material";
import { Email as EmailIcon, Phone as PhoneIcon } from "@mui/icons-material";
import { Contact } from "./Types/FlightTypes";

interface ContactInformationProps {
  contact: Contact;
}

const ContactInformation: React.FC<ContactInformationProps> = ({ contact }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        Contact Information
      </Typography>
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack spacing={2}>
          <Box display="flex" alignItems="center">
            <EmailIcon color="primary" sx={{ mr: 2 }} />
            <Typography>{contact.email}</Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <PhoneIcon color="primary" sx={{ mr: 2 }} />
            <Typography>
              {contact.countryCode} {contact.phone}
            </Typography>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
};

export default ContactInformation;