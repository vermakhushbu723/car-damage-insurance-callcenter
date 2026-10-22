import { useState } from 'react';
import { App, Button, Drawer, Dropdown, Empty, Input, Modal, Spin } from 'antd';
import {
    AlertOutlined,
    AppstoreOutlined,
    AuditOutlined,
    CheckOutlined,
    ClockCircleOutlined,
    CopyOutlined,
    CreditCardOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    LinkOutlined,
    SafetyOutlined,
    SearchOutlined,
    ShopOutlined,
    ThunderboltOutlined,
    UserOutlined,
    WalletOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { CLAIM_ACTION_BUTTONS, CLAIM_STAGES, META_TONES } from '../../data/claimWorkflowData.js';
import { api } from '../../api/client.js';
import { useAppState } from '../../context/AppContext.jsx';
import ROUTES from '../../constants/routes.js';
import { errText, fmtDate, fmtDateTime, fmtShort, formatINR } from '../../utils/format.js';
import cn from '../../utils/cn.js';

const META_ICONS = {
    clock: ClockCircleOutlined,
    file: FileTextOutlined,
    shop: ShopOutlined,
    pin: EnvironmentOutlined,
    alert: AlertOutlined,
    rupee: DollarOutlined,
};

const STAGE_ICONS = {
    check: CheckOutlined,
    user: UserOutlined,
    search: SearchOutlined,
    file: FileTextOutlined,
    sparkle: ThunderboltOutlined,
    shield: SafetyOutlined,
    wallet: WalletOutlined,
    card: CreditCardOutlined,
};

const ACTION_ICONS = {
    link: LinkOutlined,
    grid: AppstoreOutlined,
    file: FileTextOutlined,
    audit: AuditOutlined,
};

/** Screen of each journey step (Next goes to the claim's next open step). */
export const STAGE_ROUTES = {
    intimation: ROUTES.intimation,
    'handler-allocation': ROUTES.handlerAllocation,
    'surveyor-assignment': ROUTES.surveyorAssignment,
    'claim-details': ROUTES.claimDetails,
    'ai-ila': ROUTES.aiIla,
    fla: ROUTES.handlerIla,
    'payment-recommendation': ROUTES.paymentRecommendation,
    'survey-paybill': ROUTES.surveyPaybill,
};

const STAGE_ORDER = CLAIM_STAGES.map((s) => s.key);

/** Header fields of the active claim. */
function identityOf(claim) {
    return [
        { key: 'assistClaimId', label: 'Assist Claim ID', value: claim.id, muted: true, copy: true },
        { key: 'claimNo', label: 'Claim No', value: claim.claimNo, muted: true },
        { key: 'insuredName', label: 'Insured Name', value: claim.insuredName || '—' },
        { key: 'policyNo', label: 'Policy No', value: claim.policyNo || '—' },
        { key: 'productType', label: 'Product Type', value: claim.productType || '—' },
        { key: 'claimType', label: 'Claim Type', value: claim.claimType || '—' },
        { key: 'natureOfLoss', label: 'Nature Of Loss', value: claim.natureOfLoss || '—' },
    ];
}

function metaOf(claim) {
    const risk = claim.tat.breached || claim.tat.slaRisk;
    const fraud = claim.fraud ?? {};
    return [
        {
            key: 'tat',
            label: 'TAT',
            value: claim.status === 'Draft' ? 'Not Started' : claim.tat.text,
            note: claim.status === 'Closed' ? 'Closed' : claim.tat.breached ? 'SLA Breached' : claim.tat.slaRisk ? 'SLA Risk' : 'Within SLA',
            icon: 'clock',
            tone: risk ? 'red' : 'green',
            valueTone: risk ? 'text-red-500' : undefined,
        },
        {
            key: 'stage',
            label: 'Current Stage',
            value: claim.stageLabel,
            note: claim.status === 'Open' ? 'In Progress' : claim.status,
            icon: 'file',
            tone: 'blue',
            valueTone: 'text-[#1450d8]',
        },
        { key: 'workshop', label: 'Workshop', value: claim.workshop || '—', icon: 'shop', tone: 'orange' },
        {
            key: 'loss-location',
            label: 'Loss Location',
            value: claim.lossLocation?.city || '—',
            note: claim.lossLocation?.pincode ? `Pin: ${claim.lossLocation.pincode}` : undefined,
            icon: 'pin',
            tone: 'violet',
        },
        {
            key: 'fraud',
            label: 'Fraud Trigger',
            value: fraud.available ? `${fraud.count} Trigger${fraud.count === 1 ? '' : 's'}` : '—',
            note: fraud.available ? `Risk: ${fraud.risk}` : claim.status === 'Draft' ? 'After Submit' : 'Admin Not Reachable',
            icon: 'alert',
            tone: fraud.count ? 'red' : 'green',
            valueTone: fraud.count ? 'text-red-500' : undefined,
        },
        {
            key: 'amount',
            label: 'Claim Amount',
            value: claim.amount ? formatINR(claim.amount) : '—',
            note: claim.amount ? `As On ${fmtDate(claim.updatedAt)}` : 'Not Assessed Yet',
            icon: 'rupee',
            tone: 'green',
        },
    ];
}

function ClaimIdentityRow({ claim }) {
    const { message } = App.useApp();

    return (
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 xl:grid-cols-7">
            {identityOf(claim).map((field) => (
                <div key={field.key}>
                    <span className="mb-1 block text-[11.5px] font-bold text-[#1450d8]">{field.label}</span>
                    <span className="flex items-center gap-2">
                        <span className={cn('text-[13.5px] font-bold break-all', field.muted ? 'text-slate-400' : 'text-slate-900')}>
                            {field.value}
                        </span>
                        {field.copy ? (
                            <CopyOutlined
                                onClick={() => {
                                    navigator.clipboard?.writeText(field.value);
                                    message.success('Copied');
                                }}
                                className="cursor-pointer text-[11.5px] text-slate-400 hover:text-[#1450d8]"
                            />
                        ) : null}
                    </span>
                </div>
            ))}
        </div>
    );
}

function ClaimMetaBar({ claim }) {
    return (
        <section className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 sm:grid-cols-2 xl:grid-cols-6">
            {metaOf(claim).map((item) => {
                const Icon = META_ICONS[item.icon] || FileTextOutlined;
                return (
                    <div key={item.key} className="flex items-start gap-3">
                        <span
                            className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12.5px]',
                                META_TONES[item.tone]
                            )}
                        >
                            <Icon />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-[11.5px] font-bold text-[#1450d8]">{item.label}</span>
                            <span className={cn('block text-[13.5px] leading-6 font-bold', item.valueTone || 'text-slate-900')}>
                                {item.value}
                            </span>
                            {item.note ? <span className="block text-[10.5px] text-slate-500">{item.note}</span> : null}
                        </span>
                    </div>
                );
            })}
        </section>
    );
}

