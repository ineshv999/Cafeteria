import { createContext } from 'react';

const SessionContext = createContext({
  currentRole: null,
  currentRoleId: 'admin',
  userProfile: null,
});

export default SessionContext;
