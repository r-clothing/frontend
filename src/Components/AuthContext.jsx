/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';

import API from '../api.jsx'

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('access');
    
            if (!token) {
                setLoading(false);
    
                return;
            }
    
            try {
                const res = await API.get('acc/me/');

                console.log(res.data);
    
                setUser(res.data);
            }
    
            catch {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
            }

            finally {
                setLoading(false);
            }
        };

        checkUser();
    }, [])

    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout }}>
            { children }
        </AuthContext.Provider>
    )
}
