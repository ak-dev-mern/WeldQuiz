import Cookies from "js-cookie";
export const login = (token, role, username,email) => {
  Cookies.set("token", token, { expires: 7, secure: true, sameSite: "Strict" });
  Cookies.set("role", role, { expires: 7, secure: true, sameSite: "Strict" });
  Cookies.set("username", username, {
    expires: 7,
    secure: true,
    sameSite: "Strict",
  });
  Cookies.set("email", email, { expires: 7, secure: true, sameSite: "Strict" });
};

export const checkAuth = () => {
  const token = Cookies.get("token");
  const role = Cookies.get("role");
  return { isAuthenticated: !!token, role };
};

export const logout = () => {
  Cookies.remove("token");
  Cookies.remove("role");
  Cookies.remove("username");
  Cookies.remove("email");
  window.location.href = "/login"; // Redirect to login page
};

export const getToken = () => {
  return Cookies.get("token");
};

export const getRole = () => {
  return Cookies.get("role");
};

export const getUsername = () => {
  return Cookies.get("username");
};
export const getEmail = () => {
  return Cookies.get("email");
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  try {
    // Decode the token safely
    const payload = JSON.parse(atob(token.split(".")[1]));

    // If no expiration claim exists, assume the token is always valid
    if (!payload.exp) return true;

    const expiry = payload.exp * 1000; // Convert to milliseconds

    // Check if the token has expired
    if (Date.now() >= expiry) {
      logout(); // Token expired, clear session
      return false;
    }

    return true;
  } catch (error) {
    console.error("Invalid token:", error);
    logout(); // Remove invalid token
    return false;
  }
};
