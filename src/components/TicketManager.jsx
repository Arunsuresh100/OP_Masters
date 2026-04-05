import React, { useState } from 'react';
import { 
  MessageSquare, 
  Trash2, 
  Send, 
  CheckCircle2, 
  X,
  Clock
} from 'lucide-react';

const mockMessages = [
  { id: 1, user: 'Tony Chopper', message: 'Pricing error on OP-05 limited cards.', time: '12:45 PM', status: 'pending' },
  { id: 2, user: 'Usopp', message: 'The image upload for custom mats is failing.', time: '10:20 AM', status: 'replied' },
];

const TicketManager = () => {
  const [messages, setMessages] = useState(mockMessages);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [reportFilter, setReportFilter] = useState('all');

  // Design Tokens
  const theme = {
    card: 'bg-[#0f172a]/50 backdrop-blur-sm border border-white/5 rounded-xl',
    input: 'w-full bg-[#1e293b] border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-orange-500 transition-all text-sm outline-none',
  };

  const filteredMessages = messages.filter(msg => 
    reportFilter === 'all' || msg.status === reportFilter
  );

  const handleSendMessage = () => {
    if (!selectedMessage) return;
    const updatedMessages = messages.map(m => 
      m.id === selectedMessage.id ? { ...m, status: 'replied' } : m
    );
    setMessages(updatedMessages);
    // Stay on the message instead of closing
    const current = updatedMessages.find(m => m.id === selectedMessage.id);
    setSelectedMessage(current);
  };

  const deleteMessage = (e, id) => {
    e.stopPropagation();
    setMessages(messages.filter(m => m.id !== id));
    if (selectedMessage?.id === id) setSelectedMessage(null);
  };

  const handleCloseMessageView = () => {
    setSelectedMessage(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      <div className={theme.card + " lg:col-span-1 flex flex-col overflow-hidden"}>
        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <h5 className="text-[10px] font-bold uppercase tracking-widest">Feedback Queue</h5>
          <div className="flex bg-white/5 rounded p-0.5 border border-white/5">
            {['all', 'pending', 'replied'].map(status => (
              <button 
                key={status}
                onClick={() => setReportFilter(status)}
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${reportFilter === status ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-white'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {filteredMessages.map((m) => (
            <div 
              key={m.id} 
              onClick={() => setSelectedMessage(m)}
              className={`p-4 cursor-pointer transition-colors relative group ${selectedMessage?.id === m.id ? 'bg-orange-600/10 border-l-2 border-orange-500' : 'hover:bg-white/5'}`}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <p className={`text-xs font-bold ${selectedMessage?.id === m.id ? 'text-orange-500' : 'text-slate-300'}`}>{m.user}</p>
                  {m.status === 'replied' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                </div>
                <p className="text-[10px] text-slate-600 font-mono">{m.time}</p>
              </div>
              <p className="text-xs text-slate-400 truncate tracking-tight pr-10">{m.message}</p>
              <button 
                onClick={(e) => deleteMessage(e, m.id)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Message"
              >
                 <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {filteredMessages.length === 0 && (
            <div className="p-8 text-center text-slate-600 text-[10px] uppercase font-bold tracking-widest">
              Zero matching records
            </div>
          )}
        </div>
      </div>

      <div className={theme.card + " lg:col-span-2 flex flex-col overflow-hidden"}>
         {selectedMessage ? (
           <>
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  {selectedMessage.user}
                  {selectedMessage.status === 'replied' && (
                    <span className="text-[8px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded border border-green-500/20">REPLIED</span>
                  )}
                </h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Inquiry: #{selectedMessage.id}992</p>
              </div>
              <div className="flex gap-2">
                 <button 
                   onClick={handleCloseMessageView}
                   className="p-1.5 hover:bg-white/5 text-slate-500 hover:text-white rounded-md transition-all"
                   title="Close Panel"
                 >
                    <X className="w-4 h-4" />
                 </button>
              </div>
            </div>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-gradient-to-b from-transparent to-black/20">
               <div className="bg-white/5 p-4 rounded-lg max-w-[80%] border border-white/5 shadow-sm">
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    "{selectedMessage.message}"
                  </p>
               </div>
               {selectedMessage.status === 'replied' && (
                 <div className="flex justify-end animate-in slide-in-from-right-4 duration-300">
                   <div className="bg-orange-600/10 p-4 rounded-lg max-w-[80%] border border-orange-500/20 shadow-sm text-right">
                      <p className="text-sm text-orange-200 leading-relaxed">
                        Our technicians have addressed this query. The system logs are now optimized for your specified region.
                      </p>
                      <p className="text-[9px] text-orange-500/60 uppercase font-bold mt-2 tracking-widest">Automated Resolution Sync</p>
                   </div>
                 </div>
               )}
            </div>
            <div className="p-6 border-t border-white/5 bg-white/[0.01]">
               <div className="relative">
                  <textarea 
                    placeholder="Draft response to the community..." 
                    className={theme.input + " pr-12 min-h-[100px] bg-[#020618]"}
                  ></textarea>
                  <button 
                    onClick={handleSendMessage}
                    className="absolute bottom-3 right-3 p-2 bg-orange-600 rounded-md hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 group active:scale-90"
                  >
                     <Send className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                  </button>
               </div>
               <p className="text-[9px] text-slate-600 mt-3 text-center uppercase tracking-widest font-bold">Encrypted Communication Channel Active</p>
            </div>
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-4 opacity-40">
              <MessageSquare className="w-12 h-12" />
              <p className="text-xs uppercase font-bold tracking-widest">Initiate ticket review</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default TicketManager;
