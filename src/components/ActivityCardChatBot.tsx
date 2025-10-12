import React, { useState } from 'react';
import { Paper, Typography, Button, Box } from '@mui/material';

interface Activity {
  id: string;
  name: string;
  shortDescription?: string;
  description: string;
  price: { amount: string; currencyCode: string };
  bookingLink: string;
  pictures: string[];
  geoCode: { latitude: string; longitude: string };
}

interface ActivityCardProps {
  activity: Activity;
  index: number;
  onBookActivity: (bookingLink: string) => void;
}

const stripHtmlTags = (html?: string) => {
  return html ? html.replace(/<[^>]*>/g, '') : 'No description available';
};

const ActivityCardChatBot: React.FC<ActivityCardProps> = ({ activity, index, onBookActivity }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {activity.pictures && activity.pictures.length > 0 && (
        <img
          src={activity.pictures[0]}
          alt={activity.name}
          style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }}
        />
      )}
      <Typography variant="h6" fontWeight={600}>
        {activity.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {expanded ? stripHtmlTags(activity.description) : `${stripHtmlTags(activity.description).split(" ").slice(0, 20).join(" ")}...`}
      </Typography>
      <Button
        size="small"
        onClick={() => setExpanded(!expanded)}
        sx={{ textTransform: "none", mt: 1 }}
      >
        {expanded ? "Show Less" : "Read More"}
      </Button>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Typography variant="body1" fontWeight={600}>
          {activity.price.amount} {activity.price.currencyCode}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onBookActivity(activity.bookingLink)}
          aria-label={`Book activity ${activity.name}`}
        >
          Book Now
        </Button>
      </Box>
    </Paper>
  );
};

export default ActivityCardChatBot;