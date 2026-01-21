import { useState, useMemo } from 'react';
import { ChevronLeft, Send, CornerDownRight, GitCommit, Plus, X } from 'lucide-react';
import { useStore } from '../../store/scenarioStore';
import { createPortal } from 'react-dom';
import { PRCreateModal } from '../pr/PRCreateModal';
import type { Branch, Issue, Commit } from '../../types';

/**
 * BranchChatPanel - 이슈 화면 오른쪽에 표시되는 브랜치 채팅 패널
 * 
 * 기능:
 * - 브랜치별 채팅 (이슈 채팅과 동시 사용)
 * - 메시지 유형 선택 (INFO/OPINION/QUESTION/TODO)
 * - PR 생성 버튼
 * - 닫기 버튼 (목록으로 돌아가기)
 */

type MessageType = 'NONE' | 'INFO' | 'OPINION' | 'QUESTION' | 'TODO';

interface Message {
    id: string;
    user: string;
    role: string;
    content: string;
    type: MessageType;
    time: string;
    replyTo?: string;
}

interface BranchChatPanelProps {
    branch: Branch;
    issue: Issue;
    onClose: () => void;
}

// 메시지 타입별 색상
const getMessageTypeColor = (type: MessageType) => {
    switch (type) {
        case 'INFO': return 'bg-sky-900/50 text-sky-200 border-sky-700';
        case 'OPINION': return 'bg-amber-900/50 text-amber-200 border-amber-700';
        case 'QUESTION': return 'bg-purple-900/50 text-purple-200 border-purple-700';
        case 'TODO': return 'bg-rose-900/50 text-rose-200 border-rose-700';
        default: return 'bg-slate-800/50 text-gray-200 border-slate-700';
    }
};

