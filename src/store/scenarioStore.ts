import { create } from 'zustand';
import type { User, Team, Repository, Issue, Branch, Commit, Notification, PullRequest, DecisionRecord, IssueStatus, Review } from '../types';
import { authService } from '../services/authService';
import { issueService } from '../services/issueService';
import { branchService } from '../services/branchService';
import { prService } from '../services/prService';
import { apiClient } from '../api/client'; // Direct access for generic items if needed, or create more services
import { API_ENDPOINTS } from '../api/endpoints';

interface AppState {
    currentUser: User | null;
    currentTeam: Team | null;
    currentRepo: Repository | null;
    issues: Issue[];
    activeIssueId: string | null;
    activeBranchId: string | null;
    notifications: Notification[];
    decisionRecords: DecisionRecord[];
    pullRequests: PullRequest[];
    repoChats: { id: string; userId: string; userName: string; message: string; timestamp: string }[];

    // Actions
    initialize: () => Promise<void>;
    login: (userId: string) => Promise<void>;
    setActiveIssue: (id: string | null) => void;
    setActiveBranch: (id: string | null) => void;
    addCommit: (branchId: string, commit: Commit) => Promise<void>;
    createIssue: (issue: Issue) => Promise<void>;
    createBranch: (branch: Branch) => Promise<void>; // Updated to proper async
    addDecision: (record: DecisionRecord) => void; // Mostly handled via mergePR now
    addNotification: (noti: Notification) => void;
    createPR: (pr: PullRequest) => Promise<void>;
    mergePR: (prId: string, decisionReason: string[], decisionContent: string, selectedCommitIds: string[], decisionOpinion: string) => Promise<DecisionRecord | null>;
    rejectPR: (prId: string) => Promise<void>;
    updateIssueStatus: (issueId: string, status: IssueStatus) => Promise<void>;
    addRepoChat: (chat: { userId: string; userName: string; message: string }) => void;
    addReview: (prId: string, review: Review) => Promise<void>;
    deleteReview: (prId: string, reviewId: string) => Promise<void>; // Need service for this?
}

export const useStore = create<AppState>((set) => ({
    currentUser: null,
    currentTeam: null,
    currentRepo: null,
    issues: [],
    activeIssueId: null,
    activeBranchId: null,
    notifications: [],
    pullRequests: [],
    decisionRecords: [],
    repoChats: [],

    initialize: async () => {
        // Fetch initial data
        const [user, team, repo, issues, prs] = await Promise.all([
            authService.getCurrentUser(),
            apiClient.get<Team>(API_ENDPOINTS.TEAM),
            apiClient.get<Repository>(API_ENDPOINTS.REPO),
            issueService.getIssues(),
            prService.getPullRequests()
            // We could also fetch decision records if endpoint existed
        ]);

        set({
            currentUser: user,
            currentTeam: team,
            currentRepo: repo,
            issues: issues,
            pullRequests: prs
        });
    },

    login: async (userId) => {
        const user = await authService.login(userId);
        set({ currentUser: user });
    },

    setActiveIssue: (id) => set({ activeIssueId: id }),
    setActiveBranch: (id) => set({ activeBranchId: id }),

    addCommit: async (branchId, commit) => {
        // Optimistic update or fetch updated branch?
        // Let's use service
        await branchService.addCommit(branchId, commit);

        // Handle local state update manually or re-fetch issue branches?
        // Updating deeply nested state is painful.
        // Let's manually update for responsiveness.
        set((state) => {
            const newIssues = state.issues.map(issue => {
                const branchIndex = issue.branches.findIndex(b => b.id === branchId);
                if (branchIndex === -1) return issue;

                const newBranches = [...issue.branches];
                newBranches[branchIndex] = {
                    ...newBranches[branchIndex],
                    commits: [...newBranches[branchIndex].commits, commit]
                };

                return { ...issue, branches: newBranches };
            });
            return { issues: newIssues };
        });
    },

    createIssue: async (issue) => {
        const created = await issueService.createIssue(issue);
        set((state) => ({ issues: [...state.issues, created] }));
    },

    createBranch: async (branch) => {
        await branchService.createBranch(branch);
        // Manual update to put branch into issue
        set((state) => {
            const newIssues = state.issues.map(i => {
                if (i.id === branch.issueId) {
                    return { ...i, branches: [...i.branches, branch] };
                }
                return i;
            });
            return { issues: newIssues };
        });
    },

    addDecision: (record) => set((state) => ({ decisionRecords: [...state.decisionRecords, record] })),
    addNotification: (noti) => set((state) => ({ notifications: [noti, ...state.notifications] })),

    createPR: async (pr) => {
        const created = await prService.createPR(pr);
        set((state) => ({ pullRequests: [created, ...state.pullRequests] }));
    },

    mergePR: async (prId, decisionReason, decisionContent, selectedCommitIds, decisionOpinion) => {
        const record = await prService.mergePR(prId, {
            decisionReason,
            decisionContent,
            selectedCommitIds,
            decisionOpinion
        });

        // Update local state to reflect the merge
        set((state) => {
            const newPRs = state.pullRequests.map(p =>
                p.id === prId ? { ...p, status: 'MERGED' as const } : p
            );

            // Find connected issue and close it
            const pr = state.pullRequests.find(p => p.id === prId);
            let newIssues = state.issues;
            if (pr && pr.issueId) {
                newIssues = state.issues.map(i =>
                    i.id === pr.issueId ? { ...i, status: 'CLOSED' as const } : i
                );
            }

            return {
                pullRequests: newPRs,
                issues: newIssues,
                decisionRecords: [...state.decisionRecords, record]
            };
        });

        return record;
    },

    rejectPR: async (prId) => {
        await prService.rejectPR(prId);
        set((state) => ({
            pullRequests: state.pullRequests.map(p =>
                p.id === prId ? { ...p, status: 'REJECTED' as const } : p
            )
        }));
    },

    updateIssueStatus: async (issueId, status) => {
        await issueService.updateStatus(issueId, status);
        set((state) => ({
            issues: state.issues.map(i =>
                i.id === issueId ? { ...i, status } : i
            )
        }));
    },

    addRepoChat: (chat) => set((state) => ({
        repoChats: [...state.repoChats, {
            id: `rc-${Date.now()}`,
            ...chat,
            timestamp: new Date().toISOString()
        }]
    })),

    addReview: async (prId, review) => {
        await prService.addReview(prId, review);
        set((state) => ({
            pullRequests: state.pullRequests.map(p =>
                p.id === prId ? { ...p, reviews: [...p.reviews, review] } : p
            )
        }));
    },

    deleteReview: async (prId, reviewId) => {
        // Implement delete endpoint if needed, for now simulate
        // await prService.deleteReview(prId, reviewId); 
        set((state) => ({
            pullRequests: state.pullRequests.map(p =>
                p.id === prId ? { ...p, reviews: p.reviews.filter(r => r.id !== reviewId) } : p
            )
        }));
    }
}));
