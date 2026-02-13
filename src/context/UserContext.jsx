import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const savedUser = localStorage.getItem('op_user');
        const savedTransactions = localStorage.getItem('op_transactions');
        
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            // Ensure default avatar
            if (!userData.selectedAvatar) {
                userData.selectedAvatar = 'luffy';
            }
            setUser(userData);
        }
        
        if (savedTransactions) {
            setTransactions(JSON.parse(savedTransactions));
        }
        
        setLoading(false);
    }, []);

    const login = (userData) => {
        // Ensure default avatar for new users
        const userWithDefaults = {
            ...userData,
            selectedAvatar: userData.selectedAvatar || 'luffy',
            joinedDate: userData.joinedDate || new Date().toISOString()
        };
        setUser(userWithDefaults);
        localStorage.setItem('op_user', JSON.stringify(userWithDefaults));
    };

    const logout = () => {
        setUser(null);
        setTransactions([]);
        localStorage.removeItem('op_user');
        localStorage.removeItem('op_transactions');
    };

    const openAuth = (mode = 'login') => setAuthModal({ isOpen: true, mode });
    const closeAuth = () => setAuthModal({ ...authModal, isOpen: false });

    const updateAvatar = (newAvatarUrl, avatarId) => {
        const updatedUser = { ...user, avatar: newAvatarUrl, selectedAvatar: avatarId };
        setUser(updatedUser);
        localStorage.setItem('op_user', JSON.stringify(updatedUser));
    };

    const addTransaction = (transaction) => {
        const newTransaction = {
            ...transaction,
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            userId: user?.email || user?.username
        };
        
        const updatedTransactions = [...transactions, newTransaction];
        setTransactions(updatedTransactions);
        localStorage.setItem('op_transactions', JSON.stringify(updatedTransactions));
        
        return newTransaction;
    };

    const getTransactions = (type) => {
        if (!user) return [];
        
        const userTransactions = transactions.filter(
            t => t.userId === (user.email || user.username)
        );
        
        if (type) {
            return userTransactions.filter(t => t.type === type);
        }
        
        return userTransactions;
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            login, 
            logout, 
            loading, 
            authModal, 
            openAuth, 
            closeAuth, 
            updateAvatar,
            transactions,
            addTransaction,
            getTransactions
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
