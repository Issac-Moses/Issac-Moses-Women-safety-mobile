import { useAuth } from "../contexts/AuthContext";
import useLocation from "../hooks/useLocation";

const useSOSActions = () => {
  const { user } = useAuth();
  const { location, getCurrentLocation } = useLocation();

  // 📍 Share Location
  const shareLocation = async () => {
    if (!user?.emergencyContacts?.length) return;

    const message = `📍 Location: ${
      location
        ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
        : "Unavailable"
    }`;

    user.emergencyContacts.forEach((contact) => {
      console.log(`Location sent to ${contact.name}: ${message}`);
    });
  };

  // 🚨 Alert Contacts
  const alertContacts = () => {
    if (!user?.emergencyContacts?.length) return;

    const message = `🚨 Emergency Alert: ${user.name} needs help!`;
    user.emergencyContacts.forEach((contact) => {
      console.log(`Alert sent to ${contact.name}: ${message}`);
    });
  };

  // 🚀 Combined SOS
  const triggerSOS = () => {
    alertContacts();
    shareLocation();
  };

  return { triggerSOS, alertContacts, shareLocation };
};

export default useSOSActions;
