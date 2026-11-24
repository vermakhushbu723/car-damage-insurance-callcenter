import { useMemo, useState } from 'react';
import { App, Avatar } from 'antd';
import { BankOutlined, CheckCircleOutlined, CloseCircleOutlined, EditOutlined, EyeOutlined, InfoCircleOutlined, MinusCircleOutlined, PlusSquareOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';

import Pager from '../../components/common/Pager.jsx';
import {
    Card,
    DrawerSection,
    FieldLabel,
    KpiCard,
    NmButton,
    NmDrawer,
    NmInput,
    NmSearch,
    NmSelect,
    NmTable,
    NmTitle,
    OnOff,
    StatusPill,
} from '../../components/national/NmUi.jsx';
import {
    BRANCH_KPIS,
    BRANCHES,
    PERMISSION_ACTIONS,
    PERMISSION_MODULES,
    ROLE_TABS,
    SURVEYORS,
    USER_KPIS,
    USERS,
} from '../../data/nationalManagerData.js';
import cn from '../../utils/cn.js';
import { INDIA_STATES, REGION_OF_STATE, citiesOf } from '../../data/indiaLocations.js';

const NOT_CONNECTED = 'Not connected to the backend yet: this change was not saved.';
const KPI_ICONS = { blue: <BankOutlined />, green: <CheckCircleOutlined />, amber: <MinusCircleOutlined />, red: <CloseCircleOutlined /> };
const uniq = (list) => [...new Set(list)];

const NameCell = ({ name }) => (
    <span className="flex items-center gap-2.5 font-medium whitespace-nowrap">
        <Avatar size={34} icon={<UserOutlined />} className="shrink-0 !bg-[#c58f62]" /> {name}
    </span>
);

const EyeButton = ({ label, onClick }) => (
    <button type="button" aria-label={label} onClick={onClick} className="px-2 text-[15px] text-slate-800 hover:text-[#0b4fc9]">
        <EyeOutlined />
    </button>
);

/** Users (Figma frame 2002:30838). */
export function NmUsersPage() {
    const { message } = App.useApp();
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ organization: '', role: '', status: '' });
    const [applied, setApplied] = useState(filters);
    const [view, setView] = useState(null);

    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();
        return USERS.filter(
            (u) =>
                (!q || `${u.name} ${u.organization} ${u.branch}`.toLowerCase().includes(q)) &&
                (!applied.organization || u.organization === applied.organization) &&
                (!applied.role || u.role === applied.role) &&
                (!applied.status || u.status === applied.status)
        );
    }, [search, applied]);

    const set = (key) => (value) => setFilters((f) => ({ ...f, [key]: value === 'All' ? '' : value }));

    return (
        <div>
            <NmTitle title="Users" sample>
                <NmButton onClick={() => message.info(NOT_CONNECTED)}>Edit &amp; Modify</NmButton>
            </NmTitle>
            <div className="mb-2 grid gap-2 md:grid-cols-[1fr_auto_auto_auto_auto_auto]">
                <NmSearch value={search} onChange={setSearch} placeholder="Search Users........" />
                <NmSelect className="md:!w-36" value={filters.organization} onChange={set('organization')} placeholder="Organisation All" options={['All', ...uniq(USERS.map((u) => u.organization))]} />
                <NmSelect className="md:!w-32" value={filters.role} onChange={set('role')} placeholder="Role All" options={['All', ...uniq(USERS.map((u) => u.role))]} />
                <NmSelect className="md:!w-32" value={filters.status} onChange={set('status')} placeholder="Status All" options={['All', 'Active', 'Pending', 'Suspended']} />
                <NmButton onClick={() => setApplied(filters)}>Apply Filters</NmButton>
                <NmButton className="md:w-44" onClick={() => message.info(NOT_CONNECTED)}>
                    + Add User
                </NmButton>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
                {USER_KPIS.map((k) => (
                    <KpiCard key={k.title} {...k} icon={KPI_ICONS[k.tone]} />
                ))}
            </div>
            <Card className="overflow-hidden">
                <NmTable
                    rows={rows}
                    empty="No users match these filters"
                    columns={[
                        { key: 'name', title: 'Users Name', render: (r) => <NameCell name={r.name} /> },
                        { key: 'organization', title: 'Organization' },
                        { key: 'role', title: 'Role' },
                        { key: 'status', title: 'Staus', render: (r) => <StatusPill value={r.status} /> },
                        { key: 'branch', title: 'Branch' },
                        { key: 'lastLogin', title: 'Last Login' },
                        { key: 'action', title: 'Action', align: 'center', render: (r) => <EyeButton label={`View ${r.name}`} onClick={() => setView(r)} /> },
                    ]}
                />
                <Pager current={1} total={1} />
            </Card>

            <NmDrawer open={!!view} onClose={() => setView(null)} title="User Details">
                {view ? (
                    <div className="grid gap-3">
                        {[['Name', view.name], ['Organization', view.organization], ['Role', view.role], ['Status', view.status], ['Branch', view.branch], ['Last Login', view.lastLogin]].map(([label, value]) => (
                            <FieldLabel key={label} label={label}>
                                <NmInput readOnly value={value} />
                            </FieldLabel>
                        ))}
                    </div>
                ) : null}
            </NmDrawer>
        </div>
    );
}

