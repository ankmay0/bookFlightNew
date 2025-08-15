import React from "react";
import { Typography, Button, List, ListItem, ListItemAvatar, ListItemText, Avatar, Chip, Box } from "@mui/material";
import { ArrowBack as ArrowBackIcon, Person as PersonIcon } from "@mui/icons-material";
import { Passenger } from "./Types/FlightTypes";
import { NavigateFunction } from "react-router-dom";

interface TravelerDetailsProps {
  passengers: Passenger[];
  navigate: NavigateFunction;
}

const TravelerDetails: React.FC<TravelerDetailsProps> = ({ passengers, navigate }) => {
  return (
    <>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ textTransform: "none", color: "primary.main" }}
        >
          Edit Booking
        </Button>
      </Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          Traveler Details
        </Typography>
        <List>
          {passengers.map((p: Passenger, idx: number) => (
            <ListItem
              key={idx}
              sx={{
                p: 2,
                mb: 1,
                borderRadius: 2,
                bgcolor: idx === 0 ? "primary.light" : "background.paper",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${p.title} ${p.firstName} ${p.lastName}`}
                secondary={
                  <>
                    <Typography variant="body2" component="span" display="block">
                      DOB: {p.dob} • {p.gender}
                    </Typography>
                    {p.passport && (
                      <Typography variant="body2" component="span" display="block">
                        Passport: {p.passport}
                      </Typography>
                    )}
                    {idx === 0 && (
                      <Chip
                        label="Primary Contact"
                        size="small"
                        color="primary"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </>
  );
};

export default TravelerDetails;