export const getUsernameInitials = (username) => {
  return username ? username.substring(0, 2).toUpperCase() : "";
};

export const textLengthLimit = (text, length) => {
  if (!text) return ""; 
  return text.length > length ? text.substring(0, length) + "..." : text;
};
