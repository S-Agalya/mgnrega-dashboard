import { useState, useCallback } from 'react';

export const useGeolocation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  const getLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });

          try {
            // Reverse geocoding using OpenStreetMap Nominatim API (free, no key needed)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const districtName = data.address?.district || data.address?.county || "Unknown";
            
            resolve({
              latitude,
              longitude,
              districtName: districtName.trim(),
              address: data.address?.city || data.address?.town || data.address?.village || "Unknown"
            });
          } catch (err) {
            console.error("Error getting district from coordinates:", err);
            setError("Could not determine your district");
            setLoading(false);
            resolve(null);
          }
        },
        (err) => {
          setError(err.message || "Unable to access location");
          setLoading(false);
          resolve(null);
        }
      );
    });
  }, []);

  return { getLocation, loading, error, location };
};
