import { useState } from 'react';
import { App } from 'antd';
import { EditOutlined } from '@ant-design/icons';

import { NmButton, NmSelect, NmTable, NmTitle, OnOff, StatusPill, Tabs } from '../../components/national/NmUi.jsx';
import { API_INTEGRATIONS, COMPLIANCE_ROWS } from '../../data/nationalManagerData.js';

const NOT_CONNECTED = 'Not connected to the backend yet: nothing was changed.';
const Panel = ({ children }) => <div className="rounded-lg border border-slate-200 bg-white p-4">{children}</div>;
const PanelTitle = ({ children }) => <h3 className="m-0 mb-1.5 text-[18px] font-bold text-[#0b4fc9]">{children}</h3>;
const Heading = ({ title, text }) => (
    <>
        <h2 className="m-0 text-[24px] font-bold text-[#0b4fc9]">{title}</h2>
        <p className="mt-1 mb-3 max-w-md text-[13px] font-semibold text-slate-900">{text}</p>
    </>
);

function Toggle({ label, value, onChange }) {
    return (
        <div className="flex items-center justify-between gap-3 py-1 text-[13px] text-slate-900">
            {label}
            <OnOff label={label} checked={value} onChange={onChange} />
        </div>
    );
}

function ApiTab() {
    const { message } = App.useApp();
    return (
        <>
            <Heading title="API Integration" text="External System connections used by IBima Assist" />
            <div className="mb-3 grid gap-2 lg:grid-cols-3">
                {API_INTEGRATIONS.map((a) => (
                    <Panel key={a.name}>
                        <PanelTitle>{a.name}</PanelTitle>
                        <div className="flex items-start justify-between gap-2">
                            <p className="m-0 text-[13px] leading-relaxed text-slate-900">
                                {a.line1}
                                <br />
                                {a.line2}
                            </p>
                            <StatusPill value={a.status} className="min-w-0 rounded-full py-0.5 text-[11px]" />
                        </div>
                        <div className="mt-3 flex gap-2">
                            <NmButton variant="outline" className="w-28" onClick={() => message.info(NOT_CONNECTED)}>
                                Test
                            </NmButton>
                            <NmButton className="w-28" onClick={() => message.info(NOT_CONNECTED)}>
                                Configure
                            </NmButton>
                        </div>
                    </Panel>
                ))}
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200">
                <NmTable
                    blue
                    rowKey="name"
                    rows={API_INTEGRATIONS}
                    columns={[
                        { key: 'name', title: 'Intigration' },
                        { key: 'type', title: 'Type' },
                        { key: 'env', title: 'Environment', render: () => 'Production' },
                        { key: 'sync', title: 'Sync', render: () => '20 September 2026 10:12 AM' },
                        { key: 'status', title: 'Status', render: (r) => <StatusPill value={r.status} /> },
                        {
                            key: 'edit',
                            title: 'Action',
                            render: () => (
                                <NmButton variant="soft" onClick={() => message.info(NOT_CONNECTED)}>
                                    Edit <EditOutlined />
                                </NmButton>
                            ),
                        },
                    ]}
                />
            </div>
        </>
    );
}

