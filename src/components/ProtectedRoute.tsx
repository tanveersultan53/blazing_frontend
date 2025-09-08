import { useNavigate } from "react-router-dom";
import { useEffect } from "react";


const WithAuth = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    return !!token; // Returns true if token exists, false otherwise
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  if (!isAuthenticated()) {
    return null;
  }

  return children;
};

export default WithAuth;
