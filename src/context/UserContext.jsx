import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState([]);
    const [ownedCards, setOwnedCards] = useState({}); // { cardId: quantity }
    const [searchParams, setSearchParams] = useSearchParams();
    const [transactions, setTransactions] = useState([]);
 
    // Sync authModal with searchParams
    const authModal = {
        isOpen: searchParams.has('auth'),
        mode: searchParams.get('auth') || 'login'
    };

    // 1. Initial Load from LocalStorage (Fast)
    useEffect(() => {
        const savedUser = localStorage.getItem('op_user');
        if (savedUser && savedUser !== 'undefined') {
            try {
                setUser(JSON.parse(savedUser));
            } catch (err) {
                console.warn('Invalid user data in localStorage. Clearing corrupt session.');
                localStorage.removeItem('op_user');
            }
        }
        setLoading(false);
    }, []);

    // Helper: Global Auth Response Guard
    const guardAuth = (res) => {
        if (res.status === 401) {
            console.warn("Session invalidated. Force logout initiated.");
            logout();
            return false;
        }
        return res.ok;
    };

    // 2. Fetch Fresh Data from Cloud when user is logged in
    useEffect(() => {
        if (!user) return;

        const fetchCloudData = async () => {
            try {
                const [vaultRes, wishlistRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/api/user/vault`, { credentials: 'include' }),
                    fetch(`${import.meta.env.VITE_API_URL}/api/user/wishlist`, { credentials: 'include' })
                ]);

                if (!guardAuth(vaultRes) || !guardAuth(wishlistRes)) return;

                const vaultData = await vaultRes.json();
                const owned = {};
                vaultData.forEach(item => owned[item.card_id] = item.quantity);
                setOwnedCards(owned);

                const wishlistData = await wishlistRes.json();
                setWishlist(wishlistData);
            } catch (err) {
                console.error("Failed to sync cloud data:", err);
            }
        };

        fetchCloudData();
    }, [user]);

    const toggleWishlist = async (cardId) => {
        const isRemoving = wishlist.includes(cardId);
        const updatedWishlist = isRemoving
            ? wishlist.filter(id => id !== cardId)
            : [...wishlist, cardId];
        
        setWishlist(updatedWishlist);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/wishlist${isRemoving ? `/${cardId}` : ''}`, {
                method: isRemoving ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: isRemoving ? null : JSON.stringify({ card_id: cardId }),
                credentials: 'include'
            });
            guardAuth(res);
        } catch (err) {
            console.error("Wishlist sync error:", err);
        }
    };

    const updateOwnedCard = async (cardId, quantity) => {
        const updatedOwned = { ...ownedCards };
        const isRemoving = quantity <= 0;

        if (isRemoving) {
            delete updatedOwned[cardId];
        } else {
            updatedOwned[cardId] = quantity;
        }
        setOwnedCards(updatedOwned);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/vault${isRemoving ? `/${cardId}` : ''}`, {
                method: isRemoving ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: isRemoving ? null : JSON.stringify({ card_id: cardId, quantity }),
                credentials: 'include'
            });
            guardAuth(res);
        } catch (err) {
            console.error("Vault sync error:", err);
        }
    };

    const toggleOwnedCard = (cardId) => {
        if (ownedCards[cardId]) {
            updateOwnedCard(cardId, 0);
        } else {
            updateOwnedCard(cardId, 1);
        }
    };

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('op_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setTransactions([]);
        setWishlist([]);
        setOwnedCards({});
        localStorage.removeItem('op_user');
        localStorage.removeItem('op_wishlist');
        localStorage.removeItem('op_owned_cards');
        closeAuth();
    };

    const openAuth = (mode = 'login') => setSearchParams({ auth: mode });
    const closeAuth = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('auth');
        setSearchParams(newParams);
    };

    const updateAvatar = async (avatarId) => {
        const updatedUser = { ...user, selectedAvatar: avatarId };
        setUser(updatedUser);
        localStorage.setItem('op_user', JSON.stringify(updatedUser));

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar_id: avatarId }),
                credentials: 'include'
            });
            guardAuth(res);
        } catch (err) {
            console.error("Avatar sync error:", err);
        }
    };

    const updateName = async (newName) => {
        const updatedUser = { ...user, name: newName };
        setUser(updatedUser);
        localStorage.setItem('op_user', JSON.stringify(updatedUser));

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName }),
                credentials: 'include'
            });
            guardAuth(res);
        } catch (err) {
            console.error("Name sync error:", err);
        }
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
            updateName,
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
