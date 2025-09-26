import { Box, Button } from "@mui/material";
import { GoogleMap, InfoWindow, Marker, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState } from "react";

function ActivitiesMap({activities, coordinates}: {activities: any, coordinates: any}) {
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

    if(!isLoaded) {
        return <div>Loading google maps...</div>;
    }

  return (
    <Box sx={{ height: '400px', width: '100%', marginTop: 2, marginBottom: 2 }}>
        <Button onClick={()=>console.log(coordinates)}>coords</Button>
        <Button onClick={()=>console.log(activities)}>activities</Button>
        <GoogleMap
            mapContainerStyle={{width: '100%', height: '400px'}}
            center={
                coordinates ? {lat: coordinates.latitude, lng: coordinates.longitude} : 
                {lat: 51.5074, lng: -0.1278}}
            zoom={10}
            // onLoad={(map) => setMap(map)}
        >
            <Marker position={{ lat: coordinates.latitude, lng: coordinates.longitude }} label="You" />

            {
                activities && activities.length > 0 && activities.map((activity: any) => (
                    <>
                    <OverlayView
                        position={{lat: activity.geoCode["latitude"], lng: activity.geoCode["longitude"]}}
                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                        
                    >
                        <div
                            key={activity["id"]}
                            onClick={() => setSelectedActivity(activity)} 
                            style={{ cursor: "pointer", textAlign: "center" }}
                        >
                            <img src={activity.images[0]} />
                            <div style={{
                                background: "#fff",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontWeight: "bold",
                                color: "#000",
                                width: "max-content",
                            }}>
                                {`${activity.title.split(" ").slice(0, 3).join(" ")}...`}
                            </div>
                            <div style={{
                                width: "10px",
                                height: "10px",
                                background: "#3e99d6ff",
                                borderRadius: "50%",
                                margin: "4px auto 0"
                            }} />
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
                        lat: parseFloat(selectedActivity?.geoCode?.latitude ?? '0'),
                        lng: parseFloat(selectedActivity.longitude),
                    }}
                    onCloseClick={() => setSelectedActivity(null)}
                >
                <div>
                    <h3>{selectedActivity.title}</h3>
                    <p>{selectedActivity.description || "No description available"}</p>
                </div>
                </InfoWindow>
            )}
        </GoogleMap>
    </Box>
  )
}
export default ActivitiesMap;