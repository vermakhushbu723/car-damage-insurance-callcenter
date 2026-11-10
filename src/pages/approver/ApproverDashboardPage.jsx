import { useCallback, useEffect, useState } from 'react';
import { App, Dropdown, Input, Modal, Tooltip } from 'antd';
import {
    ArrowDownOutlined,
    ArrowUpOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    FieldTimeOutlined,
    InfoCircleOutlined,
    MoreOutlined,
    StopOutlined,
    WalletOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Pager from '../../components/common/Pager.jsx';
import QuickFiltersModal, { EMPTY_FILTERS, filterParams } from '../../components/dashboard/QuickFiltersModal.jsx';
import ROUTES from '../../constants/routes.js';
import { api } from '../../api/client.js';
import { useAppState } from '../../context/AppContext.jsx';
import { errText } from '../../utils/format.js';
import cn from '../../utils/cn.js';
import { useOpenClaim } from '../national/nmClaims.js';

const SHORT = 7;
const LONG = 50;
const SHADOW = 'shadow-[0_1px_5px_rgba(15,23,42,0.14)]';

const inCrore = (n) => {
    const v = Number(n) || 0;
    if (v >= 1e7) return `${(v / 1e7).toFixed(2)} Cr`;
    if (v >= 1e5) return `${(v / 1e5).toFixed(2)} L`;
    return `₹${v.toLocaleString('en-IN')}`;
};
const pad = (n) => String(n).padStart(2, '0');

/** "15 Mins Ago", "01 Hour Ago", "02 Days Ago". */
const ago = (iso) => {
    if (!iso) return '—';
    const mins = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60000));
    if (mins < 60) return `${mins} Min${mins === 1 ? '' : 's'} Ago`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `${pad(h)} Hour${h === 1 ? '' : 's'} Ago`;
    const d = Math.floor(h / 24);
    return `${pad(d)} Day${d === 1 ? '' : 's'} Ago`;
};

const clock = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase() : '—');

/** "Today,04:00 PM" / "Tomorrow,04:00 PM" / "12 Nov,04:00 PM". */
const etaText = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.round((day - today) / 86400000);
    const label = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    return `${label},${clock(iso)}`;
};

const PRIORITY_TONES = {
    Critical: 'bg-[#f3c4c4] text-[#c81414]',
    High: 'bg-[#f3c4c4] text-[#c81414]',
    Medium: 'bg-[#fde3c4] text-[#ea8a0c]',
    Low: 'bg-[#cdf2d5] text-[#16a34a]',
};
const PAY_TONES = {
    Ready: 'bg-[#cdf2d5] text-[#16a34a]',
    'Awaiting Transfer': 'bg-[#c5daff] text-[#1668e3]',
    Processing: 'bg-[#fde3c4] text-[#ea8a0c]',
};

const Pill = ({ tone, className = '', children }) => (
    <span className={cn('inline-flex justify-center rounded-md px-2.5 py-1 text-[13px] font-medium whitespace-nowrap', tone, className)}>{children}</span>
);

function Tile({ title, value, note, trend, color, text, icon, tip }) {
    const down = trend?.direction === 'down';
    return (
        <div className={cn('flex min-w-0 items-center gap-3 rounded-lg bg-white p-3.5', SHADOW)}>
            <span className="grid h-13 w-13 shrink-0 place-items-center rounded-full text-[23px] text-white" style={{ background: color }}>
                {icon}
            </span>
            <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-1">
                    <span className={cn('truncate text-[14px] font-semibold', text)}>{title}</span>
                    <Tooltip title={tip}>
                        <InfoCircleOutlined className="shrink-0 text-[13px] text-slate-700" />
                    </Tooltip>
                </span>
                <span className="block truncate text-[25px] leading-tight font-bold text-slate-900">{value}</span>
                <span className="block truncate text-[11.5px] font-medium text-slate-800">{note}</span>
                {trend ? (
                    <span className="mt-1 flex items-center gap-1 text-[11px] text-slate-700">
                        {down ? <ArrowDownOutlined className="text-red-600" /> : <ArrowUpOutlined className="text-emerald-700" />}
                        <b className={down ? 'font-medium text-red-600' : 'font-medium text-emerald-700'}>{trend.value}</b> {trend.label}
                    </span>
                ) : null}
            </span>
        </div>
    );
}

