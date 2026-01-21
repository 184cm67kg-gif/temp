import { useState } from 'react';
import { useStore } from '../store/scenarioStore';
import { Clock, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
    const { issues, currentRepo } = useStore();
    const [activeTab, setActiveTab] = useState<'OPEN' | 'REVIEW' | 'CLOSED'>('OPEN');

    // Filter issues based on active tab
    const filteredIssues = issues
        .filter(issue => {
            if (activeTab === 'OPEN') return issue.status === 'OPEN';
            if (activeTab === 'REVIEW') return issue.status === 'REVIEW';
            if (activeTab === 'CLOSED') return issue.status === 'CLOSED';
            return false;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Newest first

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    <Link
                        to={`/repo/${currentRepo?.id || 'repo1'}`}
                        className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                    >
                        {currentRepo?.name || 'Loggy Dashboard'}
                    </Link>
                </h1>
                <p className="text-gray-400">
                    현재 진행 중인 회의 및 안건을 확인하세요.
                </p>
            </div>

            {/* Activity Section */}
            <div className="bg-gray-900/50 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white mb-4">Activity</h2>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('OPEN')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'OPEN'
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            🔥 논의 중 ({issues.filter(i => i.status === 'OPEN').length})
                        </button>
                        <button
                            onClick={() => setActiveTab('REVIEW')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'REVIEW'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            👀 리뷰 중 ({issues.filter(i => i.status === 'REVIEW').length})
                        </button>
                        <button
                            onClick={() => setActiveTab('CLOSED')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'CLOSED'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            ✅ 결정 완료 ({issues.filter(i => i.status === 'CLOSED').length})
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="divide-y divide-white/5">
                    {filteredIssues.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            해당 상태의 안건이 없습니다.
                        </div>
                    ) : (
                        filteredIssues.map(issue => (
                            <Link
                                key={issue.id}
                                to={`/issue/${issue.id}`}
                                className="block p-6 hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-medium text-gray-200 group-hover:text-blue-400 transition-colors">
                                            {issue.title}
                                        </h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${issue.status === 'OPEN' ? 'bg-orange-900/30 text-orange-300 border-orange-800' :
                                            issue.status === 'REVIEW' ? 'bg-blue-900/30 text-blue-300 border-blue-800' :
                                                'bg-green-900/30 text-green-300 border-green-800'
                                            }`}>
                                            {issue.status}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {new Date(issue.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-400">
                                    <div className="flex items-center gap-4">
                                        <span>작성자: {issue.author}</span>
                                        <span className="text-gray-600">•</span>
                                        <span className="flex items-center gap-1">
                                            <MessageSquare className="w-4 h-4" />
                                            {issue.branches.length}개의 브랜치
                                        </span>
                                        {/* Dummy Decision Record Button */}
                                        <button
                                            onClick={(e) => e.preventDefault()}
                                            className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-xs text-gray-400 hover:text-white transition-colors ml-2"
                                        >
                                            디시전 레코드 보기
                                        </button>
                                    </div>
                                    <div className="flex -space-x-2">
                                        {/* Participants Mock - In real app, derived from contributors */}
                                        <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-[10px]">A</div>
                                        <div className="w-6 h-6 rounded-full bg-gray-600 border-2 border-gray-900 flex items-center justify-center text-[10px]">B</div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
