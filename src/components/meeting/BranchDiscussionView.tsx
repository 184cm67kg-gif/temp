import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useStore } from '../../store/scenarioStore';
import { Send, Plus, X, CornerDownRight, ChevronLeft, GitPullRequest } from 'lucide-react';
import { PRCreateModal } from '../pr/PRCreateModal';
import { PRDetailModal } from '../pr/PRDetailModal';
import type { PullRequest, Branch, Issue } from '../../types';

type MessageType = 'NONE' | 'INFO' | 'OPINION' | 'QUESTION' | 'TODO';

interface Message {
    id: number;
    user: string;
    role: string;
    type: MessageType;
    content: string;
    time: string;
    replyTo?: number;
}



const getMessageTypeColor = (type: MessageType) => {
    switch (type) {
        case 'INFO': return 'bg-blue-900/40 text-blue-200 border-blue-800';
        case 'OPINION': return 'bg-purple-900/40 text-purple-200 border-purple-800';
        case 'QUESTION': return 'bg-yellow-900/40 text-yellow-200 border-yellow-800';
        case 'TODO': return 'bg-red-900/40 text-red-200 border-red-800';
        default: return 'bg-gray-800 text-gray-300';
    }
};

export function BranchDiscussionView() {
    const { branchId } = useParams();
    const { issues, currentUser } = useStore();

    const { pullRequests } = useStore();
    const [showPRList, setShowPRList] = useState(false);
    const [showPRModal, setShowPRModal] = useState(false);
    const [showPRDetailModal, setShowPRDetailModal] = useState(false);
    const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null);

    // PR 선택 핸들러
    const handleSelectPR = (pr: PullRequest) => {
        setSelectedPR(pr);
        setShowPRList(false);
        setShowPRDetailModal(true);
    };

    // PR 상세에서 목록으로 돌아가기
    const handleBackToList = () => {
        setShowPRDetailModal(false);
        setSelectedPR(null);
        setShowPRList(true);
    };

    // Find branch context
    let branch: Branch | null = null;
    let issue: Issue | null = null;

    for (const i of issues) {
        const b = i.branches.find(b => b.id === branchId);
        if (b) {
            branch = b;
            issue = i;
            break;
        }
    }

    // 현재 브랜치의 PR 목록 필터링
    const branchPRs = useMemo(() => {
        if (!pullRequests || !branchId) return [];
        return pullRequests
            .filter(pr => pr.fromBranchId === branchId)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [pullRequests, branchId]);

    const [messageInput, setMessageInput] = useState('');
    const [messageType, setMessageType] = useState<MessageType>('NONE');
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);

    // Mock messages
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            user: '김팀장',
            role: 'Project Manager',
            type: 'INFO',
            content: '현재 서버 상태는 정상이며, 배포 가능 시간대는 오후 3시~6시입니다.',
            time: '15:10',
        },
        {
            id: 2,
            user: '박백엔',
            role: 'Backend',
            type: 'OPINION',
            content: '오늘 배포하는 게 좋을 것 같습니다. 내일은 트래픽이 많아서 리스크가 있어요.',
            time: '15:12',
        }
    ]);

    // 커밋 내역은 messages에서 NONE이 아닌 태그 달린 메시지를 자동으로 추출합니다.
    // 질문(QUESTION)의 경우 답글이 있으면 함께 하나의 커밋으로 표시합니다.
    const commits = useMemo(() => {
        const result: { id: number; type: MessageType; content: string; replies?: string[] }[] = [];

        messages.filter(msg => !msg.replyTo && msg.type !== 'NONE').forEach(msg => {
            const replies = messages.filter(m => m.replyTo === msg.id);
            result.push({
                id: msg.id,
                type: msg.type,
                content: msg.content,
                replies: replies.length > 0 ? replies.map(r => r.content) : undefined
            });
        });

        return result;
    }, [messages]);



    const handleSendMessage = () => {
        if (messageInput.trim()) {
            const newMessage: Message = {
                id: Date.now(),
                user: currentUser?.name || 'User',
                role: currentUser?.role || 'Member',
                type: replyingTo ? 'INFO' : messageType,
                content: messageInput,
                time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                replyTo: replyingTo?.id
            };

            setMessages([...messages, newMessage]);
            setMessageInput('');
            setReplyingTo(null);
            setMessageType('INFO');
        }
    };

    const handleReply = (message: Message) => {
        setReplyingTo(message);
        setMessageType('INFO');
    };

    if (!branch || !issue) return <div className="p-8">Branch not found</div>;

    return (
        <div className="h-full flex flex-col bg-background text-foreground">
            {/* Header */}
            <header className="bg-secondary/20 border-b border-border h-14 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <Link to={`/issue/${encodeURIComponent(issue.id)}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-white">
                        <ChevronLeft className="w-4 h-4" />
                        이슈로 돌아가기
                    </Link>
                    <div className="h-4 w-px bg-border"></div>
                    <div className="font-semibold">{branch.name}</div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                        {branch.status}
                    </span>
                </div>
                <div className="flex items-center gap-3 relative">
                    <div className="text-xs text-muted-foreground mr-2">
                        {messages.length}개 메시지
                    </div>

                    {/* PR Button & Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowPRList(!showPRList)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${showPRList ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                                }`}
                        >
                            <GitPullRequest className="w-4 h-4" />
                            <span>PR</span>
                            {branchPRs.length > 0 && (
                                <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                                    {branchPRs.length}
                                </span>
                            )}
                        </button>

                        {/* PR List Dropdown */}
                        {showPRList && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowPRList(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                                    <div className="p-3 border-b border-white/10 flex justify-between items-center bg-gray-800/50">
                                        <span className="text-xs font-medium text-gray-400">Pull Requests</span>
                                        <button
                                            onClick={() => {
                                                setShowPRList(false);
                                                setShowPRModal(true);
                                            }}
                                            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" />
                                            New PR
                                        </button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {branchPRs.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500 text-sm">
                                                No PRs yet
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-white/5">
                                                {branchPRs.map(pr => (
                                                    <div
                                                        key={pr.id}
                                                        onClick={() => handleSelectPR(pr)}
                                                        className="p-3 hover:bg-white/5 transition-colors cursor-pointer group"
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <GitPullRequest className={`w-4 h-4 mt-0.5 ${pr.status === 'MERGED' ? 'text-purple-400' :
                                                                pr.status === 'REJECTED' ? 'text-red-400' : 'text-green-400'
                                                                }`} />
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-medium text-gray-200 group-hover:text-blue-400 transition-colors truncate">
                                                                    {pr.title}
                                                                </h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs text-gray-500">#{pr.id.split('-')[1]}</span>
                                                                    <span className="text-xs text-gray-500">• {new Date(pr.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left: Branch Chat */}
                <div className="flex-1 flex flex-col border-r border-border">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.filter(msg => !msg.replyTo).map((message) => {
                            // Find all replies to this message
                            const replies = messages.filter(m => m.replyTo === message.id);

                            return (
                                <div key={message.id} className="flex gap-3">
                                    {/* Avatar */}
                                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                        {message.user[0]}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className="flex-1 max-w-3xl">
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-sm font-bold opacity-90">
                                                {message.user}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{message.role}</span>
                                            <span className="text-xs text-muted-foreground/50">{message.time}</span>
                                        </div>

                                        <div className="relative group">
                                            <div className={`p-3 border rounded-lg ${message.type === 'NONE' ? 'bg-slate-800/50 text-gray-200 border-slate-700' : getMessageTypeColor(message.type)} bg-opacity-10 backdrop-blur-sm`}>
                                                {/* Message Type Badge - hide for NONE */}
                                                {message.type !== 'NONE' && (
                                                    <div className="mb-2">
                                                        <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-black/20 rounded">
                                                            {message.type === 'INFO' ? '정보' : message.type === 'OPINION' ? '의견' : message.type === 'QUESTION' ? '질문' : message.type === 'TODO' ? '할 일' : message.type}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Content */}
                                                <div className="text-sm leading-relaxed">
                                                    {message.content}
                                                </div>

                                                {/* Reply Action for QUESTION */}
                                                {message.type === 'QUESTION' && (
                                                    <button
                                                        onClick={() => handleReply(message)}
                                                        className="absolute -right-3 -bottom-3 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                                        title="답변"
                                                    >
                                                        <CornerDownRight className="w-3.5 h-3.5" />
                                                    </button>
                                                )}

                                                {/* Nested Replies - 질문 버블 내부에 중첩 표시 */}
                                                {replies.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                                                        {replies.map(reply => (
                                                            <div key={reply.id} className="flex gap-2">
                                                                <div className="w-5 h-5 bg-green-800 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-green-200">
                                                                    {reply.user[0]}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <span className="text-xs font-medium text-green-300">{reply.user}</span>
                                                                        <span className="text-[10px] text-muted-foreground">{reply.time}</span>
                                                                    </div>
                                                                    <div className="text-sm text-green-100">{reply.content}</div>
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

                    {/* Input Area */}
                    <div className="p-4 bg-secondary/10 border-t border-border">
                        {/* Reply Context */}
                        {replyingTo && (
                            <div className="mb-3 p-2 bg-secondary/30 border border-primary/30 rounded flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <CornerDownRight className="w-4 h-4 text-primary" />
                                    <span className="font-medium text-primary">{replyingTo.user}님에게 답변 중</span>
                                    <span className="text-muted-foreground text-xs truncate max-w-[300px]">"{replyingTo.content}"</span>
                                </div>
                                <button
                                    onClick={() => setReplyingTo(null)}
                                    className="p-1 hover:bg-black/20 rounded"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <div className="flex gap-2">
                            {/* Type Selector */}
                            {!replyingTo && (
                                <select
                                    value={messageType}
                                    onChange={(e) => setMessageType(e.target.value as MessageType)}
                                    className="px-3 py-2 bg-secondary border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary h-10"
                                >
                                    <option value="NONE">자유로운 채팅</option>
                                    <option value="INFO">정보</option>
                                    <option value="OPINION">의견</option>
                                    <option value="QUESTION">질문</option>
                                    <option value="TODO">할 일</option>
                                </select>
                            )}

                            {replyingTo && (
                                <div className="px-3 py-2 bg-green-900/50 border border-green-700 text-green-200 rounded text-sm font-bold flex items-center h-10">
                                    ANSWER
                                </div>
                            )}

                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="메시지를 입력하세요..."
                                className="flex-1 px-4 py-2 bg-secondary/20 border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />

                            <button
                                onClick={handleSendMessage}
                                disabled={!messageInput.trim()}
                                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Commit Panel */}
                <aside className="w-72 bg-secondary/5 border-l border-border flex flex-col">
                    <div className="p-4 border-b border-border">
                        <h2 className="text-sm font-semibold mb-1">
                            커밋 내역
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            커밋 목록
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {commits.map((commit) => (
                            <div
                                key={commit.id}
                                className={`p-3 border rounded text-xs ${getMessageTypeColor(commit.type).split(' ')[0]} border-opacity-50`}
                            >
                                <div className="font-bold mb-1 opacity-80">
                                    {commit.type === 'INFO' ? '정보' : commit.type === 'OPINION' ? '의견' : commit.type === 'QUESTION' ? '질문' : commit.type === 'TODO' ? '할 일' : commit.type}
                                </div>
                                <div>{commit.content}</div>
                                {/* 질문의 답글들을 함께 표시 */}
                                {commit.replies && commit.replies.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-white/10">
                                        {commit.replies.map((reply, idx) => (
                                            <div key={idx} className="text-green-300 mt-1">└ {reply}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-border">
                        <button
                            onClick={() => setShowPRModal(true)}
                            className="w-full px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            PR 생성
                        </button>
                    </div>
                </aside>
            </main>

            {/* PR Create Modal */}
            {showPRModal && branch && (
                createPortal(
                    <PRCreateModal
                        branchId={branch.id}
                        branchName={branch.name}
                        issueId={issue.id}
                        commits={commits.map(commit => ({
                            id: String(commit.id),
                            type: commit.type,
                            authorId: currentUser?.id || 'user',
                            message: commit.content,
                            timestamp: new Date().toISOString()
                        }))}
                        onClose={() => setShowPRModal(false)}
                    />,
                    document.body
                )
            )}

            {/* PR 상세 모달 */}
            {showPRDetailModal && selectedPR && issue && (
                createPortal(
                    <PRDetailModal
                        pr={selectedPR}
                        issue={issue}
                        onClose={() => { setShowPRDetailModal(false); setSelectedPR(null); }}
                        onBack={handleBackToList}
                    />,
                    document.body
                )
            )}
        </div>
    );
}
