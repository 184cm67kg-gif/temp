import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronRight, Plus, UserPlus, CornerDownRight } from 'lucide-react';
import { useStore } from '../../store/scenarioStore';
import { cn } from '../../lib/utils';
import { DirectChatPopup } from '../chat/DirectChatPopup';

export function Sidebar() {
    const { currentTeam, issues, currentUser, activeIssueId, activeBranchId, createIssue, pullRequests } = useStore();


    // Mock Data for sidebar visuals
    const teams = [
        { id: 't1', name: 'Frontend Team', active: true },
        { id: 't2', name: 'Backend Team', active: false }
    ];

    const meetings = [
        { id: 'm1', name: 'Q1 기술 스택 선정', unread: 5 },
        { id: 'm2', name: '아키텍처 설계 회의', unread: 3 },
        { id: 'm3', name: 'API 구조 논의', unread: 8 },
        // Current repo - this acts as the root for our actual content
        { id: 'r1', name: 'v1.0 배포 전략 회의', unread: 0, active: true, isRepo: true },
    ];

    const friends: { id: string; name: string; status: 'ONLINE' | 'AWAY' | 'OFFLINE' }[] = [
        { id: 'u2', name: '박영희', status: 'ONLINE' },
        { id: 'u3', name: '이민수', status: 'AWAY' },
        { id: 'u4', name: '정수민', status: 'OFFLINE' },
    ];

    const [sections, setSections] = useState({
        teams: true,
        meetings: true,
        friends: true
    });

    // Toggle for the active meeting's tree view
    const [isRepoExpanded, setIsRepoExpanded] = useState(true);

    // 1:1 채팅 상태 관리
    const [activeChatFriend, setActiveChatFriend] = useState<{ id: string; name: string; status: 'ONLINE' | 'AWAY' | 'OFFLINE' } | null>(null);

    const toggleSection = (section: keyof typeof sections) => {
        setSections(prev => ({ ...prev, [section]: !prev[section] }));
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

    return (
        <div className="h-screen w-64 bg-[#0F1117] text-gray-300 border-r border-white/5 flex flex-col font-sans">
            {/* App Header */}
            <div className="p-6 pb-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">Loggy</h1>
                <p className="text-sm text-gray-500 font-medium">Decisions, Logged.</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

                {/* TEAMS Section */}
                <div>
                    <button
                        onClick={() => toggleSection('teams')}
                        className="flex items-center justify-between w-full text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 hover:text-gray-300 transition-colors"
                    >
                        <span>팀 (TEAMS)</span>
                        <div className="flex items-center gap-1">
                            <Plus className="w-3 h-3" />
                        </div>
                    </button>

                    {sections.teams && (
                        <div className="space-y-1">
                            {teams.map(team => (
                                <NavLink
                                    key={team.id}
                                    to="/"
                                    className={({ isActive }) => cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer",
                                        (isActive || team.active) ? "bg-blue-500/10 text-blue-400" : "hover:bg-white/5 text-gray-400"
                                    )}
                                >
                                    <div className={cn("w-1.5 h-1.5 rounded-full", team.active ? "bg-blue-400" : "bg-gray-600")} />
                                    <span>{team.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>

                {/* MEETINGS Section */}
                <div>
                    <button
                        onClick={() => toggleSection('meetings')}
                        className="flex items-center justify-between w-full text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 hover:text-gray-300 transition-colors"
                    >
                        <span>회의 목록 (MEETINGS)</span>
                        <Plus className="w-3 h-3" />
                    </button>

                    {sections.meetings && (
                        <div className="space-y-1">
                            {meetings.map(meeting => (
                                <div key={meeting.id}>
                                    <div
                                        className={cn(
                                            "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors group",
                                            (meeting.active) ? "text-gray-200 bg-white/5" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 truncate flex-1">
                                            {meeting.isRepo ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsRepoExpanded(!isRepoExpanded);
                                                    }}
                                                    className="p-0.5 hover:bg-white/10 rounded"
                                                >
                                                    {isRepoExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                                                </button>
                                            ) : (
                                                <ChevronRight className="w-4 h-4 opacity-70" />
                                            )}

                                            {meeting.isRepo ? (
                                                <NavLink
                                                    to={`/repo/${currentTeam?.id || 'repo1'}`}
                                                    className="truncate flex-1 hover:text-blue-400 transition-colors"
                                                >
                                                    {meeting.name}
                                                </NavLink>
                                            ) : (
                                                <span className="truncate cursor-default">{meeting.name}</span>
                                            )}
                                        </div>
                                        {meeting.unread > 0 && (
                                            <span className="bg-gray-800 text-gray-400 text-[10px] px-1.5 py-0.5 rounded min-w-[20px] text-center ml-2">
                                                {meeting.unread}
                                            </span>
                                        )}
                                    </div>

                                    {/* Render Repo Tree if this is the active repo meeting */}
                                    {meeting.isRepo && isRepoExpanded && (
                                        <div className="ml-2 pl-2 border-l border-white/10 mt-1 space-y-1">
                                            {/* 이슈 추가 버튼 */}
                                            <button
                                                onClick={() => setShowIssueModal(true)}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors w-full text-left"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>이슈 추가</span>
                                            </button>

                                            {issues.map(issue => {
                                                const hasOpenPR = pullRequests?.some(pr =>
                                                    pr.status === 'OPEN' && issue.branches.some(b => b.id === pr.fromBranchId)
                                                );

                                                return (
                                                    <div key={issue.id}>
                                                        <NavLink
                                                            to={`/issue/${encodeURIComponent(issue.id)}`}
                                                            className={({ isActive }) => cn(
                                                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors w-full text-left relative",
                                                                (isActive || activeIssueId === issue.id) ? "text-blue-400 bg-blue-500/10" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                                                            )}
                                                        >
                                                            <CornerDownRight className="w-3.5 h-3.5 opacity-70" />
                                                            <span className="truncate">{issue.title}</span>
                                                            {hasOpenPR && (
                                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                                            )}
                                                        </NavLink>

                                                        {/* Branches */}
                                                        <div className="ml-4 space-y-0.5 border-l border-white/10 pl-2 my-1">
                                                            {issue.branches.map(branch => (
                                                                <NavLink
                                                                    key={branch.id}
                                                                    to={`/branch/${branch.id}`}
                                                                    className={({ isActive }) => cn(
                                                                        "flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-colors",
                                                                        (isActive || activeBranchId === branch.id) ? "text-green-400 bg-green-500/10" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                                                                    )}
                                                                >
                                                                    <CornerDownRight className="w-3 h-3 opacity-70" />
                                                                    <span className="truncate">{branch.name}</span>
                                                                </NavLink>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* FRIENDS Section */}
                <div>
                    <button
                        onClick={() => toggleSection('friends')}
                        className="flex items-center justify-between w-full text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 hover:text-gray-300 transition-colors"
                    >
                        <span>친구 (FRIENDS)</span>
                        <UserPlus className="w-3 h-3" />
                    </button>

                    {sections.friends && (
                        <div className="space-y-3 mt-2">
                            {friends.map(friend => (
                                <div
                                    key={friend.id}
                                    className="flex items-center gap-3 px-2 group cursor-pointer"
                                    onDoubleClick={() => setActiveChatFriend(friend)}
                                >
                                    <div className="relative">
                                        <div className="w-2 h-2 rounded-full absolute -left-1 top-1/2 -translate-y-1/2 bg-transparent"></div> {/* Alignment spacer */}
                                        <span className={cn(
                                            "block w-2 h-2 rounded-full",
                                            friend.status === 'ONLINE' ? 'bg-green-500' :
                                                friend.status === 'AWAY' ? 'bg-yellow-500' : 'bg-gray-600'
                                        )} />
                                    </div>
                                    <span className="text-gray-400 text-sm group-hover:text-gray-200 transition-colors">{friend.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* User Profile (Bottom) */}
            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                        {currentUser?.name?.[0]}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-white">{currentUser?.name}</div>
                        <div className="text-xs text-gray-500">Online</div>
                    </div>
                </div>
            </div>

            {/* 1:1 Direct Chat Popup */}
            {activeChatFriend && (
                <DirectChatPopup
                    friendName={activeChatFriend.name}
                    friendStatus={activeChatFriend.status}
                    onClose={() => setActiveChatFriend(null)}
                />
            )}

            {/* 이슈 추가 모달 */}
            {showIssueModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#1E293B] border border-white/10 rounded-lg p-6 w-[400px] shadow-2xl">
                        <h2 className="text-lg font-bold text-white mb-4">새 이슈 추가</h2>
                        <input
                            type="text"
                            value={newIssueTitle}
                            onChange={(e) => setNewIssueTitle(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateIssue()}
                            placeholder="이슈 제목을 입력하세요..."
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
        </div>
    );
}
