import { useState, useMemo } from 'react';
import { X, GitPullRequest, GitBranch, Check, GitCommit } from 'lucide-react';
import { useStore } from '../../store/scenarioStore';
import type { Issue } from '../../types';

/**
 * MultiBranchPRModal - 여러 브랜치를 선택하여 한 번에 PR 생성하는 모달
 * 
 * 기능:
 * - 이슈 내 모든 브랜치 체크박스로 표시
 * - 2개 이상 선택 시 PR 생성 가능
 * - 선택된 브랜치들의 커밋 내역 표시
 */

interface MultiBranchPRModalProps {
    issue: Issue;
    onClose: () => void;
}

export function MultiBranchPRModal({ issue, onClose }: MultiBranchPRModalProps) {
    const { createPR, currentUser } = useStore();

    // 선택된 브랜치 ID 목록
    const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
    const [description, setDescription] = useState('');

    // 현재 보고 있는 브랜치 탭 (커밋 내역 표시용)
    const [activeTab, setActiveTab] = useState<string | null>(null);

    // 선택된 브랜치들의 정보
    const selectedBranches = useMemo(() => {
        return issue.branches.filter(b => selectedBranchIds.includes(b.id));
    }, [issue.branches, selectedBranchIds]);

    // 브랜치 선택/해제 토글
    const toggleBranch = (branchId: string) => {
        setSelectedBranchIds(prev => {
            if (prev.includes(branchId)) {
                return prev.filter(id => id !== branchId);
            } else {
                return [...prev, branchId];
            }
        });

        // 첫 번째 선택 시 해당 탭을 활성화
        if (!selectedBranchIds.includes(branchId) && !activeTab) {
            setActiveTab(branchId);
        }
    };

    // PR 생성 핸들러
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedBranchIds.length < 2 || !currentUser) return;

        createPR({
            id: `pr-${Date.now()}`,
            title: `Multi-PR-${Date.now()}`, // 제목 자동 생성
            description,
            fromBranchId: selectedBranchIds[0], // 첫 번째 브랜치를 대표로 (하위 호환)
            fromBranchIds: selectedBranchIds, // 모든 선택된 브랜치
            toBranchId: 'main',
            issueId: issue.id,
            authorId: currentUser.id,
            status: 'OPEN',
            reviews: [],
            createdAt: new Date().toISOString(),
        });

        onClose();
    };

    // 선택 가능한 브랜치가 2개 미만이면 안내 메시지
    if (issue.branches.length < 2) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl p-6 max-w-md">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white">멀티 브랜치 PR 생성</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-gray-400 text-sm">
                        멀티 브랜치 PR을 생성하려면 최소 2개 이상의 브랜치가 필요합니다.
                        현재 브랜치 수: {issue.branches.length}개
                    </p>
                    <button
                        onClick={onClose}
                        className="mt-4 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <GitPullRequest className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">멀티 브랜치 PR 생성</h2>
                            <p className="text-sm text-gray-400">
                                여러 브랜치를 선택하여 한 번에 PR을 생성합니다
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-1 min-h-0 overflow-hidden">
                    {/* 왼쪽: 브랜치 선택 및 폼 */}
                    <div className="w-1/2 p-6 overflow-y-auto border-r border-white/10">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* 브랜치 선택 영역 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-3">
                                    브랜치 선택 ({selectedBranchIds.length}개 선택됨)
                                </label>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {issue.branches.map(branch => (
                                        <div
                                            key={branch.id}
                                            onClick={() => toggleBranch(branch.id)}
                                            className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedBranchIds.includes(branch.id)
                                                ? 'bg-purple-500/20 border-purple-500/50'
                                                : 'bg-gray-800 border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedBranchIds.includes(branch.id)
                                                    ? 'bg-purple-500 border-purple-500'
                                                    : 'border-gray-600'
                                                    }`}>
                                                    {selectedBranchIds.includes(branch.id) && (
                                                        <Check className="w-3 h-3 text-white" />
                                                    )}
                                                </div>
                                                <GitBranch className="w-4 h-4 text-gray-400" />
                                                <span className="text-white font-medium">{branch.name}</span>
                                                <span className="text-xs text-gray-500 ml-auto">
                                                    {branch.commits.length} commits
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {selectedBranchIds.length < 2 && (
                                    <p className="text-xs text-yellow-400 mt-2">
                                        ⚠️ 최소 2개 이상의 브랜치를 선택해주세요
                                    </p>
                                )}
                            </div>

                            {/* PR 설명 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    통합 제안 근거 (Rationale)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="선택된 브랜치들의 의견을 종합한 PR 설명을 작성해주세요..."
                                    className="w-full h-32 bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                                    required
                                />
                            </div>

                            {/* 버튼 영역 */}
                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={selectedBranchIds.length < 2}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    멀티 브랜치 PR 생성
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* 오른쪽: 선택된 브랜치들의 커밋 내역 */}
                    <div className="w-1/2 bg-gray-900/50 flex flex-col">
                        <div className="p-4 border-b border-white/10 bg-gray-800/30">
                            <h3 className="font-medium text-gray-300 flex items-center gap-2">
                                <GitCommit className="w-4 h-4" />
                                선택된 브랜치 커밋 내역
                            </h3>
                        </div>

                        {/* 브랜치 탭 */}
                        {selectedBranches.length > 0 ? (
                            <>
                                <div className="flex border-b border-white/10 overflow-x-auto">
                                    {selectedBranches.map(branch => (
                                        <button
                                            key={branch.id}
                                            onClick={() => setActiveTab(branch.id)}
                                            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === branch.id
                                                ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            {branch.name}
                                        </button>
                                    ))}
                                </div>

                                {/* 현재 탭의 커밋 내역 */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {(() => {
                                        const activeBranch = selectedBranches.find(b => b.id === activeTab);
                                        if (!activeBranch) {
                                            return (
                                                <p className="text-sm text-gray-500 text-center py-8">
                                                    탭을 선택하세요
                                                </p>
                                            );
                                        }
                                        if (activeBranch.commits.length === 0) {
                                            return (
                                                <p className="text-sm text-gray-500 text-center py-8">
                                                    이 브랜치에는 커밋이 없습니다.
                                                </p>
                                            );
                                        }
                                        return activeBranch.commits.map((commit, idx) => (
                                            <div key={commit.id || idx} className="bg-gray-800 border border-white/5 rounded-lg p-3 text-sm">
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
                                                <p className="text-gray-300 line-clamp-3">{commit.message}</p>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                                브랜치를 선택하면 커밋 내역이 여기에 표시됩니다
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
