import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { consumeAuthNext } from '../utils/authRedirect';

export function AuthReturnHandler() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || !user) return;

    const next = consumeAuthNext();
    if (!next) return;

    const current = `${location.pathname}${location.search}`;
    if (current !== next) {
      navigate(next, { replace: true });
    }
  }, [loading, user, location.pathname, location.search, navigate]);

  return null;
}
