export type UserStatus = 'ONLINE' | 'OFFLINE' | 'BUSY' | 'MEETING';

export interface User {
    id: string;
    name: string;
    role: 'LEADER' | 'MEMBER';
    avatarUrl?: string; // Use UI Avatars or similar
    status: UserStatus;
    jobTitle?: string; // e.g., Backend Dev, QA
}

export interface Team {
    id: string;
    name: string;
    members: User[];
}

// Consolidated CommitType matching new UI
export type CommitType = 'NONE' | 'INFO' | 'OPINION' | 'QUESTION' | 'TODO';

export interface Commit {
    id: string;
    type: CommitType;
    authorId: string;
    message: string;
    timestamp: string; // ISO string
    tags?: string[];
}


export interface Branch {
    id: string;
    name: string;
    issueId: string;
    fromBranchId?: string; // Parent branch
    commits: Commit[];
    description?: string; // "Opinion" description
    status: 'ACTIVE' | 'MERGED' | 'REJECTED';
}


export type IssueStatus = 'OPEN' | 'CLOSED' | 'REVIEW';

export interface Issue {
    id: string; // e.g., "#12"
    title: string;
    repoId: string;
    maintainerId: string;
    author: string; // Author Name for display
    status: IssueStatus;
    description?: string;
    createdAt: string;
    branches: Branch[]; // Connected branches
}


export interface Repository {
    id: string;
    name: string; // Meeting Name e.g., "v1.0 Final Deployment Strategy"
    teamId: string;
    status: 'LOBBY' | 'ACTIVE' | 'CLOSED';
    createdAt: string; // Meeting Start Time
    participants: string[]; // User IDs
}

export interface Review {
    id: string; // Unique ID for deletion
    reviewerId: string;
    comment: string;
    status: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT'; // Added COMMENT type
    createdAt: string;
}

export interface PullRequest {
    id: string;
    title: string;
    description?: string; // PR 설명
    fromBranchId: string; // 단일 브랜치 PR용 (하위 호환)
    fromBranchIds?: string[]; // 멀티 브랜치 PR용 (여러 브랜치 ID 배열)
    toBranchId: string; // Usually 'main' or parent branch
    issueId?: string; // 연결된 이슈 ID
    authorId: string;
    status: 'OPEN' | 'MERGED' | 'REJECTED';
    reviews: Review[];
    createdAt: string;
}

export interface DecisionRecord {
    id: string;
    issueId: string;
    issueTitle: string; // 안건 제목
    teamPath: string; // 경로 (예: "8팀 > 백엔드")
    decision: string; // 결정 내용 (예: "내일 오전 배포 진행")
    decisionMaker: string; // 결정자 이름
    decisionOpinion: string; // 결정 의견 (브랜치명)
    decisionReason: string[]; // 결정 이유 (결정자 작성)
    prRationale: string[]; // 근거 (PR 생성자 작성)
    aiSummary: string[]; // 회의 내용 요약 (AI 생성) - 커밋 기반
    mergedBranchId: string; // 머지된 브랜치 ID
    prId: string; // 관련 PR ID
    reviews?: string[]; // 결정권자 리뷰 목록
    createdAt: string;
}

export interface Notification {
    id: string;
    type: 'PR' | 'INVITE' | 'MEETING_START' | 'MENTION';
    message: string;
    isRead: boolean;
    link?: string;
    createdAt: string;
}
