import { useState, useEffect } from 'react';
import { User, getCurrentUser } from '../api/auth';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
}

export const useAuth = () => {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        loading: true,
    });

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setState({ user: null, isAuthenticated: false, loading: false });
            return;
        }

        getCurrentUser()
            .then((user) => {
                setState({ user, isAuthenticated: true, loading: false });
            })
            .catch(() => {
                setState({ user: null, isAuthenticated: false, loading: false });
            });
    }, []);

    return state;
}; 