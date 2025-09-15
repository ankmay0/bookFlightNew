import React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Stack,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import { useNavigate } from "react-router-dom";

const navItems = [
  "Search Flight",
  "Hotel Search",
  "Car Rental",
  "Packages",
  "Activities",
  "Check Booking",
];

const Navbar: React.FC = () => {
  const [selected, setSelected] = React.useState("Search Flight");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isMobile = useMediaQuery("(max-width:1000px)");
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (item: string) => {
    setSelected(item);
    // Routing logic
    if (item === "Search Flight") navigate("/");
    // Add other routes here when available
    else if (item === "Hotel Search") navigate("/hotels");
    else if (item === "Car Rental") navigate("/cars");
    else if (item === "Packages") navigate("/packages");
    else if (item === "Activities") navigate("/activities");
    else if (item === "Check Booking") navigate("/manage-reservation");
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <Typography
        variant="h6"
        sx={{ my: 2, textAlign: "center", fontWeight: "bold", color: "#1976d2" }}
      >
        BookFlight
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton onClick={() => handleNavClick(item)}>
              <ListItemText
                primary={item}
                primaryTypographyProps={{
                  sx: {
                    fontWeight: selected === item ? 600 : 400,
                    color: selected === item ? "black" : "gray",
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Stack spacing={1} sx={{ p: 2 }}>
        <Button
          variant="text"
          sx={{
            color: "black",
            textTransform: "none",
            fontSize: "16px",
            fontWeight: 500,
          }}
        >
          Sign In
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            textTransform: "none",
            fontSize: "16px",
            fontWeight: 500,
            borderRadius: "8px",
            "&:hover": { backgroundColor: "#115293" },
          }}
        >
          Sign Up
        </Button>
      </Stack>
    </Box>
  );

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          px: 3,
        }}
      >
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton edge="start" color="inherit" sx={{ mr: 1 }} onClick={() => navigate("/")}>
              <FlightTakeoffIcon sx={{ color: "#1976d2", fontSize: 30 }} />
            </IconButton>

            <Typography
              variant="h5"
              sx={{
                color: "black",
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}
            >
              BookFlight
            </Typography>
          </Box>

          {/* Center nav for desktop */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
              <Stack direction="row" spacing={4}>
                {navItems.map((item) => (
                  <Button
                    key={item}
                    onClick={() => handleNavClick(item)}
                    disableRipple
                    sx={{
                      color: selected === item ? "black" : "gray",
                      fontWeight: selected === item ? 600 : 400,
                      textTransform: "none",
                      fontSize: "16px",
                      position: "relative",
                      "&::after": {
                        content: '""',
                        display: "block",
                        width: selected === item ? "100%" : "0",
                        height: "2px",
                        background: "#1976d2",
                        transition: "width 0.3s",
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                      },
                      "&:hover": {
                        color: "black",
                        "&::after": { width: "100%" },
                      },
                    }}
                  >
                    {item}
                  </Button>
                ))}
              </Stack>
            </Box>
          )}

          {/* Sign In / Sign Up desktop buttons */}
          {!isMobile && (
            <Stack direction="row" spacing={2}>
              <Button
                variant="text"
                sx={{
                  color: "black",
                  textTransform: "none",
                  fontSize: "16px",
                  fontWeight: 500,
                  "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.04)" },
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#1976d2",
                  color: "white",
                  textTransform: "none",
                  fontSize: "16px",
                  fontWeight: 500,
                  borderRadius: "8px",
                  px: 2.5,
                  "&:hover": { backgroundColor: "#115293" },
                }}
              >
                Sign Up
              </Button>
            </Stack>
          )}

          {/* Mobile toggle button */}
          {isMobile && (
            <IconButton onClick={handleDrawerToggle} color="inherit">
              <MenuIcon sx={{ color: "#1976d2", fontSize: 28 }} />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
