import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, GitPullRequest, GitBranch, GitCommit, User, Clock, CheckCircle, XCircle, MessageSquare, Eye } from 'lucide-react';
import type { PullRequest, Issue, DecisionRecord } from '../../types';
import { PRReviewModal } from './PRReviewModal';
import { useStore } from '../../store/scenarioStore';

/**
 * PRDetailModal - PR 상세 정보를 표시하는 모달
 */

interface PRDetailModalProps {
    pr: PullRequest;
    issue: Issue;
    onClose: () => void;
    onBack?: () => void; // 목록으로 돌아가기
    onRecordCreated?: (record: DecisionRecord) => void;
}

export function PRDetailModal({ pr, issue, onClose, onBack, onRecordCreated }: PRDetailModalProps) {
    const { currentUser, addReview, deleteReview, pullRequests } = useStore();

    // Store에서 최신 PR 정보 가져오기 (Reactivity 보장)
    const currentPR = pullRequests.find(p => p.id === pr.id) || pr;

    // 멀티 브랜치 PR 여부
    const isMultiBranch = currentPR.fromBranchIds && currentPR.fromBranchIds.length > 1;

    // 관련 브랜치들 가져오기
    const relatedBranches = issue.branches.filter(b => {
        if (isMultiBranch) {
            return currentPR.fromBranchIds!.includes(b.id);
        }
        return b.id === currentPR.fromBranchId;
    });

    // 모든 관련 커밋
    const allDetailCommits = relatedBranches.flatMap(b => b.commits);

    // 현재 선택된 브랜치 탭 (멀티 브랜치용)
    const [activeTab, setActiveTab] = useState<string>(relatedBranches[0]?.id || '');

    // 리뷰 모달 상태
    const [showReviewModal, setShowReviewModal] = useState(false);

    // 결과(Decision Record) 모달 상태 - Removed (Lifted up)

    // 커밋 선택 상태 관리 (기본값: 모두 선택)
    const [selectedCommitIds, setSelectedCommitIds] = useState<Set<string>>(() => {
        return new Set(allDetailCommits.map(c => c.id));
    });

    // 리뷰 입력 상태
    const [reviewInput, setReviewInput] = useState('');

    // 현재 활성 브랜치
    const activeBranch = relatedBranches.find(b => b.id === activeTab);

    // 커밋 토글 핸들러
    const toggleCommit = (commitId: string) => {
        setSelectedCommitIds(prev => {
            const next = new Set(prev);
            if (next.has(commitId)) {
                next.delete(commitId);
            } else {
                next.add(commitId);
            }
            return next;
        });
    };

    // 리뷰 등록 핸들러
    const handleAddReview = () => {
        if (!reviewInput.trim() || !currentUser) return;

        addReview(currentPR.id, {
            id: `review-${Date.now()}`,
            reviewerId: currentUser.id,
            comment: reviewInput.trim(),
            status: 'COMMENT',
            createdAt: new Date().toISOString()
        });
        setReviewInput('');
    };

    // 리뷰 삭제 핸들러
    const handleDeleteReview = (reviewId: string) => {
        if (confirm('리뷰를 삭제하시겠습니까?')) {
            deleteReview(currentPR.id, reviewId);
        }
    };

    // Merge 완료 핸들러
    const handleMerged = (record?: DecisionRecord) => {
        // 모달 닫기
        setShowReviewModal(false);

        if (record && onRecordCreated) {
            onRecordCreated(record);
            // After calling this, the parent (IssueDetailView) will likely close this modal
            // and open the DecisionRecordModal.
        } else {
            // Fallback if no record returned or no handler (shouldn't happen with correct usage)
            // Just close
            onClose();
        }
    };

    // 상태에 따른 스타일
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'MERGED': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'REJECTED': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                            >
                                ← 목록으로
                            </button>
                        )}
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isMultiBranch ? 'bg-purple-500/20' : 'bg-blue-500/20'}`}>
                                <GitPullRequest className={`w-6 h-6 ${isMultiBranch ? 'text-purple-400' : 'text-blue-400'}`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-white">{currentPR.title}</h2>
                                    {isMultiBranch && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                            멀티 브랜치
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                                    <span className="flex items-center gap-1">
                                        <span className="text-gray-600">#</span>
                                        {currentPR.id.split('-')[1]}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded border text-xs ${getStatusStyle(currentPR.status)}`}>
                                        {currentPR.status}
                                    </span>
                                    {isMultiBranch && (
                                        <span className="flex items-center gap-1">
                                            <GitBranch className="w-3 h-3" />
                                            {currentPR.fromBranchIds!.length}개 브랜치
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* 메인 컨텐츠 */}
                <div className="flex flex-1 min-h-0 overflow-hidden">
                    {/* 왼쪽: PR 정보 */}
                    <div className="w-1/2 p-6 overflow-y-auto border-r border-white/10">
                        {/* PR 설명 */}
                        {currentPR.description && (
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-400 mb-2">설명</h3>
                                <p className="text-white text-sm bg-gray-800 border border-white/10 rounded-lg p-4">
                                    {currentPR.description}
                                </p>
                            </div>
                        )}

                        {/* 메타 정보 */}
                        <div className="mb-6 space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-400">작성자:</span>
                                <span className="text-white">{currentPR.authorId}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-400">생성일:</span>
                                <span className="text-white">{new Date(currentPR.createdAt).toLocaleString('ko-KR')}</span>
                            </div>
                        </div>

                        {/* 브랜치 목록 (멀티 브랜치인 경우) */}
                        {isMultiBranch && (
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-400 mb-3">포함된 브랜치</h3>
                                <div className="space-y-2">
                                    {relatedBranches.map(branch => (
                                        <div
                                            key={branch.id}
                                            className="flex items-center gap-2 p-2 bg-gray-800 border border-white/10 rounded-lg text-sm"
                                        >
                                            <GitBranch className="w-4 h-4 text-purple-400" />
                                            <span className="text-white">{branch.name}</span>
                                            <span className="text-gray-500 ml-auto">
                                                {branch.commits.length} commits
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 리뷰 섹션 */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-400 mb-3">리뷰</h3>

                            {/* 리뷰 목록 (위로 이동됨) */}
                            {currentPR.reviews.length === 0 ? (
                                <div className="text-center py-6 text-gray-500 text-sm bg-gray-800/50 rounded-lg mb-4">
                                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    아직 리뷰가 없습니다.
                                </div>
                            ) : (
                                <div className="space-y-3 mb-4">
                                    {currentPR.reviews.map((review, idx) => (
                                        <div key={review.id || idx} className="p-3 bg-gray-800 border border-white/10 rounded-lg group">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {review.status === 'APPROVE' ? (
                                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                                    ) : review.status === 'REQUEST_CHANGES' ? (
                                                        <XCircle className="w-4 h-4 text-red-400" />
                                                    ) : (
                                                        <MessageSquare className="w-4 h-4 text-blue-400" />
                                                    )}
                                                    <span className="text-sm text-white">{review.reviewerId}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(review.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteReview(review.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 리뷰 입력 (아래로 이동됨 - OPEN 상태일 때만) */}
                            {currentPR.status === 'OPEN' && (
                                <div className="mt-4">
                                    <textarea
                                        value={reviewInput}
                                        onChange={(e) => setReviewInput(e.target.value)}
                                        placeholder="리뷰를 남겨주세요..."
                                        className="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none h-20 mb-2"
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleAddReview}
                                            disabled={!reviewInput.trim()}
                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-md transition-colors disabled:opacity-50"
                                        >
                                            리뷰 등록
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 오른쪽: 커밋 내역 */}
                    <div className="w-1/2 bg-gray-900/50 flex flex-col">
                        <div className="p-4 border-b border-white/10 bg-gray-800/30">
                            <h3 className="font-medium text-gray-300 flex items-center gap-2">
                                <GitCommit className="w-4 h-4" />
                                {isMultiBranch ? '브랜치별 커밋 내역' : '커밋 내역'}
                            </h3>
                            {/* 선택된 커밋 수 표시 */}
                            <p className="text-xs text-gray-500 mt-1">
                                {selectedCommitIds.size} / {allDetailCommits.length} 커밋 선택됨
                            </p>
                        </div>

                        {/* 멀티 브랜치: 탭 UI */}
                        {isMultiBranch && (
                            <div className="flex border-b border-white/10 overflow-x-auto">
                                {relatedBranches.map(branch => (
                                    <button
                                        key={branch.id}
                                        onClick={() => setActiveTab(branch.id)}
                                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === branch.id
                                            ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {branch.name}
                                        <span className="ml-1 text-xs text-gray-500">
                                            ({branch.commits.length})
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* 커밋 목록 */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {activeBranch ? (
                                activeBranch.commits.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-8">
                                        이 브랜치에는 커밋이 없습니다.
                                    </p>
                                ) : (
                                    activeBranch.commits.map((commit, idx) => (
                                        <div
                                            key={commit.id || idx}
                                            className={`bg-gray-800 border rounded-lg p-3 text-sm transition-all ${selectedCommitIds.has(commit.id)
                                                ? 'border-white/30 opacity-100'
                                                : 'border-white/5 opacity-50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* 체크박스 */}
                                                <div className="pt-0.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCommitIds.has(commit.id)}
                                                        onChange={() => toggleCommit(commit.id)}
                                                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500/50 cursor-pointer"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${commit.type === 'INFO' ? 'bg-blue-900/30 text-blue-300 border-blue-800' :
                                                            commit.type === 'OPINION' ? 'bg-purple-900/30 text-purple-300 border-purple-800' :
                                                                commit.type === 'QUESTION' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-800' :
                                                                    commit.type === 'TODO' ? 'bg-red-900/30 text-red-300 border-red-800' :
                                                                        'bg-gray-700 text-gray-300 border-gray-600'
                                                            }`}>
                                                            {commit.type}
                                                        </span>
                                                        <span className="text-xs text-gray-500 font-mono">#{idx + 1}</span>
                                                    </div>
                                                    <p className="text-gray-300">{commit.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-8">
                                    브랜치 정보를 찾을 수 없습니다.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 푸터 (액션 버튼) */}
                <div className="p-4 border-t border-white/10 bg-gray-800/30 flex justify-between items-center">
                    <div>
                        {pr.status === 'OPEN' && (
                            <span className="text-xs text-gray-400">
                                리뷰하여 Merge 또는 Reject할 수 있습니다.
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {pr.status === 'OPEN' && (
                            <button
                                onClick={() => setShowReviewModal(true)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Eye className="w-4 h-4" />
                                리뷰 완료
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>

            {/* PR 리뷰 모달 */}
            {showReviewModal && (
                createPortal(
                    <PRReviewModal
                        pr={currentPR}
                        issue={issue}
                        onClose={() => setShowReviewModal(false)}
                        onMerged={handleMerged}
                        selectedCommitIds={selectedCommitIds} // 선택된 커밋 ID 전달
                    />,
                    document.body
                )
            )}
        </div>
    );
}
