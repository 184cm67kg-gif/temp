import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { PullRequest, DecisionRecord, Review } from '../types';

export const prService = {
    getPullRequests: async (): Promise<PullRequest[]> => {
        return apiClient.get<PullRequest[]>(API_ENDPOINTS.PULL_REQUESTS.LIST);
    },

    createPR: async (pr: PullRequest): Promise<PullRequest> => {
        return apiClient.post<PullRequest>(API_ENDPOINTS.PULL_REQUESTS.CREATE, pr);
    },

    mergePR: async (prId: string, data: {
        decisionReason: string[];
        decisionContent: string;
        selectedCommitIds: string[];
        decisionOpinion: string;
    }): Promise<DecisionRecord> => {
        return apiClient.post<DecisionRecord>(API_ENDPOINTS.PULL_REQUESTS.MERGE(prId), data);
    },

    rejectPR: async (prId: string): Promise<void> => {
        return apiClient.post<void>(API_ENDPOINTS.PULL_REQUESTS.REJECT(prId), {});
    },

    addReview: async (prId: string, review: Review): Promise<PullRequest> => {
        return apiClient.post<PullRequest>(API_ENDPOINTS.PULL_REQUESTS.REVIEW(prId), review);
    }
};
