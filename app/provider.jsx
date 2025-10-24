"use client"

import { UserDetailContext } from '@/context/UserDetailContext';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const Provider = ({ children }) => {
  const { user } = useUser();
  const [userDetail, setUserDetail] = useState(null);

  useEffect(() => {
    if (user) createOrFetchUser();
  }, [user]);

  const createOrFetchUser = async () => {
    try {
      const response = await axios.post('/api/user', {
        name: user?.fullName,
        email: user?.primaryEmailAddress?.emailAddress
      });

      // Store the returned user data in state
      setUserDetail(response.data);
      console.log("User data:", response.data);

    } catch (error) {
      // If user already exists, fetch existing user or log error
      if (error.response && error.response.data?.message === "User already exists") {
        console.log("User already exists, fetching details...");
        // Optional: you could fetch the user details here
        setUserDetail({
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress
        });
      } else {
        console.error("Error creating user:", error);
      }
    }
  };

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      {children}
    </UserDetailContext.Provider>
  );
};

export default Provider;
