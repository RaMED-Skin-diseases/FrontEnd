import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [predictions, setPredictions] = useState([]);

  const addPrediction = (newPrediction) => {
    setPredictions([...predictions, newPrediction]);
  };

  return (
    <UserContext.Provider value={{ predictions, addPrediction }}>
      {children}
    </UserContext.Provider>
  );
};
