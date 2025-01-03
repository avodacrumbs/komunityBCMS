import { useEffect, useState } from 'react';

const UseAuth = () => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setPermissions(parsedUser.permissions || []);
    }
  }, []);

  return { user, permissions };
};

export default UseAuth;
