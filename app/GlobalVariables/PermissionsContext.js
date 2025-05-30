import { createContext, useContext, useState } from 'react';

// Create a context for permissions
const PermissionsContext = createContext();

// Create a provider component
export const PermissionsProvider = ({ children }) => {
  const [ppmAsstPermissions, setPpmAsstPermissions] = useState([]);
  const [complaintPermissions, setComplaintPermissions] = useState([]);
  const [instructionPermissions, setInstructionPermissions] = useState([]);
  const [issueRequestPermission, setIssueRequestPermission] = useState([]);
  const [ppmWorkorder, setPpmWorkorder] = useState([]);
  const [nightMode, setNightMode] = useState();
  const [complaintFilter, setComplaintFilter] = useState("Open");
  const [queueLength,setQueueLength] = useState(0)
  const [syncStatus,setSyncStatus]  = useState(false)
  // 🆕 Queue status state


  return (
    <PermissionsContext.Provider
      value={{
        ppmAsstPermissions,
        complaintPermissions,
        instructionPermissions,
        complaintFilter,
        ppmWorkorder,
        issueRequestPermission,
        nightMode,
        queueLength,
        syncStatus,
        setSyncStatus,
        setQueueLength,
        setComplaintFilter,
        setPpmAsstPermissions,
        setComplaintPermissions,
        setInstructionPermissions,
        setPpmWorkorder,
        setIssueRequestPermission,
        setNightMode
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

// Custom hook to use the Permissions context
export const usePermissions = () => {
  return useContext(PermissionsContext);
};
