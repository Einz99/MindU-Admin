import { createContext, useState } from 'react';

// Create context
export const OpenContext = createContext();

// Create provider
export const OpenProvider = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <OpenContext.Provider value={{ open, setOpen }}>
      {children}
    </OpenContext.Provider>
  );
};