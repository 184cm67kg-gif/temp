import type { Team, User, Repository, Issue, Branch } from "../types";

export const MOCK_USERS: User[] = [
    { id: "u1", name: "김철수", role: "LEADER", status: "ONLINE", jobTitle: "Team Leader" }, // Kim Team Leader
    { id: "u2", name: "박영희", role: "MEMBER", status: "ONLINE", jobTitle: "Backend Dev" }, // Park Backend
    { id: "u3", name: "이민수", role: "MEMBER", status: "MEETING", jobTitle: "Frontend Dev" }, // Lee Frontend
    { id: "u4", name: "정수민", role: "MEMBER", status: "ONLINE", jobTitle: "QA Engineer" }, // Choi QA (mapped to Jeong Su-min for consistency with prompt list, but role is QA)
];

export const CURRENT_USER_ID = "u1"; // Default login as Leader

export const MOCK_TEAM: Team = {
    id: "t1",
    name: "Loggy 개발팀",
    members: MOCK_USERS,
};

// Scene 2: Repository (Meeting) created
export const MOCK_REPO: Repository = {
    id: "r1",
    name: "v1.0 최종 배포 전략 회의",
    teamId: "t1",
    status: "ACTIVE",
    createdAt: new Date().toISOString(), // Today
    participants: ["u1", "u2", "u3", "u4"],
};

// Scene 3: Issue (Agenda)
export const MOCK_ISSUES: Issue[] = [
    {
        id: "#12",
        title: "배포를 언제 할까?",
        repoId: "r1",
        maintainerId: "u3", // Lee Frontend registered it
        author: "이민수",
        status: "OPEN",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        branches: [], // Populated below
    },
];

// Scene 4: Branches
export const BRANCH_TODAY: Branch = {
    id: "b_today",
    name: "deploy_today",
    issueId: "#12",
    description: "오늘 즉시 배포",
    status: "ACTIVE",
    commits: [
        {
            id: "c1",
            type: "INFO",
            authorId: "u4", // Choi QA
            message: "QA 완료 기준 공유: 현재 크리티컬 이슈 없음",
            timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        },
        {
            id: "c2",
            type: "OPINION",
            authorId: "u1", // Kim Leader
            message: "오늘 배포 가능하다는 의견 다수, 빠르게 털고 가자",
            timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        },
        {
            id: "c3",
            type: "TODO",
            authorId: "u3", // Lee Frontend
            message: "프론트 캐시 로직 최종 점검",
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        }
    ]
};

export const BRANCH_TOMORROW: Branch = {
    id: "b_tomorrow",
    name: "deploy_tomorrow",
    issueId: "#12",
    description: "내일 오전 배포",
    status: "ACTIVE",
    commits: [
        {
            id: "c4",
            type: "OPINION",
            authorId: "u3",
            message: "내일 오전이 안전합니다. 밤 사이 이슈 터지면 대응 불가.",
            timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        }
    ]
};

// Assign branches to issue
MOCK_ISSUES[0].branches = [BRANCH_TODAY, BRANCH_TOMORROW];
