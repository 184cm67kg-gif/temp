import { useState } from 'react';
import { X, GitPullRequest, GitCommit } from 'lucide-react';
import { useStore } from '../../store/scenarioStore';
import type { Commit } from '../../types';

interface PRCreateModalProps {
    branchId: string;
    branchName: string;
    issueId: string;
    commits: Commit[];
    onClose: () => void;
}

export function PRCreateModal({ branchId, branchName, issueId, commits, onClose }: PRCreateModalProps) {
    const { createPR, currentUser } = useStore();
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !issueId) return;

        createPR({
            id: `pr-${Date.now()}`,
            title: `PR-${branchName}`, // 제목 자동 생성
            description,
            fromBranchId: branchId,
            toBranchId: 'main',
            issueId,
            authorId: currentUser.id,
            status: 'OPEN',
            reviews: [],
            createdAt: new Date().toISOString(),
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <GitPullRequest className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Create Pull Request</h2>
                            <p className="text-sm text-gray-400">Propose changes from <span className="text-blue-400 font-mono">{branchName}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-1 min-h-0">
                    {/* Left: Input Form */}
                    <div className="flex-1 p-6 overflow-y-auto border-r border-white/10">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    제안 근거 (Rationale)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="결정 제안에 대한 근거를 작성해주세요. 우측의 커밋 내역을 참고할 수 있습니다."
                                    className="w-full h-64 bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create Pull Request
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right: Reference Commits */}
                    <div className="w-80 bg-gray-900/50 flex flex-col">
                        <div className="p-4 border-b border-white/10 bg-gray-800/30">
                            <h3 className="font-medium text-gray-300 flex items-center gap-2">
                                <GitCommit className="w-4 h-4" />
                                Reference Commits
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {commits.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">
                                    No commits in this branch yet.
                                </p>
                            ) : (
                                commits.map((commit) => (
                                    <div key={commit.id} className="bg-gray-800 border border-white/5 rounded-lg p-3 text-sm">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${commit.type === 'INFO' ? 'bg-blue-900/30 text-blue-300 border-blue-800' :
                                                commit.type === 'OPINION' ? 'bg-purple-900/30 text-purple-300 border-purple-800' :
                                                    commit.type === 'QUESTION' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-800' :
                                                        commit.type === 'TODO' ? 'bg-red-900/30 text-red-300 border-red-800' :
                                                            'bg-gray-700 text-gray-300 border-gray-600'
                                                }`}>
                                                {commit.type}
                                            </span>
                                            <span className="text-xs text-gray-500 font-mono">#{commit.id}</span>
                                        </div>
                                        <p className="text-gray-300 line-clamp-3">{commit.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
