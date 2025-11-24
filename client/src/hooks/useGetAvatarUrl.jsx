const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return "/default-avatar.png";
  return `${import.meta.env.VITE_SOCKET_URL}${avatarPath}`;
};

export default getAvatarUrl;
