import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const fetchSubscriptionStatus = async (token) => {
  const { data } = await axios.get(
    `${API_URL}/api/payment/subscription-status`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};
