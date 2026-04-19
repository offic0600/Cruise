import IssueDetailPage from '@/components/issues/IssueDetailPage';
import { getIssue, getOrganizations } from '@/lib/api';
import { issueDetailPath } from '@/lib/routes';

export default async function IssueDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issueId = Number(id);

  let backLinkProps: { href?: string | null; label?: string | null } = {};
  try {
    const [issue, organizations] = await Promise.all([getIssue(issueId), getOrganizations()]);
    const workspaceSlug = organizations.find((organization) => organization.id === issue.organizationId)?.slug ?? null;
    if (workspaceSlug) {
      backLinkProps = {
        href: issueDetailPath(workspaceSlug, issue),
        label: null,
      };
    }
  } catch {
    backLinkProps = {};
  }

  return <IssueDetailPage issueId={issueId} {...backLinkProps} />;
}