// 커밋에서 메시지 생성
const commitsToMessages = (commits: Commit[]): Message[] => {
    return commits.map((commit, index) => ({
        id: `msg-${index}`,
        user: commit.authorId,
        role: '팀원',
        content: commit.message,
        type: commit.type,
        time: new Date(commit.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }));
};

export function BranchChatPanel({ branch, issue, onClose }: BranchChatPanelProps) {
    const { currentUser, addCommit } = useStore();
    const [messageInput, setMessageInput] = useState('');
    const [messageType, setMessageType] = useState<MessageType>('NONE');
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [showPRModal, setShowPRModal] = useState(false);

    // 커밋을 메시지로 변환
    const messages = useMemo(() => commitsToMessages(branch.commits), [branch.commits]);

    // 커밋 목록 (PR용)
    const commits = useMemo(() => branch.commits.filter(c => c.type !== 'NONE'), [branch.commits]);

    // 메시지 전송
    const handleSendMessage = () => {
        if (!messageInput.trim() || !currentUser) return;

        const commitType = replyingTo ? 'NONE' : messageType;

        addCommit(branch.id, {
            id: `commit-${Date.now()}`,
            type: commitType,
            authorId: currentUser.name,
            message: messageInput.trim(),
            timestamp: new Date().toISOString()
        });

        setMessageInput('');
        setReplyingTo(null);
        setMessageType('NONE');
    };

    // 답변 시작
    const handleReply = (message: Message) => {
        setReplyingTo(message);
    };

    return (
        <>
            <div className="w-full h-full flex flex-col bg-gray-900 border-l border-white/10">
                {/* 헤더 */}
                <header className="h-14 px-4 flex items-center justify-between border-b border-white/10 bg-gray-800/50">
                    <div className="flex items-center gap-2">
                        <GitCommit className="w-4 h-4 text-purple-400" />
                        <span className="font-medium text-sm text-white truncate max-w-[200px]">
                            {branch.name}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                        title="목록으로 돌아가기"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </header>

                {/* 채팅 메시지 */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {messages.filter(msg => !msg.replyTo).map((message) => {
                        const replies = messages.filter(m => m.replyTo === message.id);

                        return (
                            <div key={message.id} className="flex gap-2">
                                <div className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                    {message.user[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-xs font-bold opacity-90">{message.user}</span>
                                        <span className="text-[10px] text-muted-foreground">{message.time}</span>
                                    </div>
                                    <div className="relative group">
                                        <div className={`p-2 border rounded text-xs ${message.type === 'NONE' ? 'bg-slate-800/50 text-gray-200 border-slate-700' : getMessageTypeColor(message.type)}`}>
                                            {message.type !== 'NONE' && (
                                                <div className="mb-1">
                                                    <span className="inline-block px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-black/20 rounded">
                                                        {message.type === 'INFO' ? '정보' : message.type === 'OPINION' ? '의견' : message.type === 'QUESTION' ? '질문' : '할 일'}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="leading-relaxed">{message.content}</div>

                                            {message.type === 'QUESTION' && (
                                                <button
                                                    onClick={() => handleReply(message)}
                                                    className="absolute -right-2 -bottom-2 p-1 bg-primary text-primary-foreground rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                                    title="답변"
                                                >
                                                    <CornerDownRight className="w-3 h-3" />
                                                </button>
                                            )}

                                            {replies.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                                                    {replies.map(reply => (
                                                        <div key={reply.id} className="flex gap-1.5">
                                                            <div className="w-4 h-4 bg-green-800 rounded-full flex items-center justify-center flex-shrink-0 text-[8px] font-bold text-green-200">
                                                                {reply.user[0]}
                                                            </div>
                                                            <div className="flex-1">
                                                                <span className="text-[10px] font-medium text-green-300">{reply.user}</span>
                                                                <div className="text-[11px] text-green-100">{reply.content}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 입력 영역 */}
                <div className="p-3 bg-gray-800/30 border-t border-white/10">
                    {replyingTo && (
                        <div className="mb-2 p-1.5 bg-secondary/30 border border-primary/30 rounded flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                                <CornerDownRight className="w-3 h-3 text-primary" />
                                <span className="font-medium text-primary truncate max-w-[200px]">{replyingTo.user}님에게 답변</span>
                            </div>
                            <button onClick={() => setReplyingTo(null)} className="p-0.5 hover:bg-black/20 rounded">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    <div className="flex gap-1.5">
                        {!replyingTo && (
                            <select
                                value={messageType}
                                onChange={(e) => setMessageType(e.target.value as MessageType)}
                                className="px-2 py-1.5 bg-secondary border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary h-8"
                            >
                                <option value="NONE">자유</option>
                                <option value="INFO">정보</option>
                                <option value="OPINION">의견</option>
                                <option value="QUESTION">질문</option>
                                <option value="TODO">할일</option>
                            </select>
                        )}

                        {replyingTo && (
                            <div className="px-2 py-1.5 bg-green-900/50 border border-green-700 text-green-200 rounded text-xs font-bold flex items-center h-8">
                                답변
                            </div>
                        )}

                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="메시지..."
                            className="flex-1 px-2 py-1.5 bg-secondary/20 border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary h-8"
                        />

                        <button
                            onClick={handleSendMessage}
                            disabled={!messageInput.trim()}
                            className="px-2 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors disabled:opacity-50 h-8"
                        >
                            <Send className="w-3 h-3" />
                        </button>
                    </div>

                    {/* PR 생성 버튼 */}
                    <button
                        onClick={() => setShowPRModal(true)}
                        className="w-full mt-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 border border-border rounded text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                        <Plus className="w-3 h-3" />
                        PR 생성
                    </button>
                </div>
            </div>

            {/* PR 생성 모달 */}
            {showPRModal && (
                createPortal(
                    <PRCreateModal
                        branchId={branch.id}
                        branchName={branch.name}
                        issueId={issue.id}
                        commits={commits}
                        onClose={() => setShowPRModal(false)}
                    />,
                    document.body
                )
            )}
        </>
    );
}