function UpdateTab() {
    const { message } = App.useApp();
    const [flags, setFlags] = useState({ approval: false, patches: false, maintenance: false });
    const set = (key) => (v) => setFlags((f) => ({ ...f, [key]: v }));
    return (
        <>
            <Heading title="System Update" text="Control Platforms Version updates maintenance and development history" />
            <Panel>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <PanelTitle>Current Version</PanelTitle>
                        <p className="m-0 text-[14px] font-semibold text-slate-900">IBima Assist Enterprise v2.4.1</p>
                        <p className="m-0 text-[12px] font-semibold text-slate-900">Production Environment</p>
                    </div>
                    <StatusPill value="Up to Date" className="min-w-0 rounded-full py-0.5 text-[11px]" />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-md bg-[#bcd0f3] px-5 py-5">
                    <div>
                        <p className="m-0 text-[14px] font-semibold text-slate-900">Latest Available: v2.4.2</p>
                        <p className="m-0 text-[12px] font-semibold text-slate-900">Release Date 19 september 2026</p>
                    </div>
                    <NmButton onClick={() => message.info(NOT_CONNECTED)}>Check/Update</NmButton>
                </div>
            </Panel>
            <div className="mt-4 grid gap-2 lg:grid-cols-3">
                <Panel>
                    <PanelTitle>Update Policy</PanelTitle>
                    <Toggle label="Maintenance approval required" value={flags.approval} onChange={set('approval')} />
                    <Toggle label="Auto security patches" value={flags.patches} onChange={set('patches')} />
                </Panel>
                <Panel>
                    <PanelTitle>Maintenance Mode</PanelTitle>
                    <p className="m-0 text-[13px] text-slate-900">Restrict Access during planned updates</p>
                    <Toggle label={flags.maintenance ? 'ON' : 'OFF'} value={flags.maintenance} onChange={set('maintenance')} />
                </Panel>
                <Panel>
                    <div className="flex justify-between">
                        <PanelTitle>Deployment History</PanelTitle>
                        <span className="text-[13px]">v2.4.1</span>
                    </div>
                    <p className="m-0 text-[13px] leading-relaxed text-slate-900">
                        Last successful development
                        <br />
                        18 september 2026 - 02:15 AM
                    </p>
                    <NmButton className="mt-2 w-28" onClick={() => message.info(NOT_CONNECTED)}>
                        View
                    </NmButton>
                </Panel>
            </div>
        </>
    );
}

function ComplianceTab() {
    const [flags, setFlags] = useState({ admin: false, input: false, config: false });
    const [retention, setRetention] = useState('7 Years');
    const set = (key) => (v) => setFlags((f) => ({ ...f, [key]: v }));
    return (
        <>
            <Heading title="Audit & Compliance" text="Configure audit controls and monitor compliance - sensitive activities" />
            <div className="mb-3 grid gap-2 lg:grid-cols-3">
                <Panel>
                    <PanelTitle>Audit Login</PanelTitle>
                    <p className="m-0 text-[13px] text-slate-900">Record user and system activites</p>
                    <Toggle label="Capture admin action" value={flags.admin} onChange={set('admin')} />
                </Panel>
                <Panel>
                    <PanelTitle>Audit Retention</PanelTitle>
                    <p className="mt-0 mb-2 text-[13px] text-slate-900">Audit retention period for audit records</p>
                    <NmSelect value={retention} onChange={setRetention} options={['3 Years', '5 Years', '7 Years', '10 Years']} />
                </Panel>
                <Panel>
                    <PanelTitle>Compilance Control</PanelTitle>
                    <Toggle label="Input activity loging" value={flags.input} onChange={set('input')} />
                    <Toggle label="Config change approval" value={flags.config} onChange={set('config')} />
                </Panel>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200">
                <NmTable
                    blue
                    rowKey="activity"
                    rows={COMPLIANCE_ROWS}
                    columns={[
                        { key: 'at', title: 'Date & Time' },
                        { key: 'user', title: 'User' },
                        { key: 'activity', title: 'Activity' },
                        { key: 'module', title: 'Module' },
                        { key: 'status', title: 'Status', render: (r) => <StatusPill value={r.status} className="whitespace-nowrap" /> },
                    ]}
                />
            </div>
        </>
    );
}

const TABS = [
    { key: 'api', label: 'API Integration', Tab: ApiTab },
    { key: 'update', label: 'System Update', Tab: UpdateTab },
    { key: 'audit', label: 'Audit & Compilance', Tab: ComplianceTab },
];

/** System Settings (Figma frames 2002:37430, 2002:37733, 2002:37988). */
export default function NmSystemPage() {
    const [tab, setTab] = useState(TABS[0].key);
    const { Tab } = TABS.find((t) => t.key === tab);
    return (
        <div>
            <NmTitle title="System Settings" sample />
            <Tabs tabs={TABS} active={tab} onChange={setTab} />
            <Tab />
        </div>
    );
}
