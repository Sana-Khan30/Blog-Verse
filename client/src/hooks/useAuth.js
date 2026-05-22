import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Placeholder hook for consuming AuthContext
export default function useAuth() {
  const ctx = useContext(AuthContext);
  return ctx;
}

