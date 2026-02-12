import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

    useEffect(() => {
        const savedUser = localStorage.getItem('op_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('op_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('op_user');
    };

    const openAuth = (mode = 'login') => setAuthModal({ isOpen: true, mode });
    const closeAuth = () => setAuthModal({ ...authModal, isOpen: false });

    const updateAvatar = (newAvatarUrl, avatarId) => {
        const updatedUser = { ...user, avatar: newAvatarUrl, selectedAvatar: avatarId };
        setUser(updatedUser);
        localStorage.setItem('op_user', JSON.stringify(updatedUser));
    };

    return (
        <UserContext.Provider value={{ user, login, logout, loading, authModal, openAuth, closeAuth, updateAvatar }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
