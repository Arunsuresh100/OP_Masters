import React, { createContext, useContext, useState, useEffect } from 'react';

const SupportContext = createContext();

export const SupportProvider = ({ children }) => {
    const [tickets, setTickets] = useState([]);

    // Load tickets from localStorage on mount
    useEffect(() => {
        const savedTickets = localStorage.getItem('op_tickets');
        if (savedTickets) {
            setTickets(JSON.parse(savedTickets));
        }
    }, []);

    // Save tickets to localStorage whenever they change
    useEffect(() => {
        if (tickets.length >= 0) {
            localStorage.setItem('op_tickets', JSON.stringify(tickets));
        }
    }, [tickets]);

    // Create a new ticket
    const createTicket = (ticketData) => {
        const newTicket = {
            id: Date.now() + Math.random(),
            ...ticketData,
            status: 'open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            responses: []
        };
        
        setTickets(prev => [newTicket, ...prev]);
        return newTicket;
    };

    // Get tickets for a specific user
    const getUserTickets = (userEmail) => {
        return tickets.filter(ticket => ticket.userEmail === userEmail);
    };

    // Get all tickets (admin only)
    const getAllTickets = () => {
        return tickets;
    };

    // Update ticket status
    const updateTicketStatus = (ticketId, newStatus) => {
        setTickets(prev => prev.map(ticket => 
            ticket.id === ticketId 
                ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() }
                : ticket
        ));
    };

    // Update ticket priority
    const updateTicketPriority = (ticketId, newPriority) => {
        setTickets(prev => prev.map(ticket => 
            ticket.id === ticketId 
                ? { ...ticket, priority: newPriority, updatedAt: new Date().toISOString() }
                : ticket
        ));
    };

    // Add admin response to ticket
    const addResponse = (ticketId, responseText, adminName) => {
        const response = {
            id: Date.now() + Math.random(),
            text: responseText,
            adminName: adminName || 'Admin',
            timestamp: new Date().toISOString()
        };

        setTickets(prev => prev.map(ticket => 
            ticket.id === ticketId 
                ? { 
                    ...ticket, 
                    responses: [...ticket.responses, response],
                    updatedAt: new Date().toISOString()
                }
                : ticket
        ));
    };

    // Delete ticket
    const deleteTicket = (ticketId) => {
        setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
    };

    // Get ticket statistics
    const getStats = () => {
        const stats = {
            total: tickets.length,
            open: tickets.filter(t => t.status === 'open').length,
            inProgress: tickets.filter(t => t.status === 'in-progress').length,
            resolved: tickets.filter(t => t.status === 'resolved').length,
            closed: tickets.filter(t => t.status === 'closed').length,
            critical: tickets.filter(t => t.priority === 'critical').length,
            high: tickets.filter(t => t.priority === 'high').length
        };
        return stats;
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
            deleteTicket,
            getStats
        }}>
            {children}
        </SupportContext.Provider>
    );
};

export const useSupport = () => useContext(SupportContext);
