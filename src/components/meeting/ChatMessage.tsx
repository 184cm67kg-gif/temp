import { useState } from 'react';
import {
    MessageSquare,
    MoreVertical,
    Reply,
    Info,
    Lightbulb,
    HelpCircle,
    CheckCircle,
    Smile
} from 'lucide-react';
import type { CommitType } from '../../types';

interface Reaction {
    emoji: string;
    count: number;
    users: string[];
}

interface ChatMessageProps {
    id: string;
    userName: string;
    message: string;
    timestamp: string;
    commitType?: CommitType;
    refChatId?: string | null;
    depth?: number;
    reactions?: Reaction[];
    replyCount?: number;
    replies?: Array<{
        id: string;
        userName: string;
        message: string;
        timestamp: string;
    }>;
    onReply?: (chatId: string) => void;
    onReact?: (chatId: string, emoji: string) => void;
}

// Commit Type 정보
const commitTypeInfo: Record<CommitType, {
    label: string;
    icon: typeof MessageSquare;
    color: string;
    bgColor: string;
    borderColor: string;
}> = {
    NONE: {
        label: '자유',
        icon: MessageSquare,
        color: 'text-gray-400',
        bgColor: 'bg-gray-700/30',
        borderColor: 'border-gray-600',
    },
    INFO: {
        label: '사실',
        icon: Info,
        color: 'text-blue-400',
        bgColor: 'bg-blue-900/30',
        borderColor: 'border-blue-700',
    },
    OPINION: {
        label: '의견',
        icon: Lightbulb,
        color: 'text-purple-400',
        bgColor: 'bg-purple-900/30',
        borderColor: 'border-purple-700',
    },
    QUESTION: {
        label: '질문',
        icon: HelpCircle,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900/30',
        borderColor: 'border-yellow-700',
    },
    TODO: {
        label: '할 일',
        icon: CheckCircle,
        color: 'text-red-400',
        bgColor: 'bg-red-900/30',
        borderColor: 'border-red-700',
    },
};

export default function ChatMessage({
    id,
    userName,
    message,
    timestamp,
    commitType = 'NONE',
    depth = 0,
    reactions = [],
    replyCount = 0,
    replies = [],
    onReply,
    onReact
}: ChatMessageProps) {
    const [showReactions, setShowReactions] = useState(false);

    // depth limitation
    const maxDepth = 3;
    const actualMargin = Math.min(depth, maxDepth) * 24;

    const handleReact = (emoji: string) => {
        onReact?.(id, emoji);
        setShowReactions(false);
    };

    const typeInfo = commitTypeInfo[commitType];
    const TypeIcon = typeInfo.icon;

    return (
        <div className="relative group" style={{ marginLeft: `${actualMargin}px` }}>
            {/* Thread Line */}
            {depth > 0 && (
                <div
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-700"
                    style={{ left: '-12px' }}
                />
            )}

            <div className="py-3 hover:bg-white/5 px-4 rounded transition-colors">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {/* Avatar */}
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm text-white font-medium">
                            {userName[0]}
                        </div>
                        {/* Name & Time */}
                        <span className="text-sm font-medium text-secondary-foreground">{userName}</span>
                        <span className="text-xs text-muted-foreground">{timestamp}</span>


                        {/* Commit Type Badge - NONE 타입일 때는 태그를 표시하지 않음 */}
                        {commitType !== 'NONE' && (
                            <div className={`flex items-center gap-1 px-2 py-0.5 ${typeInfo.bgColor} border ${typeInfo.borderColor} rounded`}>
                                <TypeIcon className={`w-3 h-3 ${typeInfo.color}`} />
                                <span className={`text-xs font-medium ${typeInfo.color}`}>
                                    {typeInfo.label}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <button className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>

                {/* Message */}
                <div className="text-sm text-secondary-foreground/90 mb-2 pl-10 whitespace-pre-wrap">
                    {message}
                </div>

                {/* Nested Replies */}
                {replies.length > 0 && (
                    <div className="ml-10 mt-2 mb-2 pl-3 border-l-2 border-green-500/50 space-y-2">
                        {replies.map(reply => (
                            <div key={reply.id} className="bg-green-900/30 p-2.5 rounded-lg border border-green-700/50">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-5 h-5 bg-green-800 rounded-full flex items-center justify-center text-[10px] text-green-200 font-medium">
                                        {reply.userName[0]}
                                    </div>
                                    <span className="text-xs font-medium text-green-300">{reply.userName}</span>
                                    <span className="text-[10px] text-green-400/70">{reply.timestamp}</span>
                                </div>
                                <div className="text-sm text-green-100 pl-7">{reply.message}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center gap-3 pl-10">
                    {/* Reactions */}
                    {reactions.length > 0 && (
                        <div className="flex items-center gap-1">
                            {reactions.map((reaction, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleReact(reaction.emoji)}
                                    className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors border border-white/5"
                                >
                                    <span>{reaction.emoji}</span>
                                    <span className="text-muted-foreground">{reaction.count}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Reply Count */}
                    {replyCount > 0 && (
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                            <MessageSquare className="w-3 h-3" />
                            {replyCount}개 답변
                        </button>
                    )}

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Reply Button */}
                        <button
                            onClick={() => onReply?.(id)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Reply className="w-3 h-3" />
                            답변
                        </button>

                        {/* React Button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowReactions(!showReactions)}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Smile className="w-3 h-3" />
                            </button>

                            {/* Reaction Picker */}
                            {showReactions && (
                                <div className="absolute left-0 top-full mt-1 bg-popover border border-border rounded shadow-lg p-2 flex gap-2 z-10">
                                    {['👍', '❤️', '😀', '🎉', '🤔', '👀'].map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleReact(emoji)}
                                            className="text-lg hover:scale-125 transition-transform"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
