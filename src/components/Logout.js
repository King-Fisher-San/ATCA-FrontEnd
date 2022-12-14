import { AuthContext } from 'src/Contexts/AuthContext';
import React, { useContext } from 'react';

const Logout = () => {
  const { logoutUser } = useContext(AuthContext);
  logoutUser();
  return <div></div>;
};

export default Logout;
