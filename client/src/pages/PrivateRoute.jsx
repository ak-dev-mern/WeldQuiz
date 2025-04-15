import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ role, children }) => {
  const { token, role: userRole } = useSelector((state) => state.student);

  if (!token) return <Navigate to="/login" />;
  if (role && userRole !== role) return <Navigate to="*" />;

  return children;
};

export default PrivateRoute;
