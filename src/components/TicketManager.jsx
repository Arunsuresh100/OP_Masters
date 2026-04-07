import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Trash2, 
  Send, 
  CheckCircle2, 
  X,
  Clock,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { useSupport } from '../context/SupportContext';

const TicketManager = () => {
  const { 
    tickets, getAllTickets, refreshTickets, 
    updateTicketStatus, addResponse, deleteTicket, getStats 
  } = useSupport();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [reportFilter, setReportFilter] = useState('all');
  const [replyText, setReplyText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const messagesEndRef = useRef(null);
  const stats = getStats();
  
  // Force a fresh sync on mount
  useEffect(() => {
    refreshTickets();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Design Tokens
  const theme = {
    card: 'bg-[#0f172a]/50 backdrop-blur-sm border border-white/5 rounded-xl',
    input: 'w-full bg-[#1e293b] border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-orange-500 transition-all text-sm outline-none',
  };

  const filteredMessages = [...tickets]
    .filter(msg => {
        if (reportFilter === 'all') return true;
        const thread = msg.responses || [];
        const lastIsUser = thread.length === 0 ? true : thread[thread.length - 1].isUser;
        
        if (reportFilter === 'replied') return !lastIsUser;
        if (reportFilter === 'pending') return lastIsUser;
        return true;
    })
    .sort((a, b) => {
        const priority = { 'pending': 1, 'open': 1, 'replied': 2, 'closed': 3 };
        return (priority[a.status] || 4) - (priority[b.status] || 4);
    });

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!selectedMessage || !replyText.trim()) return;
    const tId = selectedMessage.id;
    setReplyText(''); // Fast clear
    await addResponse(tId, replyText, 'Admin');
  };

  // Sync selected message with ticket array from context whenever it changes
  useEffect(() => {
    if (selectedMessage) {
      const latest = tickets.find(t => t.id === selectedMessage.id);
      if (latest) {
          setSelectedMessage(latest);
          setTimeout(scrollToBottom, 50);
      }
    }
  }, [tickets]);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    setShowDeleteModal(id);
  };

  const confirmDeleteAction = () => {
    if (!showDeleteModal) return;
    deleteTicket(showDeleteModal);
    if (selectedMessage?.id === showDeleteModal) setSelectedMessage(null);
    setShowDeleteModal(null);
  };

  return (
    <>
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 h-[75vh] md:h-[650px] animate-in fade-in duration-500 overflow-hidden`}>
        
        {/* Sidebar - Queue (Hidden on mobile if a ticket is selected) */}
        <div className={`${theme.card} lg:col-span-1 flex flex-col overflow-hidden shadow-2xl ${selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-5 border-b border-white/5 bg-white/[0.03] flex items-center justify-between">
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Support Hub Hub</h5>
              <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">{stats.total} Total • {stats.pending} Pending</p>
            </div>
            <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
              {['all', 'pending', 'replied'].map(status => (
                <button 
                  key={status}
                  onClick={() => setReportFilter(status)}
                  className={`px-2 py-1 rounded-md text-[8px] font-black uppercase transition-all ${reportFilter === status ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-white/5">
            {filteredMessages.map((m) => (
              <div 
                key={m.id} 
                onClick={() => setSelectedMessage(m)}
                className={`p-5 cursor-pointer transition-all relative group ${selectedMessage?.id === m.id ? 'bg-orange-600/10 border-l-4 border-orange-500' : 'hover:bg-white/[0.03]'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="min-w-0">
                    <p className={`text-xs font-black truncate ${selectedMessage?.id === m.id ? 'text-white' : 'text-slate-300'}`}>{m.subject || 'No Subject'}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight mt-0.5 italic opacity-60">ID: #{m.id.toString().slice(-4)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                     {m.status === 'replied' || selectedMessage?.id === m.id ? (
                       <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                     ) : (
                       <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                     )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 truncate opacity-80 leading-relaxed pr-8">
                   {(() => {
                     const thread = m.responses || [];
                     if (thread.length > 0) return thread[thread.length - 1].text;
                     return m.message || 'No content';
                   })()}
                 </p>
                <button 
                  onClick={(e) => handleDelete(e, m.id)}
                  className="absolute right-4 bottom-4 p-2 text-slate-600 hover:text-rose-500 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                >
                   <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {filteredMessages.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <Clock className="w-6 h-6 text-slate-700" />
                </div>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No Active Transmission</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Conversation Canvas (Hidden on mobile if no ticket is selected) */}
        <div className={`${theme.card} lg:col-span-2 flex flex-col overflow-hidden shadow-2xl relative ${!selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
           {selectedMessage ? (
             <>
              <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3 md:gap-4">
                  {/* Back Button (Mobile Only) */}
                  <button 
                    onClick={() => setSelectedMessage(null)}
                    className="lg:hidden p-2 -ml-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-full transition-all"
                  >
                      <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center font-black text-orange-500 text-xs md:text-sm">
                    {selectedMessage.userName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="font-black text-xs md:text-sm text-white flex items-center gap-2 md:gap-3">
                      {selectedMessage.userName || 'Anonymous User'}
                      <span className={`text-[7px] md:text-[8px] px-1.5 py-0.5 rounded border uppercase tracking-widest ${selectedMessage.status === 'replied' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                        {selectedMessage.status}
                      </span>
                    </h4>
                    <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 md:mt-1 truncate max-w-[150px] md:max-w-none">
                       {new Date(selectedMessage.createdAt).toLocaleDateString()} • Operational
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Close Ticket Action */}
                  <button 
                    onClick={() => {
                      updateTicketStatus(selectedMessage.id, 'closed');
                      setSelectedMessage(null);
                    }}
                    title="Mark as Resolved"
                    className="p-2 hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-500 rounded-xl transition-all flex items-center gap-2 group/close"
                  >
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Resolve</span>
                  </button>

                  <button 
                    onClick={() => setSelectedMessage(null)}
                    className="p-2 hover:bg-white/5 text-slate-500 hover:text-white rounded-xl transition-all"
                  >
                      <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 p-8 space-y-6 overflow-y-auto no-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                  
                  {/* 1. Ticket Thread (Reactive Alignment & Width) */}
                  <div className="space-y-6">
                    {selectedMessage.responses && selectedMessage.responses.length > 0 ? (
                      selectedMessage.responses.map((resp, i) => (
                        <div key={i} className={`flex flex-col gap-1.5 ${resp.isUser ? 'items-start' : 'items-end'}`}>
                          {/* IDENTIFICATION LABEL */}
                          <div className={`flex items-center gap-2 px-1 mb-0.5 ${resp.isUser ? 'flex-row' : 'flex-row-reverse'}`}>
                             <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                               resp.isUser 
                                 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                 : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                             }`}>
                               {resp.isUser ? 'USER' : 'ADMIN'}
                             </span>
                             <span className="text-[7px] font-bold text-slate-600 uppercase tracking-tight italic">
                               {new Date(resp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                          </div>

                          {/* MESSAGE BUBBLE */}
                          <div className={`p-4 rounded-2xl max-w-[85%] w-fit shadow-2xl border transition-all hover:scale-[1.01] ${
                            resp.isUser 
                              ? 'bg-[#1e293b] border-white/5 rounded-tl-none text-slate-200' 
                              : 'bg-orange-600 border-orange-400 rounded-tr-none text-white'
                          }`}>
                            <p className="text-[12.5px] leading-relaxed font-semibold">
                              {resp.text}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      /* Fallback to original message if no responses array present */
                      <div className="flex flex-col gap-1.5 items-start">
                         <div className="flex items-center gap-2 px-1 mb-0.5">
                             <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                               USER
                             </span>
                             <span className="text-[7px] font-bold text-slate-600 uppercase tracking-tight italic">
                               {new Date(selectedMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                         </div>
                         <div className="bg-[#1e293b] border border-white/5 p-4 rounded-2xl rounded-tl-none max-w-[85%] w-fit shadow-2xl">
                            <p className="text-[12.5px] text-slate-200 leading-relaxed font-semibold">
                              {selectedMessage.message}
                            </p>
                         </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
              </div>

              <div className="p-4 md:p-8 border-t border-white/5 bg-black/40 pb-[env(safe-area-inset-bottom)]">
                 <form onSubmit={handleSendMessage} className="relative group">
                    <textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type Response..." 
                      className={theme.input + " pr-14 md:pr-16 min-h-[50px] md:min-h-[60px] bg-[#020618] border-white/5 focus:border-orange-500/50 resize-none p-3 md:p-4 text-xs md:text-sm font-medium leading-tight"}
                    ></textarea>
                    <button 
                      type="submit"
                      disabled={!replyText.trim()}
                      className="absolute bottom-3 right-3 md:bottom-4 md:right-4 p-2.5 md:p-3 bg-orange-600 text-white rounded-xl hover:bg-orange-500 transition-all shadow-xl shadow-orange-900/40 disabled:opacity-20 disabled:grayscale group"
                    >
                       <Send className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                 </form>
                 <div className="flex items-center justify-center gap-4 mt-3 md:mt-4 opacity-10 md:opacity-30">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
                    <p className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">SECURE ADM LINK</p>
                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
                 </div>
              </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-700 gap-6 opacity-20 group">
                <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-700">
                  <MessageSquare className="w-10 h-10" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">Awaiting Data Input</p>
             </div>
           )}
        </div>
      </div>
        
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 md:p-8 max-w-[320px] md:max-w-sm w-full shadow-2xl scale-in-center overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent pointer-events-none" />
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-red-500/10 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 border border-red-500/20">
                <Trash2 className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
              </div>
              <h3 className="text-base md:text-lg font-black mb-1 md:mb-2 text-white uppercase italic tracking-widest">Acknowledge Purge?</h3>
              <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-6 md:mb-8">
                Confirming this action will permanently remove this transmission from the registry. This cannot be undone.
              </p>
              <div className="grid grid-cols-2 gap-3 md:gap-4 w-full">
                <button 
                  onClick={() => setShowDeleteModal(null)}
                  className="py-2.5 md:py-3 rounded-lg md:rounded-xl border border-white/5 text-[8px] md:text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-slate-400"
                >
                  Abort
                </button>
                <button 
                  onClick={confirmDeleteAction}
                  className="py-2.5 md:py-3 rounded-lg md:rounded-xl bg-red-600 hover:bg-red-700 text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 transition-all active:scale-95"
                >
                  Confirm Purge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TicketManager;
