import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Minus, Send } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DirectChatPopupProps {
    friendName: string;
    friendStatus: 'ONLINE' | 'AWAY' | 'OFFLINE';
    onClose: () => void;
}

interface ChatMessage {
    id: number;
    sender: 'me' | 'friend';
    content: string;
    timestamp: string;
}

export function DirectChatPopup({ friendName, friendStatus, onClose }: DirectChatPopupProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 1,
            sender: 'friend',
            content: '안녕하세요!',
            timestamp: '14:23'
        }
    ]);

    const handleSend = () => {
        if (!messageInput.trim()) return;

        const newMessage: ChatMessage = {
            id: Date.now(),
            sender: 'me',
            content: messageInput,
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, newMessage]);
        setMessageInput('');
    };

    const statusColor = {
        ONLINE: 'bg-green-500',
        AWAY: 'bg-yellow-500',
        OFFLINE: 'bg-gray-500'
    }[friendStatus];

    const statusText = {
        ONLINE: '온라인',
        AWAY: '자리 비움',
        OFFLINE: '오프라인'
    }[friendStatus];

    return createPortal(
        <div
            className={cn(
                "fixed bottom-4 left-[272px] w-[400px] bg-[#1E293B] border border-white/10 rounded-lg shadow-2xl flex flex-col overflow-hidden transition-all duration-200 z-50",
                isMinimized ? "h-14" : "h-[600px]"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {friendName[0]}
                        </div>
                        <div className={cn("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#1E293B]", statusColor)} />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-white">{friendName}</div>
                        <div className="text-xs text-gray-400">{statusText}</div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                        title={isMinimized ? "확대" : "최소화"}
                    >
                        <Minus className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                        title="닫기"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0F172A]">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex",
                                    msg.sender === 'me' ? "justify-end" : "justify-start"
                                )}
                            >
                                <div className={cn(
                                    "max-w-[70%] rounded-lg px-3 py-2",
                                    msg.sender === 'me'
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-700 text-gray-100"
                                )}>
                                    <div className="text-sm leading-relaxed break-words">{msg.content}</div>
                                    <div className={cn(
                                        "text-[10px] mt-1",
                                        msg.sender === 'me' ? "text-blue-200" : "text-gray-400"
                                    )}>
                                        {msg.timestamp}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-[#1E293B] border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="메시지를 입력하세요..."
                                className="flex-1 px-3 py-2 bg-[#0F172A] border border-white/10 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!messageInput.trim()}
                                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>,
        document.body
    );
}
