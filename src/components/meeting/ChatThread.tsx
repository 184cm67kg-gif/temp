import { useState } from 'react';
import type { ComponentType, SVGProps } from 'react';
import ChatMessage from './ChatMessage';
import {
    X,
    Send,
    MessageSquare,
    Info,
    Lightbulb,
    HelpCircle,
    CheckCircle,
    ChevronDown
} from 'lucide-react';
import type { CommitType } from '../../types';

export interface Chat {
    id: string;
    userName: string;
    message: string;
    timestamp: string;
    commitType?: CommitType;
    refChatId: string | null;
    reactions?: { emoji: string; count: number; users: string[] }[];
    replies?: Chat[];
}

interface ChatThreadProps {
    chats: Chat[];
    onSendMessage: (message: string, commitType: CommitType, refChatId?: string) => void;
    onReact: (chatId: string, emoji: string) => void;
}

// Commit Type 정보
const commitTypes: Array<{
    type: CommitType;
    label: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    color: string;
    description: string;
}> = [
        {
            type: 'NONE',
            label: '자유 채팅',
            icon: MessageSquare,
            color: 'text-gray-400',
            description: '일반적인 대화',
        },
        {
            type: 'INFO',
            label: '정보',
            icon: Info,
            color: 'text-blue-400',
            description: '객관적 정보/데이터',
        },
        {
            type: 'OPINION',
            label: '의견',
            icon: Lightbulb,
            color: 'text-purple-400',
            description: '주관적 견해',
        },
        {
            type: 'QUESTION',
            label: '질문',
            icon: HelpCircle,
            color: 'text-yellow-400',
            description: '질문하기',
        },
        {
            type: 'TODO',
            label: '할 일',
            icon: CheckCircle,
            color: 'text-red-400',
            description: '해야 할 작업',
        }
    ];

interface ChatThreadProps {
    chats: Chat[];
    onSendMessage: (message: string, commitType: CommitType, refChatId?: string) => void;
    onReact: (chatId: string, emoji: string) => void;
    allowCommitTypes?: boolean;
}

export default function ChatThread({ chats, onSendMessage, onReact, allowCommitTypes = true }: ChatThreadProps) {
    const [replyingTo, setReplyingTo] = useState<Chat | null>(null);
    const [message, setMessage] = useState('');
    const [commitType, setCommitType] = useState<CommitType>('NONE');
    const [showTypeSelector, setShowTypeSelector] = useState(false);

    // ... (keep ChatNode and buildThreads logic same)
    interface ChatNode extends Omit<Chat, 'replies'> {
        replies: ChatNode[];
    }

    const buildThreads = (chats: Chat[]): ChatNode[] => {
        const chatMap = new Map<string, ChatNode>();
        const rootChats: ChatNode[] = [];

        chats.forEach(chat => {
            chatMap.set(chat.id, { ...chat, replies: [] });
        });

        chats.forEach(chat => {
            const chatWithReplies = chatMap.get(chat.id)!;
            if (chat.refChatId) {
                const parent = chatMap.get(chat.refChatId);
                if (parent) {
                    parent.replies.push(chatWithReplies);
                } else {
                    rootChats.push(chatWithReplies);
                }
            } else {
                rootChats.push(chatWithReplies);
            }
        });

        return rootChats;
    };

    // 중첩 답글(nested replies)을 부모 메시지 버블 내부에 렌더링합니다.
    // replies는 ChatMessage 컴포넌트 내에서 직접 렌더링되므로 재귀 호출이 필요하지 않습니다.
    const renderThread = (chat: ChatNode) => {
        // replies를 ChatMessage에 전달할 수 있는 형태로 변환
        const formattedReplies = chat.replies.map(reply => ({
            id: reply.id,
            userName: reply.userName,
            message: reply.message,
            timestamp: reply.timestamp,
        }));

        return (
            <div key={chat.id}>
                <ChatMessage
                    id={chat.id}
                    userName={chat.userName}
                    message={chat.message}
                    timestamp={chat.timestamp}
                    commitType={chat.commitType}
                    refChatId={chat.refChatId}
                    depth={0}
                    reactions={chat.reactions}
                    replyCount={chat.replies.length}
                    replies={formattedReplies}
                    onReply={(chatId) => {
                        const chatToReply = chats.find(c => c.id === chatId);
                        if (chatToReply) setReplyingTo(chatToReply);
                    }}
                    onReact={onReact}
                />
            </div>
        );
    };

    const handleSend = () => {
        if (!message.trim()) return;
        onSendMessage(message, commitType, replyingTo?.id);
        setMessage('');
        setReplyingTo(null);
        setCommitType('NONE');
    };

    const selectedType = commitTypes.find(t => t.type === commitType)!;

    const threads = buildThreads(chats);

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-2">
                {threads.map(thread => renderThread(thread))}
            </div>

            {/* Reply Preview */}
            {replyingTo && (
                <div className="px-4 py-2 bg-secondary/50 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">답변 대상:</span>
                        <button
                            onClick={() => setReplyingTo(null)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="bg-secondary/50 rounded p-2 text-sm text-secondary-foreground border-l-2 border-primary">
                        <div className="font-medium mb-1">{replyingTo.userName}</div>
                        <div className="text-xs line-clamp-2 opacity-80">{replyingTo.message}</div>
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border bg-background">
                {/* Commit Type Selector */}
                {allowCommitTypes && (
                    <div className="mb-3">
                        <div className="text-xs font-medium text-muted-foreground mb-2">
                            메시지 유형 #Commit
                        </div>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowTypeSelector(!showTypeSelector)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${commitType === 'NONE'
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : `${selectedType?.color?.split(' ')[0] || ''} ${selectedType?.color?.split(' ')[1] || ''}`
                                    }`}
                            >
                                {commitType === 'NONE' ? (
                                    <MessageSquare className="w-3.5 h-3.5" />
                                ) : (
                                    selectedType?.icon && <selectedType.icon className={`w-3.5 h-3.5 ${selectedType.color}`} />
                                )}
                                <span>{commitType === 'NONE' ? '자유로운 채팅' : selectedType?.label}</span>
                                <ChevronDown className="w-3 h-3 opacity-50" />
                            </button>

                            {showTypeSelector && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowTypeSelector(false)}
                                    />
                                    <div className="absolute bottom-full left-0 mb-2 w-40 bg-[#1e293b] border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                                        {(['NONE', 'INFO', 'OPINION', 'QUESTION', 'TODO'] as CommitType[]).map((type) => {
                                            const typeObj = commitTypes.find(t => t.type === type);
                                            const Icon = typeObj?.icon;
                                            return (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => {
                                                        setCommitType(type);
                                                        setShowTypeSelector(false);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/5 flex items-center gap-2"
                                                >
                                                    {type === 'NONE' ? (
                                                        <>
                                                            <MessageSquare className="w-3.5 h-3.5" />
                                                            <span className="font-medium">자유로운 채팅</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {Icon && <Icon className={`w-3.5 h-3.5 ${typeObj?.color}`} />}
                                                            <span>{typeObj?.label}</span>
                                                        </>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Message Input */}
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={replyingTo ? `${replyingTo.userName}님에게 답변...` : '메시지 입력...'}
                        className="flex-1 px-4 py-2 bg-secondary/30 border border-border text-foreground placeholder-muted-foreground rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded transition-colors flex items-center gap-2 font-medium text-sm"
                    >
                        <Send className="w-4 h-4" />
                        전송
                    </button>
                </div>
            </div>
        </div>
    );
}
