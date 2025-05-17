import React, { createContext, useState, useContext } from 'react';

// Create the context
const NotificationContext = createContext();

// Create a provider component
export const NotificationProvider = ({ children }) => {
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);

  // Reset the notification count
  const resetNewNotificationsCount = () => setNewNotificationsCount(0);

  // Increment the notification count
  const incrementNewNotificationsCount = () =>
    setNewNotificationsCount((prevCount) => prevCount + 1);

  return (
    <NotificationContext.Provider
      value={{
        newNotificationsCount,
        resetNewNotificationsCount,
        incrementNewNotificationsCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for accessing the context
export const useNotification = () => useContext(NotificationContext);
