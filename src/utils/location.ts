/**
 * Get current user location using browser geolocation API
 * Returns a promise that resolves to location string or null if not available
 */
export const getCurrentLocation = (): Promise<string | null> => {
  return new Promise((resolve) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser");
      resolve(null);
      return;
    }

    // Set options for location request
    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds timeout
      maximumAge: 300000, // 5 minutes cache
    };

    // Request location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Try to get city/location name using reverse geocoding
          const locationString = await reverseGeocode(latitude, longitude);

          if (locationString) {
            console.log("Location detected:", locationString);
            resolve(locationString);
          } else {
            // Fallback to coordinates if reverse geocoding fails
            const coordsString = `${latitude.toFixed(4)}, ${longitude.toFixed(
              4
            )}`;
            console.log("Using coordinates as location:", coordsString);
            resolve(coordsString);
          }
        } catch (error) {
          console.error("Error processing location:", error);
          resolve(null);
        }
      },
      (error) => {
        console.log("Error getting location:", error.message);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation");
            break;
          case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable");
            break;
          case error.TIMEOUT:
            console.log("The request to get user location timed out");
            break;
        }
        resolve(null);
      },
      options
    );
  });
};

/**
 * Reverse geocode coordinates to get location name
 * Using OpenStreetMap Nominatim API (free and no API key required)
 */
const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          "User-Agent": "TrueScholar-App/1.0",
        },
      }
    );

    if (!response.ok) {
      console.log("Reverse geocoding API request failed");
      return null;
    }

    const data = await response.json();

    if (data && data.address) {
      // Try to extract city, state, country in order of preference
      const address = data.address;
      const city =
        address.city || address.town || address.village || address.hamlet;
      const state = address.state;
      const country = address.country;

      // Build location string
      let locationParts = [];
      if (city) locationParts.push(city);
      if (state && state !== city) locationParts.push(state);
      if (country) locationParts.push(country);

      return locationParts.join(", ");
    }

    return null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
};
