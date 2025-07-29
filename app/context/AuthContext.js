'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser } from '../lib/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({loading: true});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            try {
                const data = await getCurrentUser();
                if (data?.user && !data.error) {
                    setUser({
                        ...data.user
                    });
                }
                else {
                    setUser(null)
                }
            } catch (e) {
                console.error('Failed to fetch current user:', e);
            } finally {
                setLoading(false);
            }
        }
        loadUser();
    }, []);
    
    // useEffect(() => {
    //     console.log('AuthContext user updated:', user);
    // }, [user]);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
