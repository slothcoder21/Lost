import * as Location from 'expo-location';

// Request location permissions and get the current location
export const getCurrentLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }
    
    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

// Get a readable address from coordinates
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const addressResponse = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    
    if (addressResponse && addressResponse.length > 0) {
      const address = addressResponse[0];
      return {
        city: address.city,
        region: address.region,
        country: address.country,
        formattedAddress: `${address.city}, ${address.region}`
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting address:', error);
    return null;
  }
};

// Calculate distance between two coordinates (in kilometers)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
}; 