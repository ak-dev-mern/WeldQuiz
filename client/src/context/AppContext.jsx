import React, { createContext, useState, useContext } from "react";

// Create a context to manage shared state
const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [isFunctionEnabled, setIsFunctionEnabled] = useState(false);

  const triggerFunction = () => {
    setIsFunctionEnabled(true);
  };

  return (
    <AppContext.Provider value={{ isFunctionEnabled, triggerFunction }}>
      {children}
    </AppContext.Provider>
  );
};
