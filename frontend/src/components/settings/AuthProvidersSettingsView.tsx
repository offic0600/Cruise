'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAdminAuthProvider,
  deleteAdminAuthProvider,
  disableAdminAuthProvider,
  enableAdminAuthProvider,
  listAdminAuthProviders,
  setDefaultAdminAuthProvider,
  testAdminAuthProvider,
  updateAdminAuthProvider,
  type AuthProviderAdmin,
  type AuthProviderUpsertRequest,
  type ClaimMappingConfig,
} from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';

const defaultClaimMapping: ClaimMappingConfig = {
  subjectClaim: 'sub',
  emailClaim: 'email',
  emailVerifiedClaim: 'email_verified',
  displayNameClaim: 'name',
  usernameClaim: 'preferred_username',
  avatarClaim: 'picture',
};

type FormState = Omit<AuthProviderUpsertRequest, 'claimMapping'> & {
  providerKey: string;
  claimMapping: ClaimMappingConfig;
};

const defaultForm = (organizationId?: number | null): FormState => ({
  providerKey: '',
  displayName: '',
  scopeLevel: organizationId ? 'ORGANIZATION' : 'GLOBAL',
  organizationId: organizationId ?? null,
  slug: '',
  issuerUrl: '',
  discoveryUrl: '',
  authorizationUrl: '',
  tokenUrl: '',
  userinfoUrl: '',
  jwksUrl: '',
  endSessionUrl: '',
  clientId: '',
  clientSecret: '',
  clientSecretChanged: false,
  clientAuthMethod: 'client_secret_post',
  scopes: 'openid profile email',
  usePkce: true,
  pkceMethod: 'S256',
  prompt: '',
  loginHintTemplate: '',
  domainMatchMode: 'NONE',
  allowedEmailDomains: [],
  enforceSso: false,
  autoProvisionUsers: true,
  accountLinkPolicy: 'EMAIL_AUTO_LINK',
  profileSyncMode: 'FIRST_LOGIN',
  claimMapping: defaultClaimMapping,
  buttonText: '',
  buttonLogoUrl: '',
  displayOrder: 0,
  enabled: true,
  isDefault: false,
});

