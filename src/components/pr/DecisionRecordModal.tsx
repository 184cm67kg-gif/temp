import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { DecisionRecord } from '../../types';

interface DecisionRecordModalProps {
    record: DecisionRecord;
    onClose: () => void;
}

export function DecisionRecordModal({ record, onClose }: DecisionRecordModalProps) {
    const [copied, setCopied] = useState(false);

    // Markdown 생성 함수
    const generateMarkdown = () => {
        // 브랜치 목록 포맷팅 (특수문자 제거 요청 반영 - 깔끔하게)
        const branchList = record.aiSummary
            ? record.aiSummary.map(b => b.startsWith('- ') ? `  ${b}` : `  - ${b}`).join('\n')
            : '-';

        // 리뷰 목록 포맷팅
        const reviewList = record.reviews && record.reviews.length > 0
            ? record.reviews.map(r => `  - ${r}`).join('\n')
            : '';

        // 결정 이유 포맷팅
        const reasonList = record.decisionReason.map(r => `  - ${r}`).join('\n');

        // 근거 포맷팅
        const rationaleList = record.prRationale
            ? record.prRationale.map(r => `  - ${r}`).join('\n')
            : '-';

        return `
────────────────────────────────────────
Decision Record
────────────────────────────────────────
안건: ${record.issueTitle}
${record.teamPath}
결정자: ${record.decisionMaker}


결정 의견 
${branchList}
  - ${record.decisionOpinion}


결정 이유 (결정자 작성):
${reasonList}
${reviewList}


근거 (PR 생성자 작성):
${rationaleList}
 

────────────────────────────────────────
`.trim();
    };

    const markdownContent = generateMarkdown();

    const handleCopy = () => {
        navigator.clipboard.writeText(markdownContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1E293B] border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0F172A]">
                    <h2 className="text-lg font-bold text-white">Decision Record</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* 메인 컨텐츠 */}
                <div className="flex-1 overflow-hidden p-0 relative">
                    <textarea
                        readOnly
                        value={markdownContent}
                        className="w-full h-full bg-[#0F172A] text-gray-300 font-mono text-sm p-6 resize-none focus:outline-none"
                    />

                    {/* 복사 버튼 (우측 상단 플로팅) */}
                    <button
                        onClick={handleCopy}
                        className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${copied
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                            }`}
                    >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied!' : 'Copy Markdown'}
                    </button>
                </div>
            </div>
        </div>
    );
}
