import { useState } from 'react';
import { App, DatePicker } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

import Pager from '../../components/common/Pager.jsx';
import {
    BarRow,
    Card,
    DonutCard,
    DrawerSection,
    FieldLabel,
    KpiCard,
    NmButton,
    NmDrawer,
    NmInput,
    NmSelect,
    NmTable,
    NmTitle,
    OnOff,
    StatusPill,
    Tabs,
} from '../../components/national/NmUi.jsx';
import {
    AUDIT_BY_MODULE,
    AUDIT_KPIS,
    AUDIT_ROWS,
    FRAUD_KPIS,
    FRAUD_RULES,
    OPEN_TRIGGERS,
    ROUTING_MATRIX,
    RULE_DESIGN,
    SAFEGUARDS,
    SECURITY_SUMMARY,
    TAT_BREACH_CHART,
    TAT_ROWS,
    TRIGGER_HISTORY,
} from '../../data/nationalManagerData.js';

const NOT_CONNECTED = 'Not connected to the backend yet: this change was not saved.';

/** TAT Monitor: Figma has the rail entry but no frame, so this reuses the TAT Breach chart. */
export function NmTatMonitorPage() {
    return (
        <div>
            <NmTitle title="TAT Monitor" sample />
            <div className="grid gap-3 xl:grid-cols-[1fr_2fr]">
                <DonutCard title="TAT Breach Summary" data={TAT_BREACH_CHART} />
                <Card title="Stage Wise TAT" className="overflow-hidden">
                    <NmTable
                        blue
                        rowKey="stage"
                        rows={TAT_ROWS}
                        minWidth={520}
                        columns={[
                            { key: 'stage', title: 'Stage' },
                            { key: 'target', title: 'Target' },
                            { key: 'onTrack', title: 'On Track' },
                            { key: 'breached', title: 'Breached', render: (r) => <StatusPill value={r.breached} tone="red" /> },
                        ]}
                    />
                </Card>
            </div>
        </div>
    );
}

