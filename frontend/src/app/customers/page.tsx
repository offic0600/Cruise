'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Customer, Project } from '@/lib/api';
import { useCustomerNeeds, useCustomersWorkspace, usePlanningHubMutations } from '@/lib/query/planning-hub';

export default function CustomersPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [needTitle, setNeedTitle] = useState('');
  const [needDescription, setNeedDescription] = useState('');
  const [needProjectId, setNeedProjectId] = useState('');
  const { customersQuery, projectsQuery } = useCustomersWorkspace();
  const { createCustomerMutation, createCustomerNeedMutation, deleteCustomerNeedMutation } = usePlanningHubMutations();

  const customers = (customersQuery.data ?? []) as Customer[];
  const projects = (projectsQuery.data ?? []) as Project[];
  const selected = customers.find((item) => item.id === selectedId) ?? customers[0] ?? null;
  const needsQuery = useCustomerNeeds(selected?.id ?? null);
  const needs = needsQuery.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-ink-900">Customers</h1>
          <p className="mt-2 text-sm text-ink-700">Customers and their delivery needs mapped to projects.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <section className="space-y-3">
            <Card className="section-panel">
              <CardHeader className="p-0 pb-4"><CardTitle>New customer</CardTitle></CardHeader>
              <CardContent className="space-y-3 p-0">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer name" />
                <Button
                  className="w-full"
                  onClick={async () => {
                    if (!name.trim()) return;
                    await createCustomerMutation.mutateAsync({ name: name.trim() });
                    setName('');
                  }}
                >
                  Create customer
                </Button>
              </CardContent>
            </Card>

            {customers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => setSelectedId(customer.id)}
                className={`w-full rounded-panel border p-5 text-left transition ${selected?.id === customer.id ? 'border-ink-900 bg-ink-900 text-white shadow-nav' : 'border-border-subtle bg-surface-raised text-ink-900 shadow-card hover:bg-slate-50'}`}
              >
                <div className="text-sm font-semibold">{customer.name}</div>
                <div className={`mt-2 text-xs ${selected?.id === customer.id ? 'text-slate-300' : 'text-ink-400'}`}>{customer.slugId ?? `#${customer.id}`}</div>
                <div className={`mt-3 text-sm ${selected?.id === customer.id ? 'text-slate-300' : 'text-ink-700'}`}>{customer.domains ?? 'No domains'}</div>
              </button>
            ))}
          </section>

          <section className="space-y-6">
            {selected ? (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  <Metric label="Owner" value={selected.ownerId ? `#${selected.ownerId}` : 'Not set'} />
                  <Metric label="Status" value={selected.statusId ? `#${selected.statusId}` : 'Not set'} />
                  <Metric label="Tier" value={selected.tierId ? `#${selected.tierId}` : 'Not set'} />
                  <Metric label="Needs" value={String(needs.length)} />
                </div>

                <Card className="section-panel">
                  <CardHeader className="p-0 pb-4"><CardTitle>New customer need</CardTitle></CardHeader>
                  <CardContent className="space-y-3 p-0">
                    <Input value={needTitle} onChange={(e) => setNeedTitle(e.target.value)} placeholder="Need title" />
                    <Textarea value={needDescription} onChange={(e) => setNeedDescription(e.target.value)} placeholder="Need description" />
                    <Input value={needProjectId} onChange={(e) => setNeedProjectId(e.target.value)} placeholder="Project ID (optional)" />
                    <Button
                      onClick={async () => {
                        if (!selected || !needTitle.trim()) return;
                        await createCustomerNeedMutation.mutateAsync({
                          customerId: selected.id,
                          data: {
                            title: needTitle.trim(),
                            description: needDescription || null,
                            projectId: needProjectId ? Number(needProjectId) : null,
                          },
                        });
                        setNeedTitle('');
                        setNeedDescription('');
                        setNeedProjectId('');
                      }}
                    >
                      Create need
                    </Button>
                    <div className="text-xs text-ink-400">Available projects: {projects.map((item) => `${item.id}:${item.name}`).join(' | ')}</div>
                  </CardContent>
                </Card>

                <Panel title="Customer needs">
                  {needs.length ? needs.map((need) => (
                    <div key={need.id} className="drawer-panel flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-ink-900">{need.title}</div>
                        <div className="mt-1 text-xs text-ink-400">{need.status} · {need.priority} · {need.projectId ? `project #${need.projectId}` : 'unlinked'}</div>
                        {need.description ? <div className="mt-2 text-sm text-ink-700">{need.description}</div> : null}
                      </div>
                      <Button variant="secondary" onClick={() => selected && deleteCustomerNeedMutation.mutate({ customerId: selected.id, needId: need.id })}>Delete</Button>
                    </div>
                  )) : <Empty label="No customer needs" />}
                </Panel>
              </>
            ) : <Card className="section-panel p-10 text-center text-ink-400">No customers</Card>}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <Card className="metric-card"><CardContent className="p-0"><div className="text-sm text-ink-700">{label}</div><div className="mt-3 text-xl font-semibold text-ink-900">{value}</div></CardContent></Card>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <Card className="section-panel"><CardHeader className="p-0 pb-4"><CardTitle>{title}</CardTitle></CardHeader><CardContent className="space-y-3 p-0">{children}</CardContent></Card>; }
function Empty({ label }: { label: string }) { return <div className="text-sm text-ink-400">{label}</div>; }
