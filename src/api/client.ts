import { MOCK_USERS, MOCK_ISSUES, MOCK_TEAM, MOCK_REPO, CURRENT_USER_ID, BRANCH_TODAY, BRANCH_TOMORROW } from '../data/mockData';
import type { User, Issue, Branch, Commit, PullRequest, DecisionRecord, Notification, Review } from '../types';

// Mock database state to persist data during session
let dbIssues = [...MOCK_ISSUES];
let dbPullRequests: PullRequest[] = [];
let dbDecisionRecords: DecisionRecord[] = [];
let dbNotifications: Notification[] = [];
let dbRepoChats: any[] = [];

/**
 * Mock API Client
 * Simulates async network requests
 */
export const apiClient = {
    get: async <T>(url: string): Promise<T> => {
        console.log(`[GET] ${url}`);
        return new Promise((resolve) => {
            setTimeout(() => {
                // Routing logic based on URL
                if (url === '/api/auth/me') {
                    resolve(MOCK_USERS.find(u => u.id === CURRENT_USER_ID) as any);
                }
                else if (url === '/api/issues') {
                    resolve(dbIssues as any);
                }
                else if (url.startsWith('/api/pull-requests')) {
                    resolve(dbPullRequests as any);
                }
                else if (url === '/api/team') {
                    resolve(MOCK_TEAM as any);
                }
                else if (url === '/api/repo') {
                    resolve(MOCK_REPO as any);
                }
                // Add unlimited mock handlers as needed
                else {
                    resolve({} as T);
                }
            }, 300); // Simulate network latency
        });
    },

    post: async <T>(url: string, data: any): Promise<T> => {
        console.log(`[POST] ${url}`, data);
        return new Promise((resolve) => {
            setTimeout(() => {
                if (url === '/api/issues') {
                    dbIssues.push(data);
                } else if (url === '/api/pull-requests') {
                    dbPullRequests.push(data);
                } else if (url === '/api/branches') {
                    // Find issue and add branch? 
                    // This is tricky because branches are nested in issues in the current type def
                    // We might need to find the issue and update it
                    if (data.issueId) {
                        const issue = dbIssues.find(i => i.id === data.issueId);
                        if (issue) {
                            issue.branches.push(data);
                        }
                    }
                } else if (url.includes('/commits')) {
                    // /api/branches/${branchId}/commits
                    // Extract branchId from URL
                    // URL structure: /api/branches/b_today/commits
                    const match = url.match(/\/api\/branches\/(.+)\/commits/);
                    if (match && match[1]) {
                        const branchId = match[1];
                        // Find branch nested in issues
                        for (const issue of dbIssues) {
                            const branch = issue.branches.find(b => b.id === branchId);
                            if (branch) {
                                branch.commits.push(data);
                                break;
                            }
                        }
                    }
                } else if (url.includes('/merge')) {
                    // Handle PR Merge logic inside the mock DB
                    const match = url.match(/\/api\/pull-requests\/(.+)\/merge/);
                    if (match && match[1]) {
                        const prId = match[1];
                        const prIndex = dbPullRequests.findIndex(p => p.id === prId);
                        if (prIndex !== -1) {
                            dbPullRequests[prIndex].status = 'MERGED';

                            // Create Decision Record (simplified logic for mock)
                            // const record = data as any; // Removed unused variable 
                            // Actually the service passed the decision data.
                            // We need to construct the full record or expect the payload to be the record?
                            // Looking at prService: mergePR passes { decisionReason, ... }
                            // Real backend would generate the ID and timestamp.

                            // For this prototype, let's assume the mutation returns the Record 
                            // but we need to create it here to "persist" it if we had a decision db.
                            // We do have dbDecisionRecords.

                            // Let's reconstruct the DecisionRecord here to be safe and persistent
                            // But for simplicity, we can assume the UI/Service sends enough info OR
                            // we just assume the payload IS the record (shortcuts taken in cleanup)
                            // Wait, the service sends: { decisionReason, decisionContent ... }
                            // The store used to do the heavy lifting of creating the record.
                            // Ideally the backend does it.

                            // ... This is getting complex for a "Cleanup".
                            // I will accept the data and return a mock DecisionRecord.

                            const newRecord = {
                                id: `dr-${Date.now()}`,
                                ...data,
                                createdAt: new Date().toISOString()
                            };
                            dbDecisionRecords.push(newRecord);

                            // Update Issue Status to CLOSED
                            const pr = dbPullRequests[prIndex];
                            if (pr.issueId) {
                                const issue = dbIssues.find(i => i.id === pr.issueId);
                                if (issue) issue.status = 'CLOSED';
                            }

                            resolve(newRecord as T);
                            return;
                        }
                    }
                }
                resolve(data as T);
            }, 300);
        });
    },

    put: async <T>(url: string, data: any): Promise<T> => {
        console.log(`[PUT] ${url}`, data);
        return new Promise((resolve) => {
            setTimeout(() => {
                if (url.includes('/status') && url.includes('/issues/')) {
                    const match = url.match(/\/api\/issues\/(.+)\/status/);
                    if (match && match[1]) {
                        const issueId = match[1];
                        const issue = dbIssues.find(i => i.id === issueId);
                        if (issue) {
                            issue.status = data.status;
                            resolve(issue as T);
                            return;
                        }
                    }
                }
                resolve(data as T);
            }, 300);
        });
    }
};
