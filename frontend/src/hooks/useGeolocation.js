import { useState, useCallback } from 'react';

export const useGeolocation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  const findDistrictInAddress = (addressString, availableDistricts) => {
    if (!addressString || !availableDistricts) return null;

    const lowerAddress = addressString.toLowerCase();

    // Check each district from database
    for (const district of availableDistricts) {
      const districtName = district.district_name.toLowerCase();
      
      // Check if district name appears anywhere in the address
      if (lowerAddress.includes(districtName)) {
        return district.district_name;
      }
    }

    return null;
  };

  const getLocation = useCallback(async (availableDistricts) => {
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
            // Reverse geocoding using OpenStreetMap Nominatim API
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
              {
                headers: {
                  'Accept': 'application/json',
                }
              }
            );
            const data = await response.json();

            // Build complete address string from all fields
            const addressParts = [];
            if (data.address) {
              const address = data.address;
              // Add all address components
              if (address.village) addressParts.push(address.village);
              if (address.suburb) addressParts.push(address.suburb);
              if (address.town) addressParts.push(address.town);
              if (address.city) addressParts.push(address.city);
              if (address.district) addressParts.push(address.district);
              if (address.county) addressParts.push(address.county);
              if (address.state_district) addressParts.push(address.state_district);
              if (address.state) addressParts.push(address.state);
              if (address.region) addressParts.push(address.region);
            }

            const completeAddress = addressParts.join(', ');
            console.log("Complete address:", completeAddress);

            // Search for district name in the complete address
            const matchedDistrict = findDistrictInAddress(completeAddress, availableDistricts);

            const locationResult = {
              latitude,
              longitude,
              completeAddress: completeAddress,
              matchedDistrict: matchedDistrict,
              rawData: data.address
            };

            console.log("Location result:", locationResult);
            setLoading(false);
            resolve(locationResult);

          } catch (err) {
            console.error("Error getting district from coordinates:", err);
            setError("Could not determine your district");
            setLoading(false);
            resolve(null);
          }
        },
        (err) => {
          let errorMessage = "Unable to access location";
          
          if (err.code === 1) {
            errorMessage = "Permission denied. Please enable location access in your browser settings.";
          } else if (err.code === 2) {
            errorMessage = "Position unavailable. Try again or check your internet connection.";
          } else if (err.code === 3) {
            errorMessage = "Request timeout. Please try again.";
          }
          
          setError(errorMessage);
          setLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  return { getLocation, loading, error, location };
};
