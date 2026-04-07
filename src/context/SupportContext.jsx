import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';

const SupportContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const SupportProvider = ({ children }) => {
    const [tickets, setTickets] = useState([]);
    const { user } = useUser();

    // 1. Fetch Tickets from Cloud
    const refreshTickets = async () => {
        try {
            // ENFORCED IAM: Strict JWT validation only inside user scope
            const res = await fetch(`${API_BASE}/api/support/tickets`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
            }
        } catch (err) {
            console.error("Failed to fetch tickets:", err);
        }
    };

    useEffect(() => {
        // ENFORCED PRIVACY: Wipe memory on identity change to prevent ghosting
        setTickets([]);
        
        // Fetch tickets for the active session (User OR Admin)
        refreshTickets(); 
        
        // Polling for new messages every 60 seconds
        const interval = setInterval(() => {
            refreshTickets();
        }, 60000);
        
        return () => clearInterval(interval);
    }, [user?.id]); // Deep reactive dependency on specific identity

    // Create a new ticket (Strict IAM Cookie Authorization)
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
        } catch (err) {
            console.error("Failed to create ticket:", err);
        }
        return false;
    };

    // Get tickets for a specific user (Zero-Trust double-filter)
    const getUserTickets = (userEmail) => {
        if (!userEmail) return [];
        return tickets.filter(t => t.userEmail === userEmail);
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
            if (res.ok) {
                // Optimistic UI: Update locally immediately
                setTickets(prev => prev.map(t => {
                    if (t.id === ticketId) {
                        const newMsg = {
                            id: Date.now(),
                            text: responseText,
                            adminName: 'Admin',
                            userName: null,
                            timestamp: new Date().toISOString(),
                            isUser: false
                        };
                        return { 
                            ...t, 
                            status: 'replied',
                            responses: [...(t.responses || []), newMsg],
                            updatedAt: new Date().toISOString()
                        };
                    }
                    return t;
                }));
                // Silently refresh in the background to ensure consistency
                refreshTickets();
            }
        } catch (err) {
            console.error("Failed to add response:", err);
        }
    };

    // Add user response to ticket (Strict IAM Cookie Authorization)
    const addUserResponse = async (ticketId, responseText, userName) => {
        try {
            const res = await fetch(`${API_BASE}/api/support/tickets/${ticketId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: responseText, is_admin: false }),
                credentials: 'include'
            });
            if (res.ok) {
                // Optimistic UI: Update locally immediately
                setTickets(prev => prev.map(t => {
                    if (t.id === ticketId) {
                        const newMsg = {
                            id: Date.now(),
                            text: responseText,
                            adminName: null,
                            userName: userName || 'User',
                            timestamp: new Date().toISOString(),
                            isUser: true
                        };
                        return { 
                            ...t, 
                            status: 'pending',
                            responses: [...(t.responses || []), newMsg],
                            updatedAt: new Date().toISOString()
                        };
                    }
                    return t;
                }));
                // Silently refresh in the background to ensure consistency
                refreshTickets();
                return true;
            }
        } catch (err) {
            console.error("Failed to add response:", err);
        }
        return false;
    };

    // Mark ticket as read (User views the reply)
    const markAsRead = async (ticketId) => {
        try {
            // Optimistic UI: Update locally first for snappy experience
            setTickets(prev => prev.map(t => 
                t.id === ticketId && t.status === 'replied' 
                    ? { ...t, status: 'seen' } 
                    : t
            ));

            const res = await fetch(`${API_BASE}/api/support/tickets/${ticketId}/read`, {
                method: 'PATCH',
                credentials: 'include'
            });
            if (!res.ok) {
                // If backend fails, the next refreshTickets() will restore the correct state
                console.error("Failed to sync read status with backend");
            }
        } catch (err) {
            console.error("Read receipt error:", err);
        }
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
            replied: tickets.filter(t => {
                const thread = t.responses || [];
                if (thread.length === 0) return false;
                // Replied IF last message was from admin
                const lastMsg = thread[thread.length - 1];
                return !lastMsg.isUser;
            }).length,
            pending: tickets.filter(t => {
                const thread = t.responses || [];
                if (thread.length === 0) return true; // Initial user message needs reply
                // Pending IF last message was from user
                const lastMsg = thread[thread.length - 1];
                return lastMsg.isUser;
            }).length
        };
    };

    return (
        <SupportContext.Provider value={{
            tickets,
            createTicket,
            refreshTickets,
            getUserTickets,
            getAllTickets,
            updateTicketStatus,
            updateTicketPriority,
            addResponse,
            addUserResponse,
            markAsRead,
            deleteTicket,
            getStats
        }}>
            {children}
        </SupportContext.Provider>
    );
};

export const useSupport = () => useContext(SupportContext);
