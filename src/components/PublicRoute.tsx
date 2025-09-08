/**
 * Higher-order component that checks if the user is authenticated before rendering the wrapped component.
 * If the user is not authenticated, it renders the children.
 *
 * @param {WithoutAuthTypes} props - The props for the component.
 * @returns {React.ReactNode} - The wrapped component or a redirect to the login page.
 */
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "@/redux/store";

const WithoutAuth = (props: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);

  const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    return !!token; // Returns true if token exists, false otherwise
  };

  useEffect(() => {
    if (isAuthenticated()) {
      if (currentUser?.is_superuser) {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [navigate, currentUser]);

  if (isAuthenticated() && currentUser?.is_superuser) {
    return <></>; // Render nothing while redirecting
  }

  return <>{props.children}</>;
};

export default WithoutAuth;
