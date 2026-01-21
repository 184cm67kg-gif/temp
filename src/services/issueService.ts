import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { Issue, IssueStatus } from '../types';

export const issueService = {
    getIssues: async (): Promise<Issue[]> => {
        return apiClient.get<Issue[]>(API_ENDPOINTS.ISSUES.LIST);
    },

    getIssueById: async (id: string): Promise<Issue> => {
        return apiClient.get<Issue>(API_ENDPOINTS.ISSUES.DETAIL(id));
    },

    createIssue: async (issue: Issue): Promise<Issue> => {
        return apiClient.post<Issue>(API_ENDPOINTS.ISSUES.CREATE, issue);
    },

    updateStatus: async (id: string, status: IssueStatus): Promise<Issue> => {
        return apiClient.put<Issue>(API_ENDPOINTS.ISSUES.UPDATE_STATUS(id), { status });
    }
};
