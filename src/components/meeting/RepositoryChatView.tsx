import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Send, MessageSquare, FileText, Clock, Plus } from 'lucide-react';
import { useStore } from '../../store/scenarioStore';
import { DecisionRecordModal } from '../pr/DecisionRecordModal';
import type { DecisionRecord } from '../../types';

/**
 * RepositoryChatView - 레포지토리 레벨 채팅 화면
 * 
 * 기능:
 * - 왼쪽: 휘발성 자유 채팅 (드롭다운 없음, 무조건 휘발)
 * - 오른쪽: 이슈 목록 (클릭 시 이슈로 이동)
 * - Decision Record 아이콘 있으면 클릭 시 팝업
 */

export function RepositoryChatView() {
    const { repoId } = useParams();
    const { issues, currentUser, currentRepo, repoChats, addRepoChat, decisionRecords } = useStore();

    const [messageInput, setMessageInput] = useState('');
    const [selectedDecisionRecord, setSelectedDecisionRecord] = useState<DecisionRecord | null>(null);

    // 현재 레포의 이슈들
    const repoIssues = issues.filter(i => i.repoId === repoId || i.repoId === currentRepo?.id);

    // 이슈에 연결된 Decision Record 찾기
    const getDecisionRecord = (issueId: string): DecisionRecord | null => {
        return decisionRecords.find(dr => dr.issueId === issueId) || null;
    };

    // 메시지 전송 (휘발성)
    const handleSendMessage = () => {
        if (!messageInput.trim() || !currentUser) return;

        addRepoChat({
            userId: currentUser.id,
            userName: currentUser.name,
            message: messageInput.trim()
        });

        setMessageInput('');
    };

    // 이슈 상태 색상
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-orange-900/30 text-orange-300 border-orange-800';
            case 'REVIEW': return 'bg-blue-900/30 text-blue-300 border-blue-800';
            case 'CLOSED': return 'bg-green-900/30 text-green-300 border-green-800';
            default: return 'bg-gray-700 text-gray-300 border-gray-600';
        }
    };

    return (
        <div className="flex h-full bg-background text-foreground">
            {/* 왼쪽: 휘발 채팅 */}
            <div className="flex-1 flex flex-col border-r border-border">
                {/* 헤더 */}
                <header className="h-14 px-6 flex items-center justify-between border-b border-border bg-secondary/10">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        <div>
                            <h1 className="font-semibold">{currentRepo?.name || '레포지토리'}</h1>
                            <p className="text-xs text-muted-foreground">자유 채팅 (휘발)</p>
                        </div>
                    </div>
                </header>



                {/* 채팅 메시지 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {repoChats.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                            <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
                            <p className="text-sm">아직 채팅이 없습니다.</p>
                            <p className="text-xs mt-1">자유롭게 대화를 시작하세요.</p>
                        </div>
                    ) : (
                        repoChats.map((chat) => (
                            <div key={chat.id} className="flex gap-3">
                                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                    {chat.userName[0]}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-sm font-medium">{chat.userName}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(chat.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="p-2 bg-secondary/30 border border-border rounded text-sm">
                                        {chat.message}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 입력 영역 - 드롭다운 없음 */}
                <div className="p-4 bg-secondary/10 border-t border-border">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="자유 채팅 (휘발)..."
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

            {/* 오른쪽: 이슈 목록 */}
            <div className="w-96 flex flex-col bg-secondary/5">
                <header className="h-14 px-5 flex items-center justify-between border-b border-border">
                    <h2 className="font-semibold">안건 (Issues)</h2>
                    <span className="text-xs text-muted-foreground">{repoIssues.length}</span>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {repoIssues.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            아직 등록된 안건이 없습니다.
                        </div>
                    ) : (
                        repoIssues.map((issue) => {
                            const dr = getDecisionRecord(issue.id);
                            return (
                                <div
                                    key={issue.id}
                                    className="p-4 bg-secondary/30 border border-border rounded hover:border-primary/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <Link
                                            to={`/issue/${encodeURIComponent(issue.id)}`}
                                            className="flex-1 block hover:text-primary transition-colors"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-sm font-medium truncate">{issue.title}</h3>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getStatusColor(issue.status)}`}>
                                                    {issue.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span>작성자: {issue.author}</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(issue.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </Link>

                                        {/* Decision Record 아이콘 */}
                                        {dr && (
                                            <button
                                                onClick={() => setSelectedDecisionRecord(dr)}
                                                className="ml-2 p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors"
                                                title="Decision Record 보기"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* 안건 생성 버튼 */}
                <div className="p-4 border-t border-border">
                    <Link
                        to="/"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm rounded transition-colors font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Dashboard에서 안건 생성
                    </Link>
                </div>
            </div>

            {/* Decision Record 모달 */}
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
