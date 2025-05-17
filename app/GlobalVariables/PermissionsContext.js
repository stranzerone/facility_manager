import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a context for permissions
const PermissionsContext = createContext();

// Create a provider component
export const PermissionsProvider = ({ children }) => {
  const [ppmAsstPermissions, setPpmAsstPermissions] = useState([]);
  const [complaintPermissions, setComplaintPermissions] = useState([]);
  const [instructionPermissions, setInstructionPermissions] = useState([]);
  const [issueRequestPermission, setIssueRequestPermission] = useState([]);
  const [ppmWorkorder,setPpmWorkorder] = useState([])
 const [complaintFilter,setComplaintFilter]  = useState("Open")
  const loadPermissions = async () => {
    try {
      const savedPermissions = await AsyncStorage.getItem('userInfo');
     
      if (savedPermissions) {
        const userInfo = JSON.parse(savedPermissions); // Parse the stored string into an object

        if (userInfo.permissions) {
          // const filteredPermissions = userInfo.permissions
          //   .filter(item => item.startsWith('PPM_WOV.'))
          //   .map(item => item.split('.')[1]);

          //   console.log(filteredPermissions,"filteredpermissions1")
          // setPpmAsstPermissions(filteredPermissions);

          // const filteredComplaintPermissions = userInfo.permissions
          //   .filter(item => item.startsWith('COM.'))
          //   .map(item => item.split('.')[1]);
          //   console.log(filteredComplaintPermissions,"filteredpermissions2")

          // setComplaintPermissions(filteredComplaintPermissions);

          // const filteredInstructionPermissions = userInfo.permissions
          //   .filter(item => item.startsWith('PPM_IST.'))
          //   .map(item => item.split('.')[1]);

          //   console.log(filteredInstructionPermissions,"filteredpermissions3")

            
          // setInstructionPermissions(filteredInstructionPermissions);
        }
      }
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  return (
    <PermissionsContext.Provider
      value={{
        ppmAsstPermissions,
        complaintPermissions,
        instructionPermissions,
        complaintFilter,
        ppmWorkorder,
        issueRequestPermission,
        setComplaintFilter,
        setPpmAsstPermissions,
        setComplaintPermissions,
        setInstructionPermissions,
        loadPermissions,
        setPpmWorkorder,
        setIssueRequestPermission,
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