const fullMatrix = () => Object.fromEntries(PERMISSION_MODULES.map((m) => [m, Object.fromEntries(PERMISSION_ACTIONS.map((a) => [a, true]))]));

/** Roles & Permissions (Figma frame 2002:31107). */
export function NmRolesPage() {
    const { message } = App.useApp();
    const [role, setRole] = useState(ROLE_TABS[0]);
    const [matrices, setMatrices] = useState({});
    const [editing, setEditing] = useState(false);
    const matrix = matrices[role] ?? fullMatrix();

    const toggle = (module, action, value) =>
        setMatrices((all) => ({ ...all, [role]: { ...matrix, [module]: { ...matrix[module], [action]: value } } }));

    return (
        <div>
            <NmTitle title="Role &amp; Permissions" sample />
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-[#f4f4f6] px-4 py-3">
                <div>
                    <p className="m-0 text-[13px] font-semibold text-[#0b4fc9]">Users &amp; Roles</p>
                    <p className="m-0 text-[11.5px] text-slate-900">Create Sub-Users IDs &amp; Control Page-Level View, Edit, Create &amp; Approval Rights</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    <NmButton variant="soft" onClick={() => setEditing((v) => !v)}>
                        <EditOutlined /> {editing ? 'Stop Editing' : 'Edit/Modify'}
                    </NmButton>
                    <NmButton onClick={() => message.info(NOT_CONNECTED)}>
                        <PlusSquareOutlined /> Add User
                    </NmButton>
                    <NmButton
                        onClick={() => {
                            setEditing(false);
                            message.info(NOT_CONNECTED);
                        }}
                    >
                        <SaveOutlined /> Save
                    </NmButton>
                </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-1" role="tablist" aria-label="Roles">
                {ROLE_TABS.map((r) => (
                    <button
                        key={r}
                        type="button"
                        role="tab"
                        aria-selected={role === r}
                        onClick={() => setRole(r)}
                        className={cn(
                            'rounded-md border px-2 py-2 text-[11px] font-medium',
                            role === r ? 'border-[#0b4fc9] bg-[#0b4fc9] text-white' : 'border-slate-200 bg-[#f4f4f6] text-slate-500 hover:text-slate-800'
                        )}
                    >
                        {r}
                    </button>
                ))}
            </div>

            <div className="mb-3 grid gap-2 sm:grid-cols-3 xl:max-w-[58%]">
                {[['Select Role', role], ['Permission Model', 'Page + Action Level'], ['Users In Role', '12']].map(([label, value]) => (
                    <div key={label} className="rounded-md border border-slate-200 bg-[#f4f4f6] px-3 py-3">
                        <p className="m-0 text-[10.5px] text-slate-400">{label}</p>
                        <p className="m-0 text-[15px] font-semibold text-slate-900">{value}</p>
                    </div>
                ))}
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-[#f4f4f6]">
                <h2 className="m-0 px-5 py-3 text-[16px] font-bold text-[#0b4fc9]">Page &amp; Permission Matrix</h2>
                <NmTable
                    blue
                    rowKey="module"
                    rows={PERMISSION_MODULES.map((module) => ({ module }))}
                    columns={[
                        { key: 'module', title: 'Page/Module', render: (r) => <span className="font-medium whitespace-nowrap">{r.module}</span> },
                        ...PERMISSION_ACTIONS.map((a) => ({
                            key: a,
                            title: a,
                            render: (r) => (
                                <OnOff
                                    label={`${r.module} ${a}`}
                                    checked={matrix[r.module][a]}
                                    disabled={!editing}
                                    onChange={(v) => toggle(r.module, a, v)}
                                />
                            ),
                        })),
                    ]}
                />
            </div>
        </div>
    );
}

const EMPTY_BRANCH = { name: '', code: '', organization: '', city: '', address: '', state: '', region: '', rm: '', sm: '', csm: '', status: 'Active' };

/** Branches/Offices with the Create Branch panel (Figma frames 2002:31897, 2002:35940). */
export function NmBranchesPage() {
    const { message } = App.useApp();
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [view, setView] = useState(null);
    const [form, setForm] = useState(EMPTY_BRANCH);
    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e?.target ? e.target.value : e }));

    const rows = BRANCHES.filter((b) => b.name.toLowerCase().includes(search.trim().toLowerCase()));
    const close = () => {
        setOpen(false);
        setForm(EMPTY_BRANCH);
    };
    const save = () => {
        message.info(NOT_CONNECTED);
        close();
    };

    return (
        <div>
            <NmTitle title="Branches/Offices" sample />
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <NmSearch value={search} onChange={setSearch} placeholder="Search Branch By Name" className="w-full md:w-[36%]" />
                <NmButton className="w-52" onClick={() => setOpen(true)}>
                    + Add Branch
                </NmButton>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
                {BRANCH_KPIS.map((k) => (
                    <KpiCard key={k.title} {...k} icon={KPI_ICONS[k.tone]} />
                ))}
            </div>
            <Card className="overflow-hidden">
                <NmTable
                    rows={rows}
                    empty="No branch with this name"
                    columns={[
                        { key: 'name', title: 'Branch', render: (r) => <NameCell name={r.name} /> },
                        { key: 'organization', title: 'Organization' },
                        { key: 'city', title: 'City' },
                        { key: 'status', title: 'Staus', render: (r) => <StatusPill value={r.status} /> },
                        { key: 'klass', title: 'Class' },
                        { key: 'actions', title: 'Actions', align: 'center', render: (r) => <EyeButton label={`View ${r.name}`} onClick={() => setView(r)} /> },
                    ]}
                />
                <Pager current={1} total={1} />
            </Card>

            <NmDrawer
                open={open}
                onClose={close}
                title="Create Branch"
                subtitle="Trigger - Recipient - Channel - Template - Reminder - Escalation"
                footer={
                    <div className="grid grid-cols-3 gap-2">
                        <NmButton variant="outline" onClick={close}>
                            Cancel
                        </NmButton>
                        <NmButton variant="soft" onClick={save}>
                            Save Draft
                        </NmButton>
                        <NmButton onClick={save}>Save &amp; Activate</NmButton>
                    </div>
                }
            >
                <DrawerSection title="1. Branch Information">
                    <FieldLabel label="Branch Name" required>
                        <NmInput value={form.name} onChange={set('name')} placeholder="Enter Branch Name" />
                    </FieldLabel>
                    <FieldLabel label="Branch Code" required>
                        <NmInput value={form.code} onChange={set('code')} placeholder="Enter Branch Code" />
                    </FieldLabel>
                    <FieldLabel label="Organisation" required>
                        <NmSelect value={form.organization} onChange={set('organization')} placeholder="Select Organization" options={uniq(BRANCHES.map((b) => b.organization))} />
                    </FieldLabel>
                    <FieldLabel label="State" required>
                        <NmSelect
                            showSearch
                            value={form.state}
                            onChange={(state) => setForm((f) => ({ ...f, state, region: REGION_OF_STATE[state] ?? '', city: f.state === state ? f.city : undefined }))}
                            placeholder="Select State"
                            options={INDIA_STATES}
                        />
                    </FieldLabel>
                    <FieldLabel label="City" required>
                        <NmSelect showSearch value={form.city} onChange={set('city')} placeholder={form.state ? 'Select City' : 'Select State first'} options={citiesOf(form.state)} />
                    </FieldLabel>
                    <FieldLabel label="Address" required className="sm:col-span-2">
                        <NmInput value={form.address} onChange={set('address')} placeholder="Enter Address" />
                    </FieldLabel>
                </DrawerSection>
                <DrawerSection title="2. Region (Auto Assigned)">
                    <FieldLabel label="Region" required>
                        <NmInput value={form.region} onChange={set('region')} placeholder="Auto from State" />
                    </FieldLabel>
                    <p className="m-0 flex items-center gap-2 rounded-md border border-[#0b4fc9] bg-[#bcd0f3] px-3 py-2 text-[11.5px] text-[#0b4fc9] sm:col-span-2">
                        <InfoCircleOutlined /> Region Is Automatically Assigned Based On The Selected State
                    </p>
                </DrawerSection>
                <DrawerSection title="3. Assignment">
                    {[['rm', 'Regional Manager', 'Suresh Yadav (RM - West)'], ['sm', 'State Manager', 'Pooja Sharma (SM - Rajasthan)'], ['csm', 'CSM (Branch Handler)', 'Ramesh Kumar (CSM)']].map(([key, label, sample]) => (
                        <FieldLabel key={key} label={label} required className="sm:col-span-2">
                            <NmSelect value={form[key]} onChange={set(key)} placeholder={sample} options={[sample]} />
                        </FieldLabel>
                    ))}
                </DrawerSection>
                <DrawerSection title="4. Branch Status">
                    <FieldLabel label="Status" required className="sm:col-span-2">
                        <NmSelect value={form.status} onChange={set('status')} options={['Active', 'Pending', 'Suspended']} />
                    </FieldLabel>
                </DrawerSection>
            </NmDrawer>

            <NmDrawer open={!!view} onClose={() => setView(null)} title="Branch Details">
                {view ? (
                    <div className="grid gap-3">
                        {[['Branch', view.name], ['Organization', view.organization], ['City', view.city], ['Status', view.status], ['Class', view.klass]].map(([label, value]) => (
                            <FieldLabel key={label} label={label}>
                                <NmInput readOnly value={value} />
                            </FieldLabel>
                        ))}
                    </div>
                ) : null}
            </NmDrawer>
        </div>
    );
}

