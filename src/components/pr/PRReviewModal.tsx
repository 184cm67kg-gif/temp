import { useState } from 'react';
import { X, GitPullRequest, GitCommit, CheckCircle, XCircle, User, GitBranch } from 'lucide-react';
import { useStore } from '../../store/scenarioStore';
import type { PullRequest, Issue } from '../../types';

/**
 * PRReviewModal - PR 리뷰 및 Merge/Reject 결정 모달
 * 
 * 기능:
 * - 커밋 내역 표시
 * - 코멘트 추가 가능
 * - Approve (Merge) - 결정 이유 입력 후 Decision Record 생성
 * - Cut (Close PR) - PR 거절
 */

interface PRReviewModalProps {
    pr: PullRequest;
    issue: Issue;
    onClose: () => void;
    onMerged: (record?: any) => void;
    selectedCommitIds: Set<string>; // 전달받은 선택된 커밋 ID들
}

export function PRReviewModal({ pr, issue, onClose, onMerged, selectedCommitIds }: PRReviewModalProps) {
    const { mergePR, rejectPR } = useStore();
    const [decisionReason, setDecisionReason] = useState('');
    const [decisionContent, setDecisionContent] = useState('');
    const [manualDecisionOpinion, setManualDecisionOpinion] = useState('');
    const [showDecisionForm, setShowDecisionForm] = useState(false);

    // 관련 브랜치 찾기
    const branchIds = pr.fromBranchIds || [pr.fromBranchId];
    const branches = issue.branches.filter(b => branchIds.includes(b.id));
    const allCommits = branches.flatMap(b => b.commits);
    // 선택된 커밋만 필터링해서 보여줌
    const filteredCommits = allCommits.filter(c => selectedCommitIds.has(c.id));

    // Merge 처리
    const handleMerge = () => {
        if (!decisionReason.trim() || !decisionContent.trim() || !manualDecisionOpinion.trim()) {
            alert('모든 필드(결정 내용, 결정 의견, 결정 이유)를 입력해주세요.');
            return;
        }

        try {
            const reasons = decisionReason.split('\n').filter(line => line.trim());
            const record = mergePR(pr.id, reasons, decisionContent, Array.from(selectedCommitIds), manualDecisionOpinion);

            // 성공 알림 없이 바로 닫기 (요청사항: 팝업이 꺼지고...)
            onMerged(record); // 상위 모달 닫기 및 레코드 전달
            onClose(); // 현재 모달 닫기
        } catch (error) {
            console.error('Merge failed:', error);
            alert('Merge 처리 중 오류가 발생했습니다.');
        }
    };

    // Reject 처리
    const handleReject = () => {
        rejectPR(pr.id);
        onClose();
    };

    // 커밋 타입별 색상
    const getCommitTypeColor = (type: string) => {
        switch (type) {
            case 'INFO': return 'bg-blue-900/30 text-blue-300 border-blue-800';
            case 'OPINION': return 'bg-purple-900/30 text-purple-300 border-purple-800';
            case 'QUESTION': return 'bg-yellow-900/30 text-yellow-300 border-yellow-800';
            case 'TODO': return 'bg-red-900/30 text-red-300 border-red-800';
            default: return 'bg-gray-700 text-gray-300 border-gray-600';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <GitPullRequest className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">PR 리뷰</h2>
                            <p className="text-sm text-gray-400">{pr.title}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-1 min-h-0">
                    {/* 왼쪽: PR 정보 및 결정 폼 */}
                    <div className="flex-1 p-5 overflow-y-auto border-r border-white/10">
                        {/* PR 정보 */}
                        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-300">작성자: {pr.authorId}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <GitBranch className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-300">
                                    브랜치: {branches.map(b => b.name).join(', ')}
                                </span>
                            </div>
                            {pr.description && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                    <p className="text-sm font-medium text-gray-400 mb-1">근거 (PR 생성자 작성)</p>
                                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{pr.description}</p>
                                </div>
                            )}
                        </div>

                        {/* 결정 폼 */}
                        {!showDecisionForm ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDecisionForm(true)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Approve (Merge)
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Cut (Close PR)
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        결정 내용 (Decision)
                                    </label>
                                    <input
                                        type="text"
                                        value={decisionContent}
                                        onChange={(e) => setDecisionContent(e.target.value)}
                                        placeholder="예: 내일 오전 배포 진행"
                                        className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        결정 의견 (Decision Opinion)
                                    </label>
                                    <input
                                        type="text"
                                        value={manualDecisionOpinion}
                                        onChange={(e) => setManualDecisionOpinion(e.target.value)}
                                        placeholder="예: deploy_today 의견 채택"
                                        className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        결정 이유 (결정자 작성) - 한 줄에 하나씩
                                    </label>
                                    <textarea
                                        value={decisionReason}
                                        onChange={(e) => setDecisionReason(e.target.value)}
                                        placeholder="- 이유 1&#10;- 이유 2"
                                        className="w-full h-32 bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleMerge}
                                        disabled={!decisionContent.trim() || !decisionReason.trim() || !manualDecisionOpinion.trim()}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Decision Record 생성 및 Merge
                                    </button>
                                    <button
                                        onClick={() => setShowDecisionForm(false)}
                                        className="px-4 py-3 text-gray-400 hover:text-white transition-colors"
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 오른쪽: 커밋 내역 */}
                    <div className="w-80 bg-gray-900/50 flex flex-col">
                        <div className="p-4 border-b border-white/10 bg-gray-800/30">
                            <h3 className="font-medium text-gray-300 flex items-center gap-2">
                                <GitCommit className="w-4 h-4" />
                                커밋 내역 ({filteredCommits.length} / {allCommits.length})
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">이전 화면에서 선택된 커밋들이 반영됩니다.</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {allCommits.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">
                                    커밋이 없습니다.
                                </p>
                            ) : (
                                filteredCommits.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-8">
                                        선택된 커밋이 없습니다.
                                    </p>
                                ) : (
                                    filteredCommits.map((commit) => (
                                        <div
                                            key={commit.id}
                                            className="bg-gray-800 border border-white/20 rounded-lg p-3 text-sm"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getCommitTypeColor(commit.type)}`}>
                                                        {commit.type}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{commit.authorId}</span>
                                                </div>
                                                <p className="text-gray-300 line-clamp-2">{commit.message}</p>
                                            </div>
                                        </div>
                                    ))
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
