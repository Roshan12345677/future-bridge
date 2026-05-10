import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { chatAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Send, Hash, Users, Smile, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const ROOMS = [
  { id: 'general', name: 'General', desc: 'Open discussion' },
  { id: 'dsa', name: 'DSA Help', desc: 'Data structures & algorithms' },
  { id: 'jobs', name: 'Job Board', desc: 'Job opportunities' },
  { id: 'projects', name: 'Projects', desc: 'Collaborate on projects' },
  { id: 'off-topic', name: 'Off Topic', desc: 'Random chats' },
];

const EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '👏', '💯', '🚀'];

const roleColors = {
  student: 'from-blue-500 to-blue-600',
  teacher: 'from-emerald-500 to-emerald-600',
  admin: 'from-rose-500 to-rose-600',
};

const Chat = () => {
  const { user, token } = useAuth();
  const [activeRoom, setActiveRoom] = useState('general');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimerRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Initialize socket
  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => { socket.emit('joinRoom', activeRoom); });
    socket.on('newMessage', (msg) => { setMessages(prev => [...prev, msg]); });
    socket.on('userTyping', ({ user: typingUser, isTyping }) => {
      setTyping(isTyping ? `${typingUser} is typing...` : '');
    });
    socket.on('onlineUsers', (users) => { setOnlineCount(users.length); });
    socket.on('userJoined', (data) => {
      setMessages(prev => [...prev, { _id: Date.now(), isSystem: true, message: data.message, createdAt: new Date() }]);
    });

    return () => { socket.disconnect(); };
  }, [token]);

  // Room change
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.emit('leaveRoom', activeRoom);
      socketRef.current.emit('joinRoom', activeRoom);
    }
    loadMessages(activeRoom);
  }, [activeRoom]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const loadMessages = async (room) => {
    setLoading(true);
    setMessages([]);
    try {
      const data = await chatAPI.getMessages({ room, limit: 50 });
      setMessages(data.messages || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    const msgText = message.trim();
    setMessage('');

    try {
      // Send via socket for real-time
      if (socketRef.current?.connected) {
        socketRef.current.emit('sendMessage', { room: activeRoom, message: msgText });
      } else {
        // Fallback to REST API
        const data = await chatAPI.sendMessage({ room: activeRoom, message: msgText });
        setMessages(prev => [...prev, data.message]);
      }
    } catch (e) {
      toast.error('Failed to send message');
      setMessage(msgText);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleTyping = (val) => {
    setMessage(val);
    if (socketRef.current) {
      socketRef.current.emit('typing', { room: activeRoom, isTyping: true });
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        socketRef.current?.emit('typing', { room: activeRoom, isTyping: false });
      }, 1500);
    }
  };

  const deleteMessage = async (id) => {
    try {
      await chatAPI.deleteMessage(id);
      setMessages(prev => prev.filter(m => m._id !== id));
      toast.success('Message deleted');
    } catch (e) { toast.error('Failed to delete message'); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const isOwnMessage = (msg) => msg.sender?._id === user?._id || msg.sender === user?._id;

  return (
    <div className="h-[calc(100vh-5rem)] flex -m-6 animate-fade-in">
      {/* Sidebar - Rooms */}
      <div className="w-56 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Discussion Forum</h2>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-gray-500">{onlineCount} online</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Channels</p>
          {ROOMS.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              className={clsx(
                'w-full text-left px-3 py-2.5 transition-colors',
                activeRoom === room.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              <div className="flex items-center gap-2">
                <Hash size={14} className="flex-shrink-0" />
                <span className="text-sm font-medium">{room.name}</span>
              </div>
              <p className="text-xs text-gray-400 ml-5 mt-0.5">{room.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Hash size={16} className="text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              {ROOMS.find(r => r.id === activeRoom)?.name}
            </span>
            <span className="text-gray-400 text-sm">—</span>
            <span className="text-xs text-gray-500">{ROOMS.find(r => r.id === activeRoom)?.desc}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Users size={13} />
            <span>{onlineCount} online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <LoadingSpinner text="Loading messages..." />
          ) : messages.length === 0 ? (
            <div className="empty-state h-full">
              <MessageSquare size={40} className="text-gray-200 dark:text-gray-700 mb-3" />
              <p className="text-gray-500 font-medium">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">Be the first to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              if (msg.isSystem) return (
                <div key={msg._id || i} className="flex justify-center">
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{msg.message}</span>
                </div>
              );

              const own = isOwnMessage(msg);
              return (
                <div key={msg._id || i} className={clsx('flex gap-2.5 group', own && 'flex-row-reverse')}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleColors[msg.sender?.role] || roleColors.student} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>
                    {msg.sender?.name?.[0]?.toUpperCase() || '?'}
                  </div>

                  {/* Bubble */}
                  <div className={clsx('max-w-[65%]', own && 'items-end flex flex-col')}>
                    {!own && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-900 dark:text-white">{msg.sender?.name}</span>
                        <span className={clsx('badge text-xs capitalize', msg.sender?.role === 'teacher' ? 'badge-green' : msg.sender?.role === 'admin' ? 'badge-red' : 'badge-blue')}>
                          {msg.sender?.role}
                        </span>
                      </div>
                    )}
                    <div className={clsx(
                      'px-3.5 py-2.5 rounded-2xl text-sm relative',
                      own
                        ? 'bg-gradient-to-br from-blue-500 to-violet-600 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                    )}>
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    </div>
                    <div className={clsx('flex items-center gap-2 mt-1', own && 'flex-row-reverse')}>
                      <span className="text-xs text-gray-400">{formatTime(msg.createdAt)}</span>
                      {(own || user?.role === 'admin') && (
                        <button onClick={() => deleteMessage(msg._id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400">
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {typing && <p className="text-xs text-gray-400 animate-pulse pl-1">{typing}</p>}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          <form onSubmit={sendMessage} className="flex items-end gap-2">
            <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-end gap-2 px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-400 transition-all">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message #${ROOMS.find(r => r.id === activeRoom)?.name || activeRoom}...`}
                rows={1}
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none focus:outline-none max-h-28"
                style={{ height: 'auto' }}
                onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
              />
              <div className="flex items-center gap-1 flex-shrink-0">
                {EMOJIS.slice(0, 4).map(emoji => (
                  <button key={emoji} type="button" onClick={() => setMessage(m => m + emoji)} className="text-sm hover:scale-125 transition-transform">
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center text-white disabled:opacity-50 hover:opacity-90 transition-all flex-shrink-0"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-1.5 ml-1">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
