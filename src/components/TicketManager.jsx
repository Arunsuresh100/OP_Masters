import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Trash2, 
  Send, 
  CheckCircle2, 
  X,
  Clock,
  Filter
} from 'lucide-react';
import { useSupport } from '../context/SupportContext';

const TicketManager = () => {
  const { tickets, getAllTickets, updateTicketStatus, addResponse, deleteTicket, getStats } = useSupport();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [reportFilter, setReportFilter] = useState('all');
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef(null);
  const stats = getStats();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Design Tokens
  const theme = {
    card: 'bg-[#0f172a]/50 backdrop-blur-sm border border-white/5 rounded-xl',
    input: 'w-full bg-[#1e293b] border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-orange-500 transition-all text-sm outline-none',
  };

  const filteredMessages = [...tickets]
    .filter(msg => reportFilter === 'all' || msg.status === reportFilter)
    .sort((a, b) => {
        const priority = { 'pending': 1, 'open': 1, 'replied': 2, 'closed': 3 };
        return (priority[a.status] || 4) - (priority[b.status] || 4);
    });

  const handleSendMessage = async () => {
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
    deleteTicket(id);
    if (selectedMessage?.id === id) setSelectedMessage(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[650px] animate-in fade-in duration-500">
      
      {/* Sidebar - Queue */}
      <div className={theme.card + " lg:col-span-1 flex flex-col overflow-hidden shadow-2xl"}>
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
              <p className="text-[11px] text-slate-400 truncate opacity-80 leading-relaxed pr-8">{m.message || m.responses?.[0]?.text}</p>
              <button 
                onClick={(e) => handleDelete(e, m.id)}
                className="absolute right-4 bottom-4 p-2 text-slate-600 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
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

      {/* Main Conversation Canvas */}
      <div className={theme.card + " lg:col-span-2 flex flex-col overflow-hidden shadow-2xl relative"}>
         {selectedMessage ? (
           <>
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center font-black text-orange-500">
                  {selectedMessage.userName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="font-black text-sm text-white flex items-center gap-3">
                    {selectedMessage.userName || 'Anonymous User'}
                    <span className={`text-[8px] px-2 py-0.5 rounded border uppercase tracking-widest ${selectedMessage.status === 'replied' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                      {selectedMessage.status}
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Status: Operational • {new Date(selectedMessage.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMessage(null)}
                className="p-2 hover:bg-white/5 text-slate-500 hover:text-white rounded-xl transition-all"
              >
                  <X className="w-5 h-5" />
              </button>
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

            <div className="p-8 border-t border-white/5 bg-black/40">
               <div className="relative group">
                  <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Input command response for user..." 
                    className={theme.input + " pr-16 min-h-[60px] bg-[#020618] border-white/5 focus:border-orange-500/50 resize-none p-4 text-sm font-medium leading-tight"}
                  ></textarea>
                  <button 
                    onClick={handleSendMessage}
                    disabled={!replyText.trim()}
                    className="absolute bottom-4 right-4 p-3 bg-orange-600 text-white rounded-xl hover:bg-orange-500 transition-all shadow-xl shadow-orange-900/40 disabled:opacity-20 disabled:grayscale group"
                  >
                     <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
               </div>
               <div className="flex items-center justify-center gap-4 mt-4 opacity-30">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">Secure Admin Link Active</p>
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
  );
};

export default TicketManager;