function Card({ title, icon, expanded, onViewAll, children, footer }) {
    return (
        <section className={cn('rounded-lg bg-white', SHADOW)}>
            <header className="flex items-center justify-between px-5 py-4">
                <h2 className="m-0 flex items-center gap-2 text-[18px] font-semibold text-slate-900">
                    {icon}
                    {title}
                </h2>
                {onViewAll ? (
                    <button type="button" onClick={onViewAll} className="text-[14px] font-semibold text-[#1668e3] hover:underline">
                        {expanded ? 'Show Less' : 'View All'}
                    </button>
                ) : null}
            </header>
            <div className="overflow-x-auto">{children}</div>
            {footer ? <div className="border-t border-slate-200">{footer}</div> : null}
        </section>
    );
}

function Table({ heads, rows, empty, minWidth = 900, render }) {
    return (
        <table className="w-full border-collapse text-left" style={{ minWidth }}>
            <thead>
                <tr className="bg-[#f7f9fc]">
                    {heads.map((h) => (
                        <th key={h} className="px-5 py-3 text-[14px] font-semibold whitespace-nowrap text-slate-900">
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.length ? (
                    rows.map(render)
                ) : (
                    <tr>
                        <td colSpan={heads.length} className="border-t border-slate-200 px-5 py-10 text-center text-[13px] text-slate-500">
                            {empty}
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}

const Td = ({ className = '', children }) => <td className={cn('px-5 py-2.5 text-[14px] text-slate-800', className)}>{children}</td>;

const IconBtn = ({ label, onClick, children }) => (
    <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-slate-50 text-[16px] text-slate-700 hover:border-[#1668e3] hover:text-[#1668e3]"
    >
        {children}
    </button>
);

const DECISION_TEXT = {
    approve: { title: 'Authorize', ok: 'Authorize', remarkLabel: 'Remark (optional)' },
    reject: { title: 'Send back to handler', ok: 'Send Back', remarkLabel: 'Reason (required)' },
    transfer: { title: 'Mark transfer initiated', ok: 'Confirm', remarkLabel: 'Remark (optional)' },
    paid: { title: 'Mark paid', ok: 'Confirm', remarkLabel: 'Remark (optional)' },
};

/** SCM / RCM & Approver Dashboards (Figma: SCM/RCM DASHBOARD SCREENS AS FOR SERVICE PROVIDER). */
export default function ApproverDashboardPage() {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const { can, selectClaim } = useAppState();
    const openClaim = useOpenClaim();
    const [params, setParams] = useSearchParams();
    const filtersOpen = params.get('quickFilters') === '1';
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [options, setOptions] = useState(null);
    const [pages, setPages] = useState({ fraud: 1, ila: 1, payment: 1 });
    const [expanded, setExpanded] = useState({ fraud: false, ila: false, payment: false });
    const [data, setData] = useState(null);
    const [pending, setPending] = useState(null); // { row, kind, decision }
    const [remark, setRemark] = useState('');
    const [busy, setBusy] = useState(false);
    const canDecide = can('Approval', 'approve');

    useEffect(() => {
        api.get('/dashboard')
            .then((d) => setOptions(d.filterOptions))
            .catch(() => {});
    }, []);

    const load = useCallback(async () => {
        const q = new URLSearchParams({
            ...filterParams(filters),
            fraudPage: pages.fraud,
            ilaPage: pages.ila,
            paymentPage: pages.payment,
            fraudPageSize: expanded.fraud ? LONG : SHORT,
            ilaPageSize: expanded.ila ? LONG : SHORT,
            paymentPageSize: expanded.payment ? LONG : SHORT,
        });
        try {
            setData(await api.get(`/approver/dashboard?${q}`));
        } catch (err) {
            message.error(errText(err));
        }
    }, [filters, pages, expanded, message]);

    useEffect(() => {
        load();
    }, [load]);

    const setPage = (key) => (p) => setPages((s) => ({ ...s, [key]: p }));
    const toggle = (key) => () => {
        setExpanded((s) => ({ ...s, [key]: !s[key] }));
        setPages((s) => ({ ...s, [key]: 1 }));
    };
    const closeFilters = () => setParams({}, { replace: true });

    const openScreen = (row, path) => {
        selectClaim(row.claimId);
        navigate(path);
    };

    const ask = (row, kind, decision) => {
        setRemark('');
        setPending({ row, kind, decision });
    };

    const submit = async () => {
        const { row, kind, decision } = pending;
        if (decision === 'reject' && !remark.trim()) return message.warning('Give a reason for sending it back.');
        setBusy(true);
        try {
            await api.post(`/approver/claims/${encodeURIComponent(row.claimId)}/decision`, { kind, decision, remark: remark.trim() });
            message.success(`${row.claimNo}: done`);
            setPending(null);
            await load();
        } catch (err) {
            message.error(errText(err));
        } finally {
            setBusy(false);
        }
        return undefined;
    };

    const k = data?.kpis;
    const fraudTip = data?.fraud.available === false ? 'Admin portal is not reachable: fraud triggers could not be loaded' : 'Claims with an open fraud trigger';
    const tiles = [
        { title: 'Fraud Triggered', value: k ? k.fraudTriggered.value : '—', note: 'Flagged Claims', trend: k?.fraudTriggered.trend, color: '#e0353f', text: 'text-[#e0353f]', icon: <StopOutlined />, tip: fraudTip },
        { title: 'High Value Claims', value: k ? inCrore(k.highValue.value) : '—', note: k ? `Total Claim Count: ${k.highValue.count}` : 'Total Claim Count', trend: k?.highValue.trend, color: '#f0a500', text: 'text-[#f0a500]', icon: <span className="text-[26px] font-semibold">₹</span>, tip: data ? `Open claims of ₹${data.settings.highValueAmount.toLocaleString('en-IN')} or more` : '' },
        { title: 'SLA Risk', value: k ? k.slaRisk.value : '—', note: 'Claim Near Breach', trend: k?.slaRisk.trend, color: '#f97316', text: 'text-[#f97316]', icon: <FieldTimeOutlined />, tip: data ? `Open claims with ${data.settings.slaRiskHours} hours or less of the ${data.settings.slaHours}-hour SLA left` : '' },
        { title: 'ILA/FLA Queue', value: k ? k.ilaFlaQueue.value : '—', note: 'Pending Authorization', trend: k?.ilaFlaQueue.trend, color: '#2563eb', text: 'text-[#2563eb]', icon: <ClockCircleOutlined />, tip: 'Submitted ILA / FLA reports waiting for your authorization' },
        { title: 'Payment Queue', value: k ? k.paymentQueue.value : '—', note: 'Ready For Disbursement', trend: k?.paymentQueue.trend, color: '#3cb371', text: 'text-[#27a35f]', icon: <WalletOutlined />, tip: 'Approved payments not yet transferred' },
    ];

    const decisionMenu = (row, kind, items) => ({
        items,
        onClick: ({ key }) => ask(row, kind, key),
    });

    const regions = data?.sla.regions ?? [];
    const insurers = data?.sla.insurers ?? [];
    const slaRows = Array.from({ length: Math.max(regions.length, insurers.length) }, (_, i) => ({ region: regions[i], insurer: insurers[i], i }));

    return (
        <div className="flex flex-col gap-4">
            {data ? <p className="m-0 -mb-2 text-right text-[11.5px] text-slate-600">Showing: {data.scope}</p> : null}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {tiles.map((t) => (
                    <Tile key={t.title} {...t} />
                ))}
            </div>

            <Card
                title="Fraud Triggered Claims"
                icon={<WarningOutlined />}
                expanded={expanded.fraud}
                onViewAll={toggle('fraud')}
                footer={<Pager current={data?.fraud.page ?? 1} total={data?.fraud.totalPages ?? 1} onChange={setPage('fraud')} />}
            >
                <Table
                    heads={['Claim ID', 'Customer Name', 'Insurer', 'AI Score', 'Fraud Reason', 'Priority', 'Submitted']}
                    rows={data?.fraud.rows ?? []}
                    empty={!data ? 'Loading…' : data.fraud.available ? 'No fraud-triggered claims' : 'Admin portal not reachable: fraud triggers could not be loaded'}
                    render={(r) => (
                        <tr key={r.triggerId} onClick={() => openClaim({ id: r.claimId, stage: r.stage })} className="cursor-pointer border-t border-slate-200 hover:bg-slate-50">
                            <Td>{r.claimNo}</Td>
                            <Td>{r.customer || '—'}</Td>
                            <Td>{r.insurer || '—'}</Td>
                            <Td>{r.aiScore === null ? '—' : <Pill tone="bg-[#f3c4c4] text-[#c81414]">{r.aiScore}%</Pill>}</Td>
                            <Td>{r.reason}</Td>
                            <Td>
                                <Pill tone={PRIORITY_TONES[r.priority]} className="min-w-[96px]">
                                    {r.priority}
                                </Pill>
                            </Td>
                            <Td className="whitespace-nowrap">{ago(r.at)}</Td>
                        </tr>
                    )}
                />
            </Card>

            <Card title="SLA Risk Monitor" icon={<WarningOutlined />} footer={<Pager current={1} total={1} />}>
                <Table
                    heads={['Region', 'Pending Claims', 'Avg TAT', 'SLA Remaining', 'Insurer']}
                    rows={slaRows}
                    empty={data ? 'No open claims' : 'Loading…'}
                    render={({ region: g, insurer: ins, i }) => {
                        const left = g?.slaRemainingHours;
                        const used = g && g.pending ? Math.min(100, (g.avgTatHours / g.slaHours) * 100) : 0;
                        const bar = left === null || left === undefined ? '#cbd5e1' : left <= 2 ? '#b91c1c' : left <= 5 ? '#f97316' : '#16c60c';
                        return (
                            <tr key={i} className="border-t border-slate-200">
                                <Td>{g?.region ?? ''}</Td>
                                <Td>{g ? pad(g.pending) : ''}</Td>
                                <Td>{g ? `${g.avgTatHours} Hours` : ''}</Td>
                                <Td>
                                    {g ? (
                                        <span className="flex items-center gap-4">
                                            <span className="h-2.5 w-48 overflow-hidden rounded-full bg-slate-200">
                                                <span className="block h-full rounded-full" style={{ width: `${used}%`, background: bar }} />
                                            </span>
                                            <span className="whitespace-nowrap">{left === null ? '—' : `${left} Hrs`}</span>
                                        </span>
                                    ) : null}
                                </Td>
                                <Td>
                                    {ins ? (
                                        <span className="block leading-tight">
                                            <b className="block text-[16px] font-semibold text-slate-900">{ins.name}</b>
                                            <span className="text-[14px]">
                                                {inCrore(ins.amount)} ({pad(ins.pct)}%)
                                            </span>
                                        </span>
                                    ) : null}
                                </Td>
                            </tr>
                        );
                    }}
                />
            </Card>

            <Card
                title="ILA/FLA Authorization"
                expanded={expanded.ila}
                onViewAll={toggle('ila')}
                footer={<Pager current={data?.authorization.page ?? 1} total={data?.authorization.totalPages ?? 1} onChange={setPage('ila')} />}
            >
                <Table
                    heads={['Claim ID', 'Assigned To', 'Verification Type', 'Pending Since', 'Status', 'Action']}
                    rows={data?.authorization.rows ?? []}
                    empty={data ? 'Nothing waiting for authorization' : 'Loading…'}
                    render={(r) => (
                        <tr key={`${r.claimId}-${r.kind}`} className="border-t border-slate-200">
                            <Td>{r.claimNo}</Td>
                            <Td>{r.assignedTo || '—'}</Td>
                            <Td>
                                <Pill tone={r.type === 'ILA' ? 'bg-[#c5daff] text-[#1668e3]' : 'bg-[#d8c8f7] text-[#5b21b6]'}>{r.type}</Pill>
                            </Td>
                            <Td className="whitespace-nowrap">{ago(r.since)}</Td>
                            <Td>
                                <Pill tone="bg-[#c5daff] text-[#1668e3]">{r.status}</Pill>
                            </Td>
                            <Td>
                                <span className="flex gap-2">
                                    <IconBtn label={`Open ${r.type} of ${r.claimNo}`} onClick={() => openScreen(r, r.kind === 'fla' ? ROUTES.flaPending : ROUTES.handlerIla)}>
                                        <EyeOutlined />
                                    </IconBtn>
                                    {canDecide ? (
                                        <Dropdown trigger={['click']} menu={decisionMenu(r, r.kind, [{ key: 'approve', label: 'Authorize' }, { key: 'reject', label: 'Send Back' }])}>
                                            <span>
                                                <IconBtn label={`Decide ${r.type} of ${r.claimNo}`}>
                                                    <MoreOutlined />
                                                </IconBtn>
                                            </span>
                                        </Dropdown>
                                    ) : null}
                                </span>
                            </Td>
                        </tr>
                    )}
                />
            </Card>

            <Card
                title="Payment Queue"
                expanded={expanded.payment}
                onViewAll={toggle('payment')}
                footer={<Pager current={data?.payments.page ?? 1} total={data?.payments.totalPages ?? 1} onChange={setPage('payment')} />}
            >
                <Table
                    heads={['Claim ID', 'Beneficiary', 'Amount', 'Approval Time', 'Payment ETA', 'Status', 'Action']}
                    rows={data?.payments.rows ?? []}
                    empty={data ? 'No payments in the queue' : 'Loading…'}
                    render={(r) => {
                        const items = {
                            'Pending Approval': [{ key: 'approve', label: 'Approve Payment' }, { key: 'reject', label: 'Send Back' }],
                            Approved: [{ key: 'transfer', label: 'Mark Transfer Initiated' }],
                            'Transfer Initiated': [{ key: 'paid', label: 'Mark Paid' }],
                        }[r.rawStatus];
                        return (
                            <tr key={r.claimId} className="border-t border-slate-200">
                                <Td>{r.claimNo}</Td>
                                <Td>{r.beneficiary || '—'}</Td>
                                <Td>{r.amount.toLocaleString('en-IN')}</Td>
                                <Td className="whitespace-nowrap">{clock(r.approvedAt)}</Td>
                                <Td className="whitespace-nowrap">{etaText(r.eta)}</Td>
                                <Td>
                                    <Pill tone={PAY_TONES[r.status]} className="min-w-[180px]">
                                        {r.status}
                                    </Pill>
                                </Td>
                                <Td>
                                    <span className="flex gap-2">
                                        <IconBtn label={`Open payment of ${r.claimNo}`} onClick={() => openScreen(r, ROUTES.paymentRecommendation)}>
                                            <EyeOutlined />
                                        </IconBtn>
                                        {canDecide && items ? (
                                            <Dropdown trigger={['click']} menu={decisionMenu(r, 'payment', items)}>
                                                <span>
                                                    <IconBtn label={`Decide payment of ${r.claimNo}`}>
                                                        <MoreOutlined />
                                                    </IconBtn>
                                                </span>
                                            </Dropdown>
                                        ) : null}
                                    </span>
                                </Td>
                            </tr>
                        );
                    }}
                />
            </Card>

            <QuickFiltersModal
                open={filtersOpen}
                value={filters}
                options={options}
                onClose={closeFilters}
                onApply={(f) => {
                    setFilters(f);
                    setPages({ fraud: 1, ila: 1, payment: 1 });
                    closeFilters();
                }}
            />

            <Modal
                open={!!pending}
                title={pending ? `${DECISION_TEXT[pending.decision].title} · ${pending.row.claimNo}` : ''}
                okText={pending ? DECISION_TEXT[pending.decision].ok : 'OK'}
                okButtonProps={{ danger: pending?.decision === 'reject' }}
                confirmLoading={busy}
                onOk={submit}
                onCancel={() => setPending(null)}
                destroyOnHidden
            >
                {pending ? (
                    <label className="block">
                        <span className="mb-1.5 block text-[12.5px] font-semibold text-slate-800">{DECISION_TEXT[pending.decision].remarkLabel}</span>
                        <Input.TextArea rows={3} maxLength={500} value={remark} onChange={(e) => setRemark(e.target.value)} aria-label="Remark" />
                    </label>
                ) : null}
            </Modal>
        </div>
    );
}
