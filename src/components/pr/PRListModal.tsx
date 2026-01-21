import { X, GitPullRequest, GitBranch, ChevronRight } from 'lucide-react';
import type { PullRequest, Issue } from '../../types';

/**
 * PRListModal - PR 목록을 표시하는 모달
 * 
 * 기능:
 * - 이슈 관련 모든 PR 목록 표시
 * - 단일/멀티 브랜치 PR 구분하여 표시
 * - 클릭 시 상세 보기로 연결
 */

interface PRListModalProps {
    issue: Issue;
    pullRequests: PullRequest[];
    onClose: () => void;
    onSelectPR: (pr: PullRequest) => void;
}

export function PRListModal({ issue, pullRequests, onClose, onSelectPR }: PRListModalProps) {
    // 현재 이슈와 관련된 PR만 필터링
    const issuePRs = pullRequests.filter(pr => {
        // issueId가 있으면 직접 매칭
        if (pr.issueId) {
            return pr.issueId === issue.id;
        }
        // 없으면 브랜치 ID로 매칭
        const branchIds = issue.branches.map(b => b.id);
        if (pr.fromBranchIds) {
            return pr.fromBranchIds.some(id => branchIds.includes(id));
        }
        return branchIds.includes(pr.fromBranchId);
    });

    // PR 상태에 따른 색상
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'text-green-400';
            case 'MERGED': return 'text-purple-400';
            case 'REJECTED': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    // 멀티 브랜치 PR 여부 확인
    const isMultiBranchPR = (pr: PullRequest) => {
        return pr.fromBranchIds && pr.fromBranchIds.length > 1;
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <GitPullRequest className="w-5 h-5 text-blue-400" />
                        <h2 className="text-lg font-bold text-white">Pull Requests</h2>
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                            {issuePRs.length}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* PR 목록 */}
                <div className="flex-1 overflow-y-auto">
                    {issuePRs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <GitPullRequest className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">아직 생성된 PR이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {issuePRs.map(pr => (
                                <div
                                    key={pr.id}
                                    onClick={() => onSelectPR(pr)}
                                    className="p-4 hover:bg-white/5 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-start gap-3">
                                        <GitPullRequest className={`w-5 h-5 mt-0.5 ${getStatusColor(pr.status)}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate">
                                                    {pr.title}
                                                </h3>
                                                {isMultiBranchPR(pr) && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                        멀티 브랜치
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span>#{pr.id.split('-')[1]}</span>
                                                <span>•</span>
                                                <span className={getStatusColor(pr.status)}>{pr.status}</span>
                                                <span>•</span>
                                                <span>{new Date(pr.createdAt).toLocaleDateString()}</span>
                                                {isMultiBranchPR(pr) && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <GitBranch className="w-3 h-3" />
                                                            {pr.fromBranchIds!.length}개 브랜치
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 푸터 */}
                <div className="p-4 border-t border-white/10 bg-gray-800/30">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