function ClaimStageTracker({ claim }) {
    const done = Object.fromEntries((claim?.stages ?? []).map((s) => [s.key, s]));

    return (
        <section className="grid grid-cols-2 gap-x-3 gap-y-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:grid-cols-4 xl:grid-cols-8">
            {CLAIM_STAGES.map((item) => {
                const state = done[item.key];
                const isDone = !!state?.done;
                const Icon = isDone ? CheckOutlined : STAGE_ICONS[item.icon] || FileTextOutlined;

                return (
                    <div key={item.key} className="flex min-w-0 items-center gap-2">
                        <span
                            className={cn(
                                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10.5px]',
                                isDone
                                    ? 'bg-emerald-100 text-emerald-600'
                                    : claim?.stage === item.key
                                      ? 'bg-blue-100 text-[#1450d8]'
                                      : 'bg-slate-100 text-slate-400'
                            )}
                        >
                            <Icon />
                        </span>
                        <span className="min-w-0">
                            <span className={cn('block truncate text-[10.5px] font-semibold', isDone ? 'text-slate-800' : 'text-slate-400')}>
                                {item.label}
                            </span>
                            {isDone ? <span className="block text-[10px] text-slate-500">{fmtShort(state.at)}</span> : null}
                        </span>
                    </div>
                );
            })}
        </section>
    );
}

