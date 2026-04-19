import IssueDetailPage from '@/components/issues/IssueDetailPage';
import { getIssue, getOrganizations, type Issue } from '@/lib/api';
import { issueDetailPath } from '@/lib/routes';

type IssueDetailRouteBackLinkProps = { href?: string | null; label?: string | null };

type IssueDetailRouteOrganization = Pick<Awaited<ReturnType<typeof getOrganizations>>[number], 'id' | 'slug'>;

type IssueDetailRouteLookupResult = {
  issue: Issue;
  organizations: IssueDetailRouteOrganization[];
};

export async function loadIssueDetailRouteLookup(issueId: number): Promise<IssueDetailRouteLookupResult> {
  const [issue, organizations] = await Promise.all([getIssue(issueId), getOrganizations()]);
  return { issue, organizations };
}

export function buildIssueDetailRouteBackLinkProps({ issue, organizations }: IssueDetailRouteLookupResult): IssueDetailRouteBackLinkProps {
  const workspaceSlug = organizations.find((organization) => organization.id === issue.organizationId)?.slug ?? null;
  if (!workspaceSlug) {
    return {};
  }

  return {
    href: issueDetailPath(workspaceSlug, issue),
    label: null,
  };
}

export default async function IssueDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issueId = Number(id);

  let backLinkProps: IssueDetailRouteBackLinkProps = {};
  try {
    backLinkProps = buildIssueDetailRouteBackLinkProps(await loadIssueDetailRouteLookup(issueId));
  } catch {
    backLinkProps = {};
  }

  return <IssueDetailPage issueId={issueId} {...backLinkProps} />;
}
