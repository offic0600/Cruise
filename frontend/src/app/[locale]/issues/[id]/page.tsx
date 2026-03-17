import IssueDetailPage from '@/components/issues/IssueDetailPage';

export default async function LocalizedIssueDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <IssueDetailPage issueId={Number(id)} />;
}
