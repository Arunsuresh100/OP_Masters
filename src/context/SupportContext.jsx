import React, { createContext, useContext, useState, useEffect } from 'react';

const SupportContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const SupportProvider = ({ children }) => {
    const [tickets, setTickets] = useState([]);

    // 1. Fetch Tickets from Cloud
    const refreshTickets = async () => {
        try {
            const secret = import.meta.env.VITE_ADMIN_SECRET || 'Op_masters@100';
            const res = await fetch(`${API_BASE}/api/support/tickets?admin_secret=${secret}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
            }
        } catch (err) {
            console.error("Failed to fetch tickets:", err);
        }
    };

    useEffect(() => {
        refreshTickets();
        // Polling for new messages every 30 seconds
        const interval = setInterval(refreshTickets, 30000);
        return () => clearInterval(interval);
    }, []);

    // Create a new ticket (User auth via cookie — no admin_secret)
    const createTicket = async (ticketData) => {
        try {
            const res = await fetch(`${API_BASE}/api/support/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticketData),
                credentials: 'include'
            });
            if (res.ok) {
                await refreshTickets();
                return true;
            }
            // If cookie auth fails, fall back with admin_secret but flag as user
            const secret = import.meta.env.VITE_ADMIN_SECRET || 'Op_masters@100';
            const res2 = await fetch(`${API_BASE}/api/support/tickets?admin_secret=${secret}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...ticketData, is_admin: false }),
                credentials: 'include'
            });
            if (res2.ok) { await refreshTickets(); return true; }
        } catch (err) {
            console.error("Failed to create ticket:", err);
        }
        return false;
    };

    // Get tickets for a specific user (Already filtered by API for non-admins)
    const getUserTickets = (userEmail) => {
        return tickets;
    };

    // Get all tickets (Already handled by API for admins)
    const getAllTickets = () => {
        return tickets;
    };

    // Update ticket status
    const updateTicketStatus = async (ticketId, newStatus) => {
        try {
            const secret = import.meta.env.VITE_ADMIN_SECRET || 'Op_masters@100';
            const res = await fetch(`${API_BASE}/api/support/tickets/${ticketId}?admin_secret=${secret}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    status: newStatus,
                    is_admin: true 
                }),
                credentials: 'include'
            });
            if (res.ok) refreshTickets();
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    // Update ticket priority
    const updateTicketPriority = async (ticketId, newPriority) => {
        try {
            const secret = import.meta.env.VITE_ADMIN_SECRET || 'Op_masters@100';
            const res = await fetch(`${API_BASE}/api/support/tickets/${ticketId}?admin_secret=${secret}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priority: newPriority }),
                credentials: 'include'
            });
            if (res.ok) refreshTickets();
        } catch (err) {
            console.error("Failed to update priority:", err);
        }
    };

    // Add admin response to ticket
    const addResponse = async (ticketId, responseText, adminName) => {
        try {
            const secret = import.meta.env.VITE_ADMIN_SECRET || 'Op_masters@100';
            const res = await fetch(`${API_BASE}/api/support/tickets/${ticketId}/messages?admin_secret=${secret}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: responseText,
                    is_admin: true
                }),
                credentials: 'include'
            });
            if (res.ok) await refreshTickets();
        } catch (err) {
            console.error("Failed to add response:", err);
        }
    };

    // Add user response to ticket (User auth via cookie — no admin_secret)
    const addUserResponse = async (ticketId, responseText, userName) => {
        try {
            // Try cookie-based auth first (identifies sender as user)
            const res = await fetch(`${API_BASE}/api/support/tickets/${ticketId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: responseText, is_admin: false }),
                credentials: 'include'
            });
            if (res.ok) {
                await refreshTickets();
                return true;
            }
            // Fallback with explicit is_admin: false
            const secret = import.meta.env.VITE_ADMIN_SECRET || 'Op_masters@100';
            const res2 = await fetch(`${API_BASE}/api/support/tickets/${ticketId}/messages?admin_secret=${secret}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: responseText, is_admin: false }),
                credentials: 'include'
            });
            if (res2.ok) { await refreshTickets(); return true; }
        } catch (err) {
            console.error("Failed to add response:", err);
        }
        return false;
    };

    // Delete ticket (Cloud Sync)
    const deleteTicket = async (ticketId) => {
        try {
            const secret = import.meta.env.VITE_ADMIN_SECRET || 'Op_masters@100';
            const res = await fetch(`${API_BASE}/api/support/tickets/${ticketId}?admin_secret=${secret}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                await refreshTickets();
                return true;
            }
        } catch (err) {
            console.error("Failed to delete ticket:", err);
        }
        return false;
    };

    const getStats = () => {
        return {
            total: tickets.length,
            replied: tickets.filter(t => t.status === 'replied').length,
            pending: tickets.filter(t => t.status === 'pending' || t.status === 'open').length
        };
    };

    return (
        <SupportContext.Provider value={{
            tickets,
            createTicket,
            getUserTickets,
            getAllTickets,
            updateTicketStatus,
            updateTicketPriority,
            addResponse,
            addUserResponse,
            deleteTicket,
            getStats
        }}>
            {children}
        </SupportContext.Provider>
    );
};

export const useSupport = () => useContext(SupportContext);
