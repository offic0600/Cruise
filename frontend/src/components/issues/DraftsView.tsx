'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { localizePath } from '@/i18n/config';
import { useI18n } from '@/i18n/useI18n';
import { deleteIssueDraft, getIssueDrafts } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { queryKeys } from '@/lib/query/keys';

export default function DraftsView() {
  const queryClient = useQueryClient();
  const { locale, t } = useI18n();
  const user = getStoredUser();
  const organizationId = user?.organizationId ?? 1;
  const draftsQuery = useQuery({ queryKey: queryKeys.issueDrafts({ organizationId }), queryFn: () => getIssueDrafts({ organizationId }) });
  const deleteMutation = useMutation({
    mutationFn: deleteIssueDraft,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.issueDrafts({ organizationId }) });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[0.18em] text-ink-400">{t('settings.drafts.eyebrow')}</div>
        <h1 className="text-3xl font-semibold text-ink-900">{t('settings.drafts.title')}</h1>
        <p className="mt-2 text-sm text-ink-600">{t('settings.drafts.subtitle')}</p>
      </div>
      <div className="space-y-3">
        {(draftsQuery.data ?? []).map((draft) => (
          <div key={draft.id} className="flex items-center justify-between rounded-3xl border border-border-soft bg-white p-5">
            <div>
              <div className="font-semibold text-ink-900">{draft.title || t('settings.drafts.untitled')}</div>
              <div className="mt-1 text-sm text-ink-500">{draft.updatedAt}</div>
            </div>
            <div className="flex gap-2">
              <Link href={localizePath(locale, `/issues/new?draftId=${draft.id}`)} className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                {t('settings.drafts.continue')}
              </Link>
              <Button variant="secondary" onClick={() => deleteMutation.mutate(draft.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
