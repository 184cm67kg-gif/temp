import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
    GitBranch,
    ChevronRight,
    User,
    Trash2,
    Plus,
    GitPullRequest
} from 'lucide-react';
import { useStore } from '../../store/scenarioStore';
import ChatThread, { type Chat } from './ChatThread';
import { BranchChatPanel } from './BranchChatPanel';
import type { CommitType, PullRequest, Branch } from '../../types';
import { MultiBranchPRModal } from '../pr/MultiBranchPRModal';
import { PRListModal } from '../pr/PRListModal';
import { PRDetailModal } from '../pr/PRDetailModal';
import { DecisionRecordModal } from '../pr/DecisionRecordModal';
import type { DecisionRecord } from '../../types';

// Utils
const getBranchStatusColor = (status: string) => {
    switch (status) {
        case 'ACTIVE': return 'text-green-400';
        case 'MERGED': return 'text-blue-400';
        case 'REJECTED': return 'text-red-400';
        default: return 'text-gray-400';
    }
};

export function IssueDetailView() {
    const { issueId } = useParams();
    const { issues, currentUser, currentRepo, createBranch, createIssue, pullRequests } = useStore();

    // PR 관련 상태
    const [showMultiBranchPRModal, setShowMultiBranchPRModal] = useState(false);
    const [showPRListModal, setShowPRListModal] = useState(false);
    const [showPRDetailModal, setShowPRDetailModal] = useState(false);
    const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null);
    const [selectedDecisionRecord, setSelectedDecisionRecord] = useState<DecisionRecord | null>(null);

    // 브랜치 채팅 패널 상태 (오른쪽 패널용)
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

    // 브랜치 선택 핸들러
    const handleBranchClick = (branch: Branch) => {
        setSelectedBranch(branch);
    };

    // 브랜치 패널 닫기
    const handleCloseBranchPanel = () => {
        setSelectedBranch(null);
    };

    // PR 선택 핸들러
    const handleSelectPR = (pr: PullRequest) => {
        setSelectedPR(pr);
        setShowPRListModal(false);
        setShowPRDetailModal(true);
    };

    // PR 상세에서 목록으로 돌아가기
    const handleBackToList = () => {
        setShowPRDetailModal(false);
        setSelectedPR(null);
        setShowPRListModal(true);
    };

    const issue = issues.find(i => i.id === issueId);
    const isAuthor = issue?.author === currentUser?.name; // Simplification

    // Local state for chat - normally this would be in store or separate query
    const [chats, setChats] = useState<Chat[]>([
        {
            id: '1',
            userName: '김철수',
            message: '오늘 아니면 내일 둘 중 선택해야 할 거 같아요',
            timestamp: '14:20',
            commitType: 'NONE',
            refChatId: null,
            reactions: []
        },
        {
            id: '2',
            userName: '박영희',
            message: '그게 좋을 거 같아요',
            timestamp: '14:22',
            commitType: 'NONE',
            refChatId: null,
            reactions: [
                { emoji: '👍', count: 2, users: ['김철수', '이민수'] }
            ]
        },
    ]);

    if (!issue) {
        return <div className="p-8 text-center text-muted-foreground">Issue not found</div>;
    }

    // 브랜치 추가 모달 상태
    const [showBranchModal, setShowBranchModal] = useState(false);
    const [newBranchName, setNewBranchName] = useState('');

    // 브랜치 생성 핸들러
    const handleCreateBranch = () => {
        if (!newBranchName.trim()) return;

        const newBranch = {
            id: `b_${Date.now() % 10000}`,
            name: newBranchName.trim(),
            issueId: issue.id,
            status: 'ACTIVE' as const,
            commits: [],
            createdAt: new Date().toISOString(),
            creatorId: currentUser?.id || 'u1'
        };

        createBranch(newBranch);
        setNewBranchName('');
        setShowBranchModal(false);
    };

    // 이슈 추가 모달 상태
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [newIssueTitle, setNewIssueTitle] = useState('');

    // 이슈 생성 핸들러
    const handleCreateIssue = () => {
        if (!newIssueTitle.trim()) return;

        const newIssue = {
            id: `#${Date.now() % 100}`,
            title: newIssueTitle.trim(),
            description: '',
            author: currentUser?.name || '익명',
            createdAt: new Date().toISOString(),
            status: 'OPEN' as const,
            branches: [],
            repoId: 'repo1',
            maintainerId: currentUser?.id || 'u1'
        };

        createIssue(newIssue);
        setNewIssueTitle('');
        setShowIssueModal(false);
    };

    const handleSendMessage = (message: string, commitType: CommitType, refChatId?: string) => {
        const newChat: Chat = {
            id: String(Date.now()),
            userName: currentUser?.name || 'Unknown',
            message,
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            commitType,
            refChatId: refChatId || null,
            reactions: []
        };
        setChats([...chats, newChat]);
    };

    const handleReact = (chatId: string, emoji: string) => {
        setChats(chats.map(chat => {
            if (chat.id === chatId) {
                const existingReaction = chat.reactions?.find(r => r.emoji === emoji);
                if (existingReaction) {
                    return {
                        ...chat,
                        reactions: chat.reactions?.filter(r => r.emoji !== emoji)
                    };
                } else {
                    return {
                        ...chat,
                        reactions: [
                            ...(chat.reactions || []),
                            { emoji, count: 1, users: [currentUser?.name || 'Me'] }
                        ]
                    };
                }
            }
            return chat;
        }));
    };

    return (
        <div className="flex h-full bg-background text-foreground overflow-hidden">
            {/* Left: Chat Log */}
            <div className="flex-1 flex flex-col border-r border-border min-w-0">
                {/* Chat Header */}
                <div className="bg-secondary/30 border-b border-border px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Link to="/" className="hover:text-foreground transition-colors">
                            Dashboard
                        </Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-foreground">{currentRepo?.name}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-foreground">#{issue.id}</span>
                    </div>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-xl font-bold truncate">
                                    {issue.title}
                                </h1>
                                <span className={`px-2 py-0.5 text-xs rounded border flex items-center gap-1 ${issue.status === 'OPEN'
                                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                                    : issue.status === 'REVIEW'
                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                        : 'bg-green-500/10 text-green-400 border-green-500/30'
                                    }`}>
                                    <span className="text-sm">
                                        {issue.status === 'OPEN' ? '🔥' : issue.status === 'REVIEW' ? '👀' : '✅'}
                                    </span>
                                    {issue.status === 'OPEN' ? '논의 중' : issue.status === 'REVIEW' ? '리뷰 중' : '결정 완료'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {issue.author}
                                </span>
                                <span>{issue.createdAt}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* PR 버튼 - 이슈/브랜치 화면 모두에서 표시 */}
                            <button
                                onClick={() => setShowPRListModal(true)}
                                className="px-3 py-1.5 text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded transition-colors flex items-center gap-1"
                            >
                                <GitPullRequest className="w-3 h-3" />
                                PR
                                {pullRequests.filter(pr => pr.issueId === issue?.id).length > 0 && (
                                    <span className="bg-blue-500 text-white text-[10px] px-1 py-0.5 rounded-full ml-1">
                                        {pullRequests.filter(pr => pr.issueId === issue?.id).length}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setShowIssueModal(true)}
                                className="px-3 py-1.5 text-xs font-medium bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded transition-colors flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" />
                                안건 추가
                            </button>

                            {/* Actions Placeholder */}
                            {isAuthor && (
                                <button className="p-1 hover:bg-red-500/10 hover:text-red-400 rounded transition-colors text-muted-foreground">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Chat Thread */}
                <ChatThread
                    chats={chats}
                    onSendMessage={handleSendMessage}
                    onReact={handleReact}
                    allowCommitTypes={true}
                />
            </div>


            {/* Right: Branches or Chat Panel */}
            <div className="w-80 flex flex-col bg-secondary/10 border-l border-border transition-all duration-300">
                {selectedBranch ? (
                    <BranchChatPanel
                        branch={selectedBranch}
                        issue={issue}
                        onClose={handleCloseBranchPanel}
                    />
                ) : (
                    <>
                        {/* Branches Header */}
                        <div className="border-b border-border px-5 py-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <GitBranch className="w-4 h-4 text-muted-foreground" />
                                    <h2 className="text-base font-semibold">Branches</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{issue.branches.length}</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Discuss separately in branches
                            </p>
                        </div>

                        {/* Branch List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {issue.branches.map((branch) => (
                                <div
                                    key={branch.id}
                                    onClick={() => handleBranchClick(branch)}
                                    className={`p-3 bg-secondary/30 border rounded cursor-pointer transition-colors ${selectedBranch?.id === branch.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    <div className="flex items-start gap-3 mb-2">
                                        <GitBranch className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h3 className="text-sm font-medium truncate">
                                                    {branch.name}
                                                </h3>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-[10px] font-bold ${getBranchStatusColor(branch.status)}`}>
                                                    {branch.status}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {branch.commits.length} commits
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {issue.branches.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No branches yet. Create one to start detailed discussion.
                                </div>
                            )}
                        </div>

                        {/* 버튼 영역 */}
                        <div className="border-t border-border p-4 space-y-2">
                            {/* 멀티 브랜치 PR 생성 버튼 - Add Branch 위에 배치 */}
                            {issue.branches.length >= 2 && (
                                <button
                                    onClick={() => setShowMultiBranchPRModal(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded transition-colors font-medium"
                                >
                                    <GitPullRequest className="w-4 h-4" />
                                    브랜치들 한 번에 PR 생성
                                </button>
                            )}

                            {/* Add Branch 버튼 */}
                            <button
                                onClick={() => setShowBranchModal(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm rounded transition-colors font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Add Branch
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* 브랜치 추가 모달 */}
            {showBranchModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#1E293B] border border-white/10 rounded-lg p-6 w-[400px] shadow-2xl">
                        <h2 className="text-lg font-bold text-white mb-4">새 브랜치 추가</h2>
                        <input
                            type="text"
                            value={newBranchName}
                            onChange={(e) => setNewBranchName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateBranch()}
                            placeholder="브랜치 이름을 입력하세요..."
                            className="w-full px-3 py-2 bg-[#0F172A] border border-white/10 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-4"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => { setShowBranchModal(false); setNewBranchName(''); }}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleCreateBranch}
                                disabled={!newBranchName.trim()}
                                className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                생성
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 이슈 추가 모달 */}
            {showIssueModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#1E293B] border border-white/10 rounded-lg p-6 w-[400px] shadow-2xl">
                        <h2 className="text-lg font-bold text-white mb-4">새 안건 추가</h2>
                        <input
                            type="text"
                            value={newIssueTitle}
                            onChange={(e) => setNewIssueTitle(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateIssue()}
                            placeholder="안건 제목을 입력하세요..."
                            className="w-full px-3 py-2 bg-[#0F172A] border border-white/10 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-4"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => { setShowIssueModal(false); setNewIssueTitle(''); }}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleCreateIssue}
                                disabled={!newIssueTitle.trim()}
                                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                생성
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 멀티 브랜치 PR 생성 모달 */}
            {showMultiBranchPRModal && issue && (
                createPortal(
                    <MultiBranchPRModal
                        issue={issue}
                        onClose={() => setShowMultiBranchPRModal(false)}
                    />,
                    document.body
                )
            )}

            {/* PR 목록 모달 */}
            {showPRListModal && issue && (
                createPortal(
                    <PRListModal
                        issue={issue}
                        pullRequests={pullRequests}
                        onClose={() => setShowPRListModal(false)}
                        onSelectPR={handleSelectPR}
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
                        onRecordCreated={(record) => {
                            // PR 모달을 닫고 의사결정 레코드 모달을 오픈
                            setShowPRDetailModal(false);
                            // setSelectedPR(null); // Optional: keep context or clear
                            setSelectedDecisionRecord(record);
                        }}
                    />,
                    document.body
                )
            )}

            {/* Decision Record 모달 (Global for Issue Detail) */}
            {selectedDecisionRecord && (
                createPortal(
                    <DecisionRecordModal
                        record={selectedDecisionRecord}
                        onClose={() => setSelectedDecisionRecord(null)}
                    />,
                    document.body
                )
            )}

        </div>
    );
}
