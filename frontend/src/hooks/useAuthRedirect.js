import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./useAuth";
// this file is used bez when we are logged in and try to go to /signup or /login it shouls go back to the previous page

export const useAuthRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Priority 1: 'from' param in URL (e.g., ?from=/cart)
      // Priority 2: Homepage "/"
      const destination = searchParams.get("from") || "/";

      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, searchParams]);

  return { isAuthenticated, isLoading, user };
};
