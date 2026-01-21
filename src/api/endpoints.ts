/**
 * API Endpoint Constants
 * These endpoints mock a real REST API structure.
 */

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        ME: '/api/auth/me',
    },
    ISSUES: {
        LIST: '/api/issues',
        DETAIL: (id: string) => `/api/issues/${id}`,
        CREATE: '/api/issues',
        UPDATE_STATUS: (id: string) => `/api/issues/${id}/status`,
    },
    BRANCHES: {
        LIST: (issueId: string) => `/api/issues/${issueId}/branches`,
        CREATE: '/api/branches',
        COMMIT: (branchId: string) => `/api/branches/${branchId}/commits`,
    },
    PULL_REQUESTS: {
        LIST: '/api/pull-requests',
        CREATE: '/api/pull-requests',
        DETAIL: (id: string) => `/api/pull-requests/${id}`,
        MERGE: (id: string) => `/api/pull-requests/${id}/merge`,
        REJECT: (id: string) => `/api/pull-requests/${id}/reject`,
        REVIEW: (id: string) => `/api/pull-requests/${id}/reviews`,
    },
    DECISIONS: {
        LIST: '/api/decisions',
        CREATE: '/api/decisions',
    },
    NOTIFICATIONS: {
        LIST: '/api/notifications',
        CREATE: '/api/notifications',
    },
    CHATS: {
        REPO: '/api/chats/repo',
    },
    TEAM: '/api/team',
    REPO: '/api/repo'
} as const;
