import { Box, Button } from "@mui/material";
import { GoogleMap, InfoWindow, Marker, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState } from "react";

function ActivitiesMap({ activities, coordinates }: { activities: any, coordinates: any }) {
    const [selectedActivity, setSelectedActivity] = useState<typeof activities[0]>(null);
    // const [userLocation, setUserLocation] = useState({
    //     lat: 0,
    //     lng: 0,
    // });



    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: 'AIzaSyC0DU0EE254dfgrw_TWxrBgmslLTnFUv4M',
        // libraries: ['places'],
    });

    // useEffect(() => {
    //     if (navigator.geolocation) {
    //         navigator.geolocation.getCurrentPosition((pos) => {
    //             setUserLocation({
    //                 lat: pos.coords.latitude,
    //                 lng: pos.coords.longitude,
    //             });
    //         });
    //     }
    // }, []);

    if (!isLoaded) {
        return <div>Loading google maps...</div>;
    }

    return (
        <Box sx={{ height: '400px', width: '100%', marginTop: 2, marginBottom: 2 }}>
            <Button onClick={() => console.log(coordinates)}>coords</Button>
            <Button onClick={() => console.log(activities)}>activities</Button>
            <GoogleMap
                mapContainerStyle={{ width: '100%', height: '400px' }}
                center={
                    coordinates ? { lat: coordinates.latitude, lng: coordinates.longitude } :
                        { lat: 51.5074, lng: -0.1278 }}
                zoom={10}
            // onLoad={(map) => setMap(map)}
            >
                <Marker position={{ lat: coordinates.latitude, lng: coordinates.longitude }} label="You" />

                {
                    activities && activities.length > 0 && activities.map((activity: any) => (
                        <>
                            <OverlayView
                                position={{ lat: activity.geoCode["latitude"], lng: activity.geoCode["longitude"] }}
                                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}

                            >
                                <div
                                    key={activity["id"]}
                                    onClick={() => setSelectedActivity(activity)}
                                    style={{ cursor: "pointer", textAlign: "center" }}
                                >
                                    <span style={{ fontSize: "32px", filter: "drop-shadow(0 2px 8px #255cc933)" }}>
                                        📍
                                    </span>
                                    {/* <img src={activity.images[0]} /> */}
                                    {activity.pictures && activity.pictures.length > 0 &&
                                        // <img src={activity.pictures[0]} alt={activity.title} style={{ width: "45px", height: "45px", objectFit: "cover" }} />
                                        <img
                                            src={activity.pictures[0]}
                                            alt={activity.title}
                                            style={{
                                                width: "25px",
                                                height: "25px",
                                                objectFit: "cover",
                                                borderRadius: "50%",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                                                border: "2px solid #e0e0e0",
                                                transition: "transform 0.3s, box-shadow 0.3s",
                                                background: "linear-gradient(135deg, #f2f4f7 0%, #e0eaff 100%)",
                                            }}
                                            onMouseOver={e => {
                                                e.currentTarget.style.transform = "scale(1.08)";
                                                e.currentTarget.style.boxShadow = "0 4px 16px rgba(80,110,240,0.14)";
                                            }}
                                            onMouseOut={e => {
                                                e.currentTarget.style.transform = "scale(1)";
                                                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)";
                                            }}
                                        />

                                    }
                                    <div style={{
                                        background: "#fff",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        color: "#000",
                                        width: "max-content",
                                    }}>
                                        {`${activity.name.split(" ").slice(0, 3).join(" ")}`}
                                    </div>
                                    {/* <div style={{
                                        width: "10px",
                                        height: "10px",
                                        background: "#3e99d6ff",
                                        borderRadius: "50%",
                                        margin: "4px auto 0"
                                    }} /> */}
                                </div>
                            </OverlayView>
                            {/* <Marker 
                            key={activity["id"]} 
                            position={{lat: activity.geoCode["latitude"], lng: activity.geoCode["longitude"]}} 
                            // label={activity["name"]} 
                            label={{
                                text: activity.title,
                                color: "#000000",
                                className: 'bg-gray-100',
                                fontSize: "12px",
                                fontWeight: "bold",
                            }}
                            icon={{
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: 10,
                                fillColor: "#4285F4",
                                fillOpacity: 1,
                                strokeWeight: 1,
                            }}
                        /> */}
                        </>
                    ))
                }
                {selectedActivity && (
<InfoWindow
  position={{
    lat: Number(selectedActivity?.geoCode?.latitude ?? 0),
    lng: Number(selectedActivity?.geoCode?.longitude ?? 0),
  }}
  onCloseClick={() => setSelectedActivity(null)}
>
  <div
    style={{
      background: "#fff",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(40,50,60,0.10)",
      padding: "10px",
      minWidth: "180px",
      maxWidth: "230px",
      fontFamily: "Inter, Roboto, Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "6px",
    }}
  >
    {/* Images row */}
    <div
      style={{
        width: "100%",
        display: "flex",
        gap: "4px",
        overflowX: "auto",
        justifyContent: "center",
        marginBottom: "3px"
      }}
    >
      {selectedActivity.pictures?.slice(0, 2).map((src: string, idx: number) => (
        <img
          key={idx}
          src={src}
          alt={selectedActivity.title}
          style={{
            width: "40px",
            height: "40px",
            objectFit: "cover",
            borderRadius: "6px",
            border: "1px solid #eee",
            background: "#fafafd",
          }}
        />
      ))}
    </div>
    {/* Title */}
    <div
      style={{
        fontWeight: 500,
        color: "#247ef2",
        fontSize: "0.98rem",
        textAlign: "center",
        margin: "0 0 2px 0",
        lineHeight: "1.18"
      }}
    >
      {selectedActivity.name.length > 32
        ? selectedActivity.name.slice(0, 29) + "..."
        : selectedActivity.name}
    </div>
    {/* Price */}
    <div
      style={{
        fontWeight: 600,
        color: "#354868",
        fontSize: "0.93rem",
        marginBottom: "2px",
      }}
    >
      {selectedActivity.price &&
        `${selectedActivity.price.amount} ${selectedActivity.price.currencyCode}`}
    </div>
    {/* Description */}
    <div
      style={{
        color: "#4B5A75",
        fontSize: "0.87rem",
        maxHeight: "45px",
        overflow: "hidden",
        marginBottom: "2px",
        textAlign: "left",
      }}
      title={selectedActivity.description?.replace(/(<([^>]+)>)/gi, "")}
      dangerouslySetInnerHTML={{
        __html: selectedActivity.description
          ? selectedActivity.description.replace(/(<([^>]+)>)/gi, "")?.slice(0, 68) + "..."
          : "",
      }}
    />
    {/* Book Button */}
    <a
      href={selectedActivity.bookingLink}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        marginTop: "3px",
        background: "linear-gradient(90deg, #2270e2 0%, #40edc7 100%)",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        padding: "6px 16px",
        fontWeight: 600,
        fontSize: "0.98rem",
        textDecoration: "none",
        boxShadow: "0 1px 4px rgba(40,110,160,0.10)",
        cursor: "pointer",
        textAlign: "center",
      }}
    >
      Book
    </a>
  </div>
</InfoWindow>

                    
                )}
            </GoogleMap>
        </Box>
    )
}
export default ActivitiesMap;