/** Surveyors: Figma has the rail entry but no frame, so this follows the Users list. */
export function NmSurveyorsPage() {
    const { message } = App.useApp();
    const [search, setSearch] = useState('');
    const rows = SURVEYORS.filter((s) => `${s.name} ${s.code} ${s.branch}`.toLowerCase().includes(search.trim().toLowerCase()));
    return (
        <div>
            <NmTitle title="Surveyors" sample />
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <NmSearch value={search} onChange={setSearch} placeholder="Search Surveyors........" className="w-full md:w-[36%]" />
                <NmButton className="w-44" onClick={() => message.info(NOT_CONNECTED)}>
                    + Add Surveyor
                </NmButton>
            </div>
            <Card className="overflow-hidden">
                <NmTable
                    rows={rows}
                    empty="No surveyor matches"
                    columns={[
                        { key: 'name', title: 'Surveyor', render: (r) => <NameCell name={r.name} /> },
                        { key: 'code', title: 'Surveyor ID' },
                        { key: 'type', title: 'Type' },
                        { key: 'branch', title: 'Branch' },
                        { key: 'open', title: 'Open Claims' },
                        { key: 'status', title: 'Staus', render: (r) => <StatusPill value={r.status} /> },
                    ]}
                />
                <Pager current={1} total={1} />
            </Card>
        </div>
    );
}
