import { IssueDetailView } from '../../components/meeting/IssueDetailView';
import { BranchDiscussionView } from '../../components/meeting/BranchDiscussionView';

interface MeetingViewProps {
    viewType: 'ISSUE' | 'BRANCH';
}

export function MeetingView({ viewType }: MeetingViewProps) {
    if (viewType === 'ISSUE') {
        return <IssueDetailView />;
    }

    if (viewType === 'BRANCH') {
        return <BranchDiscussionView />;
    }

    return null;
}
