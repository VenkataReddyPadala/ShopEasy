import { useGetMeQuery } from "../services/userApi";

export const useAuth = () => {
  const { data, isLoading, isError } = useGetMeQuery();

  const user = data?.data;
  const isAuthenticated = data?.status === "success" && !!user;
  return { isAuthenticated, user, isLoading, isError };
};