function RemarksModal({ claim, open, onClose }) {
    const { message } = App.useApp();
    const [rows, setRows] = useState(null);
    const [text, setText] = useState('');
    const [saving, setSaving] = useState(false);

    const load = () =>
        api
            .get(`/claims/${claim.id}/remarks`)
            .then(setRows)
            .catch((err) => message.error(errText(err)));

    const add = async () => {
        setSaving(true);
        try {
            setRows(await api.post(`/claims/${claim.id}/remarks`, { text }));
            setText('');
            message.success('Remark added');
        } catch (err) {
            message.error(errText(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal title={`Remarks · ${claim.claimNo}`} open={open} onCancel={onClose} footer={null} afterOpenChange={(o) => o && load()} destroyOnHidden>
            <Input.TextArea rows={3} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a remark" />
            <div className="mt-2 mb-4 flex justify-end">
                <Button type="primary" loading={saving} disabled={!text.trim()} onClick={add}>
                    Add Remark
                </Button>
            </div>
            {rows === null ? (
                <Spin />
            ) : rows.length ? (
                <div className="flex max-h-[320px] flex-col gap-2 overflow-y-auto">
                    {rows.map((r) => (
                        <div key={r.id} className="rounded-lg bg-slate-50 px-3 py-2">
                            <p className="mb-1 text-[11.5px] whitespace-pre-line text-slate-800">{r.text}</p>
                            <p className="mb-0 text-[10.5px] text-slate-500">
                                {r.by} · {fmtDateTime(r.at)}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <Empty description="No remarks yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
        </Modal>
    );
}

function AuditDrawer({ claim, open, onClose }) {
    const { message } = App.useApp();
    const [rows, setRows] = useState(null);

    return (
        <Drawer
            title={`Claim Audit Trail · ${claim.claimNo}`}
            open={open}
            onClose={onClose}
            size={420}
            afterOpenChange={(o) =>
                o &&
                api
                    .get(`/claims/${claim.id}/audit`)
                    .then(setRows)
                    .catch((err) => message.error(errText(err)))
            }
        >
            {rows === null ? (
                <Spin />
            ) : (
                <ol className="m-0 flex list-none flex-col gap-3 p-0">
                    {rows.map((r) => (
                        <li key={r.id} className="flex gap-3">
                            <span
                                className={cn(
                                    'mt-1 h-2.5 w-2.5 shrink-0 rounded-full',
                                    r.kind === 'stage' ? 'bg-emerald-500' : 'bg-[#1450d8]'
                                )}
                            />
                            <span>
                                <span className="block text-[12px] font-semibold text-slate-900">{r.action}</span>
                                {r.detail ? <span className="block text-[11px] text-slate-600">{r.detail}</span> : null}
                                <span className="block text-[10.5px] text-slate-400">
                                    {r.by} · {fmtDateTime(r.at)}
                                </span>
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </Drawer>
    );
}

function ClaimActionBar({ claim }) {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const [panel, setPanel] = useState(null);

    const links = [
        claim?.link?.url ? { key: 'survey-link', label: 'Copy Survey Link' } : null,
        { key: ROUTES.documentsDms, label: 'Documents DMS' },
        { key: ROUTES.issueLetter, label: 'Issue Letter' },
        { key: ROUTES.claimDetails, label: 'Claim Details' },
        { key: ROUTES.communication, label: 'Claim Communication' },
    ].filter(Boolean);

    const onLink = ({ key }) => {
        if (key === 'survey-link') {
            navigator.clipboard?.writeText(claim.link.url);
            message.success('Survey link copied');
        } else navigate(key);
    };

    const handle = (action) => {
        if (action.key === 'communication-history') navigate(ROUTES.communicationHistory);
        else if (!claim) message.info('Open a claim first');
        else setPanel(action.key);
    };

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {CLAIM_ACTION_BUTTONS.map((action) => {
                const Icon = ACTION_ICONS[action.icon] || LinkOutlined;
                const button = (
                    <button
                        key={action.key}
                        type="button"
                        onClick={action.key === 'common-links' ? undefined : () => handle(action)}
                        className={cn(
                            'flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[12px] font-semibold text-white transition',
                            action.className
                        )}
                    >
                        {action.label} <Icon />
                    </button>
                );
                return action.key === 'common-links' ? (
                    <Dropdown key={action.key} trigger={['click']} menu={{ items: links, onClick: onLink }} disabled={!claim}>
                        {button}
                    </Dropdown>
                ) : (
                    button
                );
            })}
            {claim ? (
                <>
                    <RemarksModal claim={claim} open={panel === 'remarks'} onClose={() => setPanel(null)} />
                    <AuditDrawer claim={claim} open={panel === 'audit-trail'} onClose={() => setPanel(null)} />
                </>
            ) : null}
        </div>
    );
}

/** Shown on a claim screen while no claim is open. */
export function NoClaim({ text = 'Open a claim from the Dashboard (click its Claim ID) to work on it here.' }) {
    const navigate = useNavigate();
    return (
        <section className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
            <Empty description={text} />
            <Button type="primary" className="!mt-3" onClick={() => navigate(ROUTES.dashboard)}>
                Go To Dashboard
            </Button>
        </section>
    );
}

/**
 * Common frame for every claim-processing screen:
 * title + claim identity + meta bar + stage tracker + action bar, all from
 * the active claim. `onNext` replaces the default "go to the next open step".
 */
export default function ClaimShell({
    title,
    subtitle,
    stage,
    showIdentity = true,
    showMeta = true,
    requireClaim = true,
    useActiveClaim = true,
    onNext,
    nextLoading = false,
    children,
}) {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const active = useAppState();
    const claim = useActiveClaim ? active.claim : null;
    const claimLoading = useActiveClaim && active.claimLoading;

    const goNext = () => {
        if (!claim) return message.info('Open a claim first');
        const target = STAGE_ROUTES[STAGE_ORDER[STAGE_ORDER.indexOf(stage) + 1]];
        if (target) navigate(target);
        else message.success('This claim has finished its journey');
        return undefined;
    };

    return (
        <div className="flex flex-col gap-4">
            <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="mb-0.5 text-[20px] leading-7 font-bold text-[#1450d8]">{title}</h1>
                    {subtitle ? <p className="mb-0 text-[13.5px] font-bold text-slate-900">{subtitle}</p> : null}
                </div>
                <div className="flex shrink-0 gap-3">
                    <Button onClick={() => navigate(claim ? ROUTES.claimDetails : ROUTES.dashboard)}>Back To Claim</Button>
                    <Button type="primary" className="!px-8" loading={nextLoading} onClick={onNext || goNext}>
                        Next
                    </Button>
                </div>
            </header>

            {claim && showIdentity ? <ClaimIdentityRow claim={claim} /> : null}
            {claim && showMeta ? <ClaimMetaBar claim={claim} /> : null}
            <ClaimStageTracker claim={claim} />
            <ClaimActionBar claim={claim} />

            {requireClaim && !claim ? claimLoading ? <Spin className="!py-10" /> : <NoClaim /> : children}
        </div>
    );
}
