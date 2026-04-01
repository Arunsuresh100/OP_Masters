import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState([]);
    const [ownedCards, setOwnedCards] = useState({}); // { cardId: quantity }
    const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const savedUser = localStorage.getItem('op_user');
        const savedTransactions = localStorage.getItem('op_transactions');
        const savedWishlist = localStorage.getItem('op_wishlist');
        const savedOwned = localStorage.getItem('op_owned_cards');
        
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            if (!userData.selectedAvatar) {
                userData.selectedAvatar = 'luffy';
            }
            setUser(userData);
        }
        
        if (savedTransactions) {
            setTransactions(JSON.parse(savedTransactions));
        }

        if (savedWishlist) {
            setWishlist(JSON.parse(savedWishlist));
        }

        if (savedOwned) {
            setOwnedCards(JSON.parse(savedOwned));
        }
        
        setLoading(false);
    }, []);

    const toggleWishlist = (cardId) => {
        const updatedWishlist = wishlist.includes(cardId)
            ? wishlist.filter(id => id !== cardId)
            : [...wishlist, cardId];
        
        setWishlist(updatedWishlist);
        localStorage.setItem('op_wishlist', JSON.stringify(updatedWishlist));
    };

    const updateOwnedCard = (cardId, quantity) => {
        const updatedOwned = { ...ownedCards };
        if (quantity <= 0) {
            delete updatedOwned[cardId];
        } else {
            updatedOwned[cardId] = quantity;
        }
        setOwnedCards(updatedOwned);
        localStorage.setItem('op_owned_cards', JSON.stringify(updatedOwned));
    };

    const toggleOwnedCard = (cardId) => {
        if (ownedCards[cardId]) {
            updateOwnedCard(cardId, 0);
        } else {
            updateOwnedCard(cardId, 1);
        }
    };

    const login = (userData) => {
        // Ensure default avatar ID for new users (not URL)
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
        setWishlist([]);
        setOwnedCards({});
        localStorage.removeItem('op_user');
        localStorage.removeItem('op_transactions');
        localStorage.removeItem('op_wishlist');
        localStorage.removeItem('op_owned_cards');
    };

    const openAuth = (mode = 'login') => setAuthModal({ isOpen: true, mode });
    const closeAuth = () => setAuthModal({ ...authModal, isOpen: false });

    const updateAvatar = (avatarId) => {
        const updatedUser = { ...user, selectedAvatar: avatarId };
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
            getTransactions,
            wishlist,
            toggleWishlist,
            ownedCards,
            updateOwnedCard,
            toggleOwnedCard
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
