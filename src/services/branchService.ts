import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { Branch, Commit } from '../types';

export const branchService = {
    getBranches: async (issueId: string): Promise<Branch[]> => {
        return apiClient.get<Branch[]>(API_ENDPOINTS.BRANCHES.LIST(issueId));
    },

    createBranch: async (branch: Branch): Promise<Branch> => {
        return apiClient.post<Branch>(API_ENDPOINTS.BRANCHES.CREATE, branch);
    },

    addCommit: async (branchId: string, commit: Commit): Promise<Branch> => {
        // In real API, we might post a commit and return the updated branch or just the commit
        // Adjusting expectation to return the updated branch for state consistency
        return apiClient.post<Branch>(API_ENDPOINTS.BRANCHES.COMMIT(branchId), commit);
    }
};
