import React, { useEffect, useRef, useState } from "react";
import mapimg from "./map.svg";

const MapComponent = () => {
  const mapRef = useRef(null); // Reference for the map container
  const mapInstanceRef = useRef(null); // Keep track of the Leaflet map instance
  const [radius, setRadius] = useState(1000); // Default radius in meters

  // Hardcoded location points
  const locations = [
    {
      lat: 17.8177412,
      lng: 83.2111287,
      title: "Location 1",
      description: "This is location 1",
    },
    {
      lat: 17.8197412,
      lng: 83.2131287,
      title: "Location 3",
      description: "This is location 3",
    },
  ];

  // Haversine formula to calculate the distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Distance in meters
  };

  useEffect(() => {
    if (mapInstanceRef.current) return; // Prevent reinitialization of the map

    // Load Leaflet JS and CSS
    const leafletCSS = document.createElement("link");
    leafletCSS.rel = "stylesheet";
    leafletCSS.href = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css";
    document.head.appendChild(leafletCSS);

    const leafletJS = document.createElement("script");
    leafletJS.src = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js";
    leafletJS.onload = () => {
      // Initialize the map
      const map = L.map(mapRef.current).setView([17.8177412, 83.2111287], 13);
      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Create custom icon for user location (red)
      const userIcon = L.icon({
        iconUrl: mapimg,
        iconSize: [35, 41],
        iconAnchor: [12, 41],
      });

      // Create custom icon for other locations (blue)
      const locationIcon = L.icon({
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          // Add user marker with custom red icon
          const userMarker = L.marker([userLat, userLng], {
            icon: userIcon,
          }).addTo(map);
          userMarker.bindPopup("Your Location").openPopup();

          // Add initial range circle
          let rangeCircle = L.circle([userLat, userLng], {
            color: "blue",
            fillColor: "blue",
            fillOpacity: 0.2,
            radius: radius,
          }).addTo(map);

          // Function to update markers within the range
          const updateMarkers = () => {
            // Remove existing markers and circle
            map.eachLayer((layer) => {
              if (layer instanceof L.Marker && layer !== userMarker) {
                map.removeLayer(layer);
              }
              if (layer instanceof L.Circle) {
                map.removeLayer(layer);
              }
            });

            // Add updated circle
            rangeCircle = L.circle([userLat, userLng], {
              color: "blue",
              fillColor: "blue",
              fillOpacity: 0.2,
              radius: radius,
            }).addTo(map);

            // Add markers within the range with blue icon
            locations.forEach((location) => {
              const distance = calculateDistance(
                userLat,
                userLng,
                location.lat,
                location.lng
              );
              if (distance <= radius) {
                const marker = L.marker([location.lat, location.lng], {
                  icon: locationIcon,
                }).addTo(map);
                marker.bindPopup(
                  `<strong>${location.title}</strong><br>${location.description}`
                );
              }
            });
          };

          // Initial marker update
          updateMarkers();

          // Update markers when radius changes
          const radiusInput = document.getElementById("radiusInput");
          if (radiusInput) {
            radiusInput.value = radius; // Set initial radius value
            radiusInput.addEventListener("input", (e) => {
              const newRadius = parseInt(e.target.value, 10) || 1000;
              setRadius(newRadius);
              updateMarkers();
            });
          }
        });
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    };

    document.body.appendChild(leafletJS);

    return () => {
      // Cleanup function to remove Leaflet scripts and map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      document.head.removeChild(leafletCSS);
      document.body.removeChild(leafletJS);
    };
  }, [radius]);

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4 text-center">
        Map with Range Filtering
      </h3>
      <div
        id="map"
        ref={mapRef}
        style={{
          width: "100vw",
          height: "90vh",
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        }}></div>
      <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
        <input
          id="radiusInput"
          type="number"
          placeholder="Enter search radius (meters)"
          className="w-full sm:w-auto p-2 border rounded shadow focus:outline-none"
          defaultValue={radius}
        />
      </div>
    </div>
  );
};

export default MapComponent;