export default function AuthProvidersSettingsView() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useCurrentWorkspace();
  const user = getStoredUser();
  const [selected, setSelected] = useState<AuthProviderAdmin | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm(currentOrganizationId));

  const providersQuery = useQuery({
    queryKey: ['admin-auth-providers', currentOrganizationId],
    queryFn: () => listAdminAuthProviders(undefined, currentOrganizationId ?? undefined),
  });

  useEffect(() => {
    if (!selected) {
      setForm(defaultForm(currentOrganizationId));
      return;
    }
    setForm({
      providerKey: selected.providerKey,
      displayName: selected.displayName,
      scopeLevel: selected.scopeLevel,
      organizationId: selected.organizationId ?? null,
      slug: selected.slug ?? '',
      issuerUrl: selected.issuerUrl ?? '',
      discoveryUrl: selected.discoveryUrl ?? '',
      authorizationUrl: selected.authorizationUrl ?? '',
      tokenUrl: selected.tokenUrl ?? '',
      userinfoUrl: selected.userinfoUrl ?? '',
      jwksUrl: selected.jwksUrl ?? '',
      endSessionUrl: selected.endSessionUrl ?? '',
      clientId: selected.clientId ?? '',
      clientSecret: '',
      clientSecretChanged: false,
      clientAuthMethod: selected.clientAuthMethod,
      scopes: selected.scopes ?? 'openid profile email',
      usePkce: selected.usePkce,
      pkceMethod: selected.pkceMethod,
      prompt: selected.prompt ?? '',
      loginHintTemplate: selected.loginHintTemplate ?? '',
      domainMatchMode: selected.domainMatchMode,
      allowedEmailDomains: selected.allowedEmailDomains,
      enforceSso: selected.enforceSso,
      autoProvisionUsers: selected.autoProvisionUsers,
      accountLinkPolicy: selected.accountLinkPolicy,
      profileSyncMode: selected.profileSyncMode,
      claimMapping: selected.claimMapping,
      buttonText: selected.buttonText ?? '',
      buttonLogoUrl: selected.buttonLogoUrl ?? '',
      displayOrder: selected.displayOrder,
      enabled: selected.enabled,
      isDefault: selected.isDefault,
    });
  }, [currentOrganizationId, selected]);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-auth-providers'] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: AuthProviderUpsertRequest = {
        ...form,
        slug: form.slug || null,
        issuerUrl: form.issuerUrl || null,
        discoveryUrl: form.discoveryUrl || null,
        authorizationUrl: form.authorizationUrl || null,
        tokenUrl: form.tokenUrl || null,
        userinfoUrl: form.userinfoUrl || null,
        jwksUrl: form.jwksUrl || null,
        endSessionUrl: form.endSessionUrl || null,
        clientId: form.clientId || null,
        clientSecret: form.clientSecret || null,
        prompt: form.prompt || null,
        loginHintTemplate: form.loginHintTemplate || null,
        buttonText: form.buttonText || null,
        buttonLogoUrl: form.buttonLogoUrl || null,
      };
      if (selected) {
        return updateAdminAuthProvider(selected.id, payload);
      }
      return createAdminAuthProvider(payload);
    },
    onSuccess: async (provider) => {
      setSelected(provider);
      setFeedback('认证提供方已保存。');
      await refresh();
    },
  });

  const actionMutation = useMutation({
    mutationFn: async (action: { type: 'enable' | 'disable' | 'default' | 'test' | 'delete'; id: number }) => {
      switch (action.type) {
        case 'enable':
          return enableAdminAuthProvider(action.id);
        case 'disable':
          return disableAdminAuthProvider(action.id);
        case 'default':
          return setDefaultAdminAuthProvider(action.id);
        case 'test':
          return testAdminAuthProvider(action.id);
        case 'delete':
          return deleteAdminAuthProvider(action.id);
      }
    },
    onSuccess: async (result, variables) => {
      setFeedback(variables.type === 'test' ? (result as { message?: string } | undefined)?.message ?? '连接测试完成。' : '操作已完成。');
      if (variables.type === 'delete') {
        setSelected(null);
      }
      await refresh();
    },
  });

  const providers = providersQuery.data ?? [];
  const providerCards = useMemo(() => providers.sort((a, b) => a.displayOrder - b.displayOrder || a.displayName.localeCompare(b.displayName)), [providers]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border-soft bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-ink-900">认证提供方</div>
            <p className="mt-1 text-sm text-ink-500">
              这里管理当前组织的通用 OIDC 配置。平台管理员会额外看到全局提供方。
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setSelected(null);
                setForm(defaultForm(currentOrganizationId));
              }}
            >
              新建提供方
            </Button>
            <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-ink-500">
              {providerCards.length} configured
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="space-y-3">
          {providerCards.map((provider) => (
            <button
              key={provider.id}
              type="button"
              onClick={() => setSelected(provider)}
              className={`w-full rounded-3xl border p-4 text-left transition ${
                selected?.id === provider.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-border-soft bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{provider.displayName}</div>
                  <div className={`mt-1 text-xs ${selected?.id === provider.id ? 'text-slate-200' : 'text-ink-500'}`}>
                    {provider.scopeLevel} · {provider.providerKey}
                  </div>
                </div>
                <div className="flex gap-1">
                  {provider.enabled ? <Badge>Enabled</Badge> : <Badge tone="muted">Disabled</Badge>}
                  {provider.isDefault ? <Badge tone="brand">Default</Badge> : null}
                </div>
              </div>
              <div className={`mt-3 text-xs ${selected?.id === provider.id ? 'text-slate-300' : 'text-ink-400'}`}>
                {provider.clientId || 'No client ID'} · {provider.allowedEmailDomains.join(', ') || 'No domain binding'}
              </div>
            </button>
          ))}
        </section>

        <section className="space-y-5 rounded-3xl border border-border-soft bg-white p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-lg font-semibold text-ink-900">{selected ? '编辑提供方' : '创建提供方'}</div>
              <p className="mt-1 text-sm text-ink-500">支持 Discovery 优先、手工覆盖兜底、PKCE 和域名驱动 SSO。</p>
            </div>
            {selected ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => actionMutation.mutate({ type: 'test', id: selected.id })}>测试连接</Button>
                <Button variant="secondary" onClick={() => actionMutation.mutate({ type: selected.enabled ? 'disable' : 'enable', id: selected.id })}>
                  {selected.enabled ? '停用' : '启用'}
                </Button>
                <Button variant="secondary" onClick={() => actionMutation.mutate({ type: 'default', id: selected.id })}>设为默认</Button>
                <Button variant="secondary" onClick={() => actionMutation.mutate({ type: 'delete', id: selected.id })}>删除</Button>
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Provider Key">
              <Input value={form.providerKey} disabled={Boolean(selected)} onChange={(event) => setField('providerKey', event.target.value)} />
            </Field>
            <Field label="显示名称">
              <Input value={form.displayName} onChange={(event) => setField('displayName', event.target.value)} />
            </Field>
            <Field label="范围">
              <select className="h-10 rounded-xl border border-border-soft px-3" value={form.scopeLevel} onChange={(event) => setField('scopeLevel', event.target.value)}>
                <option value="ORGANIZATION">ORGANIZATION</option>
                {user?.role === 'ADMIN' ? <option value="GLOBAL">GLOBAL</option> : null}
              </select>
            </Field>
            <Field label="组织 ID">
              <Input
                type="number"
                disabled={form.scopeLevel === 'GLOBAL'}
                value={form.scopeLevel === 'GLOBAL' ? '' : String(form.organizationId ?? currentOrganizationId ?? '')}
                onChange={(event) => setField('organizationId', event.target.value ? Number(event.target.value) : null)}
              />
            </Field>
            <Field label="Issuer URL">
              <Input value={form.issuerUrl ?? ''} onChange={(event) => setField('issuerUrl', event.target.value)} />
            </Field>
            <Field label="Discovery URL">
              <Input value={form.discoveryUrl ?? ''} onChange={(event) => setField('discoveryUrl', event.target.value)} />
            </Field>
            <Field label="Client ID">
              <Input value={form.clientId ?? ''} onChange={(event) => setField('clientId', event.target.value)} />
            </Field>
            <Field label={selected ? `Client Secret (${selected.clientSecretMasked ?? '未配置'})` : 'Client Secret'}>
              <Input
                type="password"
                value={form.clientSecret ?? ''}
                onChange={(event) => {
                  setField('clientSecret', event.target.value);
                  setField('clientSecretChanged', true);
                }}
              />
            </Field>
            <Field label="授权端点">
              <Input value={form.authorizationUrl ?? ''} onChange={(event) => setField('authorizationUrl', event.target.value)} />
            </Field>
            <Field label="Token 端点">
              <Input value={form.tokenUrl ?? ''} onChange={(event) => setField('tokenUrl', event.target.value)} />
            </Field>
            <Field label="Userinfo 端点">
              <Input value={form.userinfoUrl ?? ''} onChange={(event) => setField('userinfoUrl', event.target.value)} />
            </Field>
            <Field label="JWKS 端点">
              <Input value={form.jwksUrl ?? ''} onChange={(event) => setField('jwksUrl', event.target.value)} />
            </Field>
            <Field label="Logout 端点">
              <Input value={form.endSessionUrl ?? ''} onChange={(event) => setField('endSessionUrl', event.target.value)} />
            </Field>
            <Field label="Scopes">
              <Input value={form.scopes} onChange={(event) => setField('scopes', event.target.value)} />
            </Field>
            <Field label="域名绑定">
              <Input
                value={form.allowedEmailDomains.join(', ')}
                onChange={(event) => setField('allowedEmailDomains', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))}
                placeholder="corp.example.com, partner.example.com"
              />
            </Field>
            <Field label="按钮文案">
              <Input value={form.buttonText ?? ''} onChange={(event) => setField('buttonText', event.target.value)} />
            </Field>
            <Field label="Client Auth">
              <select className="h-10 rounded-xl border border-border-soft px-3" value={form.clientAuthMethod} onChange={(event) => setField('clientAuthMethod', event.target.value)}>
                <option value="client_secret_post">client_secret_post</option>
                <option value="client_secret_basic">client_secret_basic</option>
              </select>
            </Field>
            <Field label="默认策略">
              <div className="flex flex-wrap gap-3 text-sm text-ink-600">
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.enabled} onChange={(event) => setField('enabled', event.target.checked)} />启用</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.isDefault} onChange={(event) => setField('isDefault', event.target.checked)} />默认</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.enforceSso} onChange={(event) => setField('enforceSso', event.target.checked)} />强制 SSO</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.autoProvisionUsers} onChange={(event) => setField('autoProvisionUsers', event.target.checked)} />JIT 建号</label>
              </div>
            </Field>
          </div>

          <div className="rounded-2xl border border-border-soft p-4">
            <div className="mb-3 text-sm font-semibold text-ink-900">Claim 映射</div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input value={form.claimMapping.subjectClaim} onChange={(event) => setField('claimMapping', { ...form.claimMapping, subjectClaim: event.target.value })} placeholder="sub" />
              <Input value={form.claimMapping.emailClaim} onChange={(event) => setField('claimMapping', { ...form.claimMapping, emailClaim: event.target.value })} placeholder="email" />
              <Input value={form.claimMapping.emailVerifiedClaim} onChange={(event) => setField('claimMapping', { ...form.claimMapping, emailVerifiedClaim: event.target.value })} placeholder="email_verified" />
              <Input value={form.claimMapping.displayNameClaim} onChange={(event) => setField('claimMapping', { ...form.claimMapping, displayNameClaim: event.target.value })} placeholder="name" />
              <Input value={form.claimMapping.usernameClaim} onChange={(event) => setField('claimMapping', { ...form.claimMapping, usernameClaim: event.target.value })} placeholder="preferred_username" />
              <Input value={form.claimMapping.avatarClaim} onChange={(event) => setField('claimMapping', { ...form.claimMapping, avatarClaim: event.target.value })} placeholder="picture" />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div>支持标准企业 OIDC，优先走 Discovery，也允许你手工覆盖端点。</div>
              {feedback ? <div className="mt-1 font-medium text-emerald-700">{feedback}</div> : null}
            </div>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.providerKey.trim() || !form.displayName.trim()}>
              {saveMutation.isPending ? '保存中...' : '保存提供方'}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <div className="text-sm font-medium text-ink-700">{label}</div>
      {children}
    </label>
  );
}

function Badge({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'muted' | 'brand' }) {
  const toneClass =
    tone === 'brand' ? 'bg-blue-100 text-blue-700' : tone === 'muted' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700';
  return <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${toneClass}`}>{children}</span>;
}
