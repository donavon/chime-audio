import React, { useContext } from 'react';
import {
  useChimeDevicesInternal,
  MediaDevicesResults,
} from './useChimeDevicesInternal';

const ChimeDevicesContext = React.createContext<MediaDevicesResults | null>(
  null
);

export const ChimeDevicesProvider: React.FC = ({ children }) => {
  const value = useChimeDevicesInternal();

  return (
    <ChimeDevicesContext.Provider value={value}>
      {children}
    </ChimeDevicesContext.Provider>
  );
};

const throwDevicesError = () => {
  throw new Error('useChimeDevices must be a child of <ChimeDevicesProvider>');
};

export const useChimeDevices = () =>
  useContext(ChimeDevicesContext) || throwDevicesError();
