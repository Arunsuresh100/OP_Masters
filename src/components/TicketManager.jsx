import React, { useState } from 'react';
import { useSupport } from '../context/SupportContext';
import { Search, Filter, MessageSquare, CheckCircle, XCircle, Clock, AlertCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';

const TicketManager = () => {
    const { getAllTickets, updateTicketStatus, addResponse } = useSupport();
    const tickets = getAllTickets();
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedTicket, setExpandedTicket] = useState(null);
    const [responseText, setResponseText] = useState('');

    const filteredTickets = tickets.filter(ticket => {
        const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
        const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              ticket.id.toString().includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    const handleStatusUpdate = (ticketId, newStatus) => {
        updateTicketStatus(ticketId, newStatus);
    };

    const handleSendResponse = (e, ticketId) => {
        e.preventDefault();
        if (!responseText.trim()) return;
        
        addResponse(ticketId, responseText, 'Admin');
        setResponseText('');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'in-progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'closed': return 'bg-slate-700/30 text-slate-400 border-slate-700/50';
            default: return 'bg-slate-500/10 text-slate-500';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'text-red-400';
            case 'high': return 'text-amber-400';
            case 'medium': return 'text-blue-400';
            case 'low': return 'text-slate-400';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search tickets..." 
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {['all', 'open', 'in-progress', 'resolved', 'closed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                                filterStatus === status 
                                    ? 'bg-amber-500 text-slate-950 border-amber-500' 
                                    : 'bg-slate-900 text-slate-400 border-white/10 hover:border-white/30'
                            }`}
                        >
                            {status.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tickets List */}
            <div className="space-y-4">
                {filteredTickets.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-white/5 border-dashed">
                        <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 font-bold">No tickets found</p>
                    </div>
                ) : (
                    filteredTickets.map(ticket => (
                        <div key={ticket.id} className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-white/20">
                            
                            {/* Ticket Summary Row */}
                            <div 
                                className="p-4 cursor-pointer flex items-start gap-4 hover:bg-white/5 transition-colors"
                                onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                            >
                                <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${ticket.status === 'open' ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'}`}></div>
                                
                                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-4 items-center">
                                    
                                    {/* Main Info: Subject, User, Category */}
                                    <div className="md:col-span-4">
                                        <h3 className="text-sm font-bold text-white truncate pr-2">{ticket.subject}</h3>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <span className="text-xs text-slate-500 truncate max-w-[120px]">{ticket.userEmail}</span>
                                            <span className="hidden sm:inline text-slate-700">•</span>
                                            <span className="text-[10px] text-slate-500 uppercase bg-slate-800 px-1.5 py-0.5 rounded border border-white/5">
                                                {ticket.category}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Priority (Visible on Mobile now) */}
                                    <div className="md:col-span-2 flex items-center md:block">
                                        <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority} Priority
                                        </span>
                                    </div>

                                    {/* Date (Visible on Mobile now) */}
                                    <div className="md:col-span-3 text-[10px] md:text-xs text-slate-600 font-mono">
                                        {new Date(ticket.createdAt).toLocaleString()}
                                    </div>

                                    {/* Status Badge */}
                                    <div className="md:col-span-3 flex justify-start md:justify-end mt-1 md:mt-0">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getStatusColor(ticket.status)}`}>
                                            {ticket.status.replace('-', ' ')}
                                        </span>
                                    </div>
                                </div>

                                {expandedTicket === ticket.id ? (
                                    <ChevronUp className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" />
                                )}
                            </div>

                            {/* Expanded Details */}
                            {expandedTicket === ticket.id && (
                                <div className="border-t border-white/10 bg-slate-950/30 p-4 md:p-6 animate-in slide-in-from-top-2 duration-200">
                                    <div className="grid md:grid-cols-3 gap-6">
                                        
                                        {/* Left Column: Details & Chat */}
                                        <div className="md:col-span-2 space-y-6">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Description</h4>
                                                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                                    {ticket.description}
                                                </p>
                                            </div>

                                            {ticket.transactionId && (
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Related Transaction</h4>
                                                    <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 text-sm font-mono text-amber-500">
                                                        #{ticket.transactionId}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Discussion / Responses */}
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Discussion History</h4>
                                                <div className="space-y-4 mb-4 max-h-64 overflow-y-auto pr-2">
                                                    {ticket.responses?.map(response => (
                                                        <div key={response.id} className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-xs font-bold text-amber-500">{response.adminName}</span>
                                                                <span className="text-[10px] text-slate-600">{new Date(response.timestamp).toLocaleString()}</span>
                                                            </div>
                                                            <p className="text-sm text-slate-300">{response.text}</p>
                                                        </div>
                                                    ))}
                                                    {(!ticket.responses || ticket.responses.length === 0) && (
                                                        <p className="text-xs text-slate-600 italic">No responses yet.</p>
                                                    )}
                                                </div>

                                                {/* Reply Box */}
                                                <form onSubmit={(e) => handleSendResponse(e, ticket.id)} className="flex gap-2">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Type a response..." 
                                                        className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-amber-500"
                                                        value={responseText}
                                                        onChange={(e) => setResponseText(e.target.value)}
                                                    />
                                                    <button 
                                                        type="submit"
                                                        disabled={!responseText.trim()}
                                                        className="p-3 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                </form>
                                            </div>
                                        </div>

                                        {/* Right Column: Actions */}
                                        <div className="space-y-6 border-l border-white/10 md:pl-6">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Update Status</h4>
                                                <div className="space-y-2">
                                                    {['open', 'in-progress', 'resolved', 'closed'].map(status => (
                                                        <button
                                                            key={status}
                                                            onClick={() => handleStatusUpdate(ticket.id, status)}
                                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all border ${
                                                                ticket.status === status 
                                                                    ? getStatusColor(status)
                                                                    : 'bg-slate-900 text-slate-500 border-white/5 hover:border-white/20'
                                                            }`}
                                                        >
                                                            <span>{status.replace('-', ' ')}</span>
                                                            {ticket.status === status && <CheckCircle className="w-4 h-4" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">User Details</h4>
                                                <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                                                            <span className="text-xs font-black text-amber-500">{ticket.userName?.charAt(0)}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-bold text-white truncate">{ticket.userName}</div>
                                                            <div className="text-[10px] text-slate-500 truncate">{ticket.userEmail}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TicketManager;