function RoutingTab() {
    const { message } = App.useApp();
    const [active, setActive] = useState(() => Object.fromEntries(ROUTING_MATRIX.map((r) => [r.id, true])));
    const [guards, setGuards] = useState(() => Object.fromEntries(SAFEGUARDS.map((s) => [s, true])));
    return (
        <>
            <div className="mb-3 flex justify-end gap-2">
                <NmButton className="w-24" onClick={() => message.info(NOT_CONNECTED)}>
                    Edit
                </NmButton>
                <NmButton className="w-24" onClick={() => message.info(NOT_CONNECTED)}>
                    Save
                </NmButton>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2 xl:grid-cols-5">
                {FRAUD_KPIS.map((k) => (
                    <KpiCard
                        key={k.title}
                        {...k}
                        footer={<span className="text-[11.5px] font-medium text-[#0b4fc9]">View/Configuration</span>}
                    />
                ))}
            </div>
            <Card title="Routing Matrix" className="overflow-hidden">
                <NmTable
                    rows={ROUTING_MATRIX}
                    columns={[
                        { key: 'severity', title: 'Severity' },
                        { key: 'score', title: 'Score' },
                        { key: 'action', title: 'Action' },
                        { key: 'recipient', title: 'Recipient' },
                        { key: 'hold', title: 'Hold' },
                        {
                            key: 'active',
                            title: 'Active',
                            render: (r) => <OnOff label={`${r.severity} active`} checked={active[r.id]} onChange={(v) => setActive((a) => ({ ...a, [r.id]: v }))} />,
                        },
                    ]}
                />
            </Card>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <Card title="Open Trigger Queue" className="bg-[#f4f4f6] pb-3">
                    <ul className="m-0 list-none px-4 p-0">
                        {OPEN_TRIGGERS.map((t) => (
                            <li key={t.claim} className="flex items-center justify-between gap-3 border-b border-slate-300 py-1.5 text-[12px]">
                                <span>
                                    <b>{t.claim}</b> &nbsp; {t.trigger}
                                </span>
                                <StatusPill value={t.route} tone="red" className="min-w-0 text-[11.5px]" />
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card title="Safeguards" className="bg-[#f4f4f6] pb-3">
                    <ul className="m-0 list-none px-4 p-0">
                        {SAFEGUARDS.map((s) => (
                            <li key={s} className="flex items-center justify-between gap-3 border-b border-slate-300 py-2 text-[12px]">
                                {s}
                                <OnOff label={s} checked={guards[s]} onChange={(v) => setGuards((g) => ({ ...g, [s]: v }))} />
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </>
    );
}

function RulesTab() {
    const { message } = App.useApp();
    const [on, setOn] = useState(() => Object.fromEntries(FRAUD_RULES.map((r) => [r.id, true])));
    return (
        <>
            <div className="mb-3 flex justify-end gap-2">
                <NmButton onClick={() => message.info(NOT_CONNECTED)}>+ Create Trigger</NmButton>
                <NmButton onClick={() => message.info(NOT_CONNECTED)}>Publish Rules</NmButton>
            </div>
            <Card title="Fraud Trigger Rule" className="overflow-hidden">
                <NmTable
                    rows={FRAUD_RULES}
                    minWidth={960}
                    columns={[
                        { key: 'rule', title: 'Rule' },
                        { key: 'stage', title: 'Stage' },
                        { key: 'severity', title: 'Severity', render: (r) => <StatusPill value={r.severity} /> },
                        { key: 'score', title: 'Score' },
                        { key: 'condition', title: 'Condition' },
                        { key: 'action', title: 'Action' },
                        { key: 'active', title: 'Active', render: (r) => <OnOff label={`${r.rule} active`} checked={on[r.id]} onChange={(v) => setOn((a) => ({ ...a, [r.id]: v }))} /> },
                        { key: 'edit', title: '', render: () => <NmButton variant="soft" onClick={() => message.info(NOT_CONNECTED)}>Edit</NmButton> },
                    ]}
                />
            </Card>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <Card title="Rules Simulator" className="pb-4">
                    <div className="grid gap-3 px-4 sm:grid-cols-3">
                        <FieldLabel label="Claim Amount">
                            <NmInput defaultValue="75000" />
                        </FieldLabel>
                        <FieldLabel label="Prior Claims">
                            <NmInput defaultValue="3" />
                        </FieldLabel>
                        <FieldLabel label="Documents">
                            <NmSelect value="Duplicate" options={['Duplicate', 'Original']} />
                        </FieldLabel>
                    </div>
                    <div className="px-4 pt-4">
                        <NmButton onClick={() => message.info('Not connected to the backend yet: the simulation did not run.')}>Run Simulation</NmButton>
                    </div>
                </Card>
                <Card title="Rule Design" className="pb-4">
                    <ul className="m-0 list-none space-y-2 px-4 p-0">
                        {RULE_DESIGN.map((r) => (
                            <li key={r} className="rounded-md border border-slate-200 bg-[#f1f3f6] px-3 py-2.5 text-[11.5px] text-slate-600">
                                {r}
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </>
    );
}

function HistoryTab() {
    const { message } = App.useApp();
    const [status, setStatus] = useState('All');
    const rows = status === 'All' ? TRIGGER_HISTORY : TRIGGER_HISTORY.filter((r) => r.status === status);
    return (
        <>
            <div className="mb-3 flex justify-end">
                <NmButton onClick={() => message.info('Not connected to the backend yet: nothing was exported.')}>
                    Export <DownloadOutlined />
                </NmButton>
            </div>
            <div className="mb-3 grid gap-3 rounded-lg border border-slate-200 bg-[#f4f4f6] p-3 md:grid-cols-3">
                <FieldLabel label="From" required>
                    <DatePicker className="w-full" format="DD-MM-YYYY" placeholder="Select From Date" />
                </FieldLabel>
                <FieldLabel label="To" required>
                    <DatePicker className="w-full" format="DD-MM-YYYY" placeholder="Select To Date" />
                </FieldLabel>
                <FieldLabel label="Status" required>
                    <NmSelect value={status} onChange={setStatus} options={['All', 'Open', 'Under review', 'Escalated', 'Cleared']} />
                </FieldLabel>
            </div>
            <Card title="Trigger" className="overflow-hidden">
                <NmTable
                    rows={rows}
                    empty="No triggers with this status"
                    columns={[
                        { key: 'at', title: 'Date/Time' },
                        { key: 'claim', title: 'Claim' },
                        { key: 'trigger', title: 'Trigger' },
                        { key: 'score', title: 'Score' },
                        { key: 'route', title: 'Route' },
                        { key: 'reviewer', title: 'Reviewer' },
                        { key: 'status', title: 'Status', render: (r) => <StatusPill value={r.status} className="whitespace-nowrap" /> },
                    ]}
                />
            </Card>
        </>
    );
}

const FRAUD_TABS = [
    { key: 'routing', label: 'Fraud Routing', Tab: RoutingTab },
    { key: 'rules', label: 'Fraud Trigger Rules', Tab: RulesTab },
    { key: 'history', label: 'Trigger History', Tab: HistoryTab },
];

/** Fraud Triggers: the three Figma frames as tabs of the single rail entry. */
export function NmFraudPage() {
    const [tab, setTab] = useState(FRAUD_TABS[0].key);
    const { Tab } = FRAUD_TABS.find((t) => t.key === tab);
    return (
        <div>
            <NmTitle title="Fraud Triggers" sample />
            <Tabs tabs={FRAUD_TABS} active={tab} onChange={setTab} />
            <Tab />
        </div>
    );
}

const MAX_AUDIT = Math.max(...AUDIT_BY_MODULE.map((m) => m.value));

/** Audit Logs with the event panel (Figma frames 2002:32138, 2002:37336). */
export function NmAuditPage() {
    const { message } = App.useApp();
    const [query, setQuery] = useState('');
    const [module, setModule] = useState('All Modules');
    const [applied, setApplied] = useState({ query: '', module: 'All Modules' });
    const [event, setEvent] = useState(null);

    const rows = AUDIT_ROWS.filter(
        (r) =>
            (applied.module === 'All Modules' || r.module === applied.module) &&
            (!applied.query || `${r.user} ${r.update} ${r.reference}`.toLowerCase().includes(applied.query.toLowerCase()))
    );

    return (
        <div>
            <NmTitle title="Audit Logs" sample />
            <div className="mb-3 grid grid-cols-2 gap-2 xl:grid-cols-5">
                {AUDIT_KPIS.map((k) => (
                    <KpiCard key={k.title} {...k} />
                ))}
            </div>
            <div className="mb-3 grid items-end gap-2 md:grid-cols-3 xl:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]">
                <FieldLabel label="Search Audit Logs">
                    <NmInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search User, Claim, Action" />
                </FieldLabel>
                <FieldLabel label="From">
                    <DatePicker className="w-full" format="DD MMM YYYY" placeholder="Select From Date" />
                </FieldLabel>
                <FieldLabel label="To">
                    <DatePicker className="w-full" format="DD MMM YYYY" placeholder="Select To Date" />
                </FieldLabel>
                <FieldLabel label="Module">
                    <NmSelect value={module} onChange={setModule} options={['All Modules', 'Claims', 'Users', 'Reports', 'System', 'Data']} />
                </FieldLabel>
                <FieldLabel label="Action">
                    <NmSelect value="All Action" options={['All Action']} />
                </FieldLabel>
                <NmButton className="h-[38px] w-28" onClick={() => setApplied({ query, module })}>
                    Apply
                </NmButton>
            </div>
            <Card className="overflow-hidden">
                <h2 className="m-0 px-5 py-4 text-[17px] font-bold text-slate-900">Audit Logs Details</h2>
                <NmTable
                    rows={rows}
                    empty="No events match these filters"
                    minWidth={1000}
                    columns={[
                        { key: 'date', title: 'Date & Time', render: (r) => <>{r.date}<br />{r.time}</> },
                        { key: 'user', title: 'Users & Role', render: (r) => <>{r.user}<br />{r.role}</> },
                        { key: 'update', title: 'Update' },
                        { key: 'reference', title: 'Reference' },
                        { key: 'ip', title: 'IP/Devices' },
                        { key: 'module', title: 'Module' },
                        { key: 'status', title: 'Status', render: (r) => <StatusPill value={r.status} /> },
                        { key: 'action', title: 'Action', render: (r) => <NmButton variant="soft" onClick={() => setEvent(r)}>View</NmButton> },
                    ]}
                />
                <Pager current={1} total={1} />
            </Card>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <Card className="p-4">
                    <h2 className="m-0 mb-3 text-[17px] font-bold text-slate-900">Audit By Module</h2>
                    <ul className="m-0 list-none space-y-4 p-0">
                        {AUDIT_BY_MODULE.map((m) => (
                            <BarRow key={m.label} {...m} max={MAX_AUDIT} />
                        ))}
                    </ul>
                </Card>
                <Card className="p-4">
                    <h2 className="m-0 mb-3 text-[17px] font-bold text-slate-900">Security Summery</h2>
                    <dl className="m-0 space-y-3">
                        {SECURITY_SUMMARY.map(([k, v]) => (
                            <div key={k} className="flex justify-between text-[12.5px] font-semibold text-slate-800">
                                <dt>{k}</dt>
                                <dd className="m-0">{v}</dd>
                            </div>
                        ))}
                    </dl>
                    <NmButton variant="soft" className="mt-4 w-full" onClick={() => setApplied({ query: '', module: 'System' })}>
                        View Security Events
                    </NmButton>
                </Card>
            </div>

            <NmDrawer
                open={!!event}
                onClose={() => setEvent(null)}
                title="Audit Event Details"
                footer={
                    <div className="grid grid-cols-2 gap-2">
                        <NmButton variant="outline" onClick={() => setEvent(null)}>
                            Close
                        </NmButton>
                        <NmButton onClick={() => message.info('Not connected to the backend yet: nothing was exported.')}>Export Event</NmButton>
                    </div>
                }
            >
                {event ? (
                    <>
                        <DrawerSection title="Audit Event">
                            {[['Event ID', event.id], ['Date & Time', `${event.date} ${event.time}`], ['User / Role', `${event.user} / ${event.role}`], ['Module', event.module], ['Action', event.update], ['Reference', event.reference], ['Status', event.status], ['IP / Device', event.ip]].map(([label, value]) => (
                                <FieldLabel key={label} label={label} required className="sm:col-span-2">
                                    <NmInput readOnly value={value} />
                                </FieldLabel>
                            ))}
                        </DrawerSection>
                        <p className="mb-1.5 text-[12.5px] font-medium">Change / Event Details</p>
                        <pre className="m-0 rounded-md bg-black p-3 font-sans text-[11.5px] leading-relaxed whitespace-pre-wrap text-white">
                            {`Action: ${event.update}\nReference: ${event.reference}\nPerformed By: ${event.user}\nTimestamp: ${event.date} ${event.time}\n\nPrevious Value: Existing Configuration/State\nNew Value: Updated Configuration/State\n\nPermission Check: PASSED\nAudit Record: STORED`}
                        </pre>
                    </>
                ) : null}
            </NmDrawer>
        </div>
    );
}
