import type { Issue } from '@/lib/api';
import type { AppToast } from '@/components/providers/ToastProvider';
import { localizePath, type Locale } from '@/i18n/config';

type Translate = (key: string, params?: Record<string, string | number>) => string;

async function copyText(value: string) {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function issueDescription(issue: Pick<Issue, 'identifier' | 'title'>) {
  const safeTitle = issue.title.trim();
  return safeTitle ? `${issue.identifier} - ${safeTitle}` : issue.identifier;
}

export function buildIssueCreatedToast(
  issue: Pick<Issue, 'id' | 'identifier' | 'title'>,
  locale: Locale,
  t: Translate
): Omit<AppToast, 'id'> {
  const href = localizePath(locale, `/issues/${issue.id}`);

  return {
    type: 'success',
    title: t('issueCreatedToast.title'),
    description: issueDescription(issue),
    dismissLabel: t('issueCreatedToast.dismiss'),
    primaryAction: {
      id: 'view-issue',
      kind: 'link',
      href,
      label: t('issueCreatedToast.view'),
      ariaLabel: t('issueCreatedToast.view'),
    },
    secondaryActions: [
      {
        id: 'copy-link',
        icon: 'link',
        ariaLabel: t('issueCreatedToast.copyLink'),
        successLabel: t('issueCreatedToast.copiedLink'),
        onClick: async () => {
          if (typeof window === 'undefined') return false;
          return copyText(`${window.location.origin}${href}`);
        },
      },
      {
        id: 'copy-identifier',
        icon: 'copy',
        ariaLabel: t('issueCreatedToast.copyIdentifier'),
        successLabel: t('issueCreatedToast.copiedIdentifier'),
        onClick: () => copyText(issue.identifier),
      },
    ],
    durationMs: 7000,
    dismissible: true,
  };
}

