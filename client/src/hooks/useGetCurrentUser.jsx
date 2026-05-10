import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const useGetCurrentUser = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/user/me`, {
          withCredentials: true,
        });
        dispatch(setUserData(result.data.user || result.data));
      } catch (error) {
        console.error(
          "Error fetching current user:",
          error.response?.data || error.message,
        );
        dispatch(setUserData(null));
      }
    };
    getCurrentUser();
  }, [dispatch]);
};

export default useGetCurrentUser;
