import { useEffect, useState } from 'react';
import { App, Button, Spin, Switch } from 'antd';
import { AppstoreOutlined, CarOutlined, CloseOutlined, FileTextOutlined, LeftOutlined, RightOutlined, SaveOutlined, ThunderboltOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import { CLAIM_DETAIL_SECTIONS, CLAIM_DETAIL_TABS } from '../../data/claimDetailsData.js';
import ClaimShell from '../../components/claim/ClaimShell.jsx';
import ClaimInfoSection from '../../components/claim/ClaimInfoSection.jsx';
import { formatINR } from '../../utils/format.js';
import DocumentViewer from '../../components/claim/DocumentViewer.jsx';
import DynamicField from '../../components/intimation/DynamicField.jsx';
import DmsDocumentsPanel from '../../components/intimation/DmsDocumentsPanel.jsx';
import useClaimDocuments from '../../hooks/useClaimDocuments.js';
import { api } from '../../api/client.js';
import { useAppState } from '../../context/AppContext.jsx';
import { MODULES } from '../../constants/navigation.js';
import ROUTES from '../../constants/routes.js';
import { errText, fmtDateTime } from '../../utils/format.js';
import cn from '../../utils/cn.js';

const MOMENT_FIELDS = new Set(
    Object.values(CLAIM_DETAIL_SECTIONS)
        .flatMap((s) => s.fields)
        .filter((f) => f.type === 'date' || f.type === 'time')
        .map((f) => f.name)
);
const toForm = (v = {}) => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, MOMENT_FIELDS.has(k) && x ? dayjs(x) : x]));
const toApi = (v) => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dayjs.isDayjs(x) ? x.toISOString() : x]));

const TAB_ICONS = { car: CarOutlined, user: UserOutlined, file: FileTextOutlined, grid: AppstoreOutlined, sparkle: ThunderboltOutlined };

/** AI Assessment tab: the AI ILA findings of this claim (read-only; edited on the AI ILA screen). */
function AiAssessmentTab({ claimId, onOpen }) {
    const [data, setData] = useState(undefined);
    useEffect(() => {
        if (!claimId) return;
        api.get(`/claims/${claimId}/ai-ila`)
            .then(setData)
            .catch(() => setData(null));
    }, [claimId]);
    if (data === undefined) return <Spin />;
    if (data === null) return <p className="mb-0 text-[11px] text-slate-500">Your role cannot view the AI assessment.</p>;
    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap justify-between gap-2 rounded-lg bg-[#f3f5f9] px-3 py-2 text-[11px]">
                <span>
                    AI: <b>{data.ai.status === 'done' ? 'Assessed' : data.ai.configured ? 'Not run yet' : 'Not connected'}</b>
                    {data.review.decision ? ` · ${data.review.decision}` : ''}
                </span>
                <span>
                    Estimate <b>₹{formatINR(data.summary.total)}</b>
                </span>
            </div>
            {data.rows.length ? (
                data.rows.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 text-[11px]">
                        <span>
                            <span className="font-semibold text-slate-900">{r.part}</span>
                            <span className="block text-[10px] text-slate-500">
                                {r.damageType} · {r.severity} · {r.action} · {r.status}
                            </span>
                        </span>
                        <span className="font-semibold text-slate-800">₹{formatINR(r.cost)}</span>
                    </div>
                ))
            ) : (
                <p className="mb-0 text-[11px] text-slate-500">No damages assessed yet.</p>
            )}
            <Button size="small" onClick={onOpen} className="!mt-1 w-fit !text-[#1450d8]">
                Open AI ILA
            </Button>
        </div>
    );
}

export default function ClaimDetailsPage() {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const { claim, setClaim, can } = useAppState();
    const [tab, setTab] = useState('vehicle');
    const [editMode, setEditMode] = useState(true);
    const [values, setValues] = useState({});
    const [saved, setSaved] = useState(null);
    const [busy, setBusy] = useState(null);
    const [docIndex, setDocIndex] = useState(0);
    const docs = useClaimDocuments(claim?.id);

    useEffect(() => {
        if (!claim?.id) return;
        api.get(`/claims/${claim.id}/details`)
            .then((d) => {
                setValues(toForm(d.values));
                setSaved(d);
            })
            .catch((err) => message.error(errText(err)));
    }, [claim?.id, message]);

    const section = CLAIM_DETAIL_SECTIONS[tab];
    const tabIndex = CLAIM_DETAIL_TABS.findIndex((item) => item.key === tab);
    const step = (delta) => {
        const next = CLAIM_DETAIL_TABS[tabIndex + delta];
        if (next) setTab(next.key);
    };
    const handleChange = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));
    const canEdit = can(MODULES.details, 'edit') && claim?.status !== 'Draft';

    const save = async (complete) => {
        setBusy(complete ? 'next' : 'save');
        try {
            const res = await api.put(`/claims/${claim.id}/details`, { values: toApi(values), complete });
            setSaved(res);
            setValues(toForm(res.values));
            setClaim(res.claim);
            if (complete) {
                message.success('Claim details completed');
                navigate(ROUTES.aiIla);
            } else message.success('Draft saved');
        } catch (err) {
            message.error(errText(err));
        } finally {
            setBusy(null);
        }
    };

    const files = docs.state?.files ?? [];
    const docsByType = Object.fromEntries((docs.state?.types ?? []).filter((t) => t.latest).map((t) => [t.type, t.latest]));

    return (
        <ClaimShell
            title="Claim Details"
            subtitle="Access Complete Claim Information And Activity"
            stage="claim-details"
            onNext={canEdit ? () => save(true) : undefined}
            nextLoading={busy === 'next'}
        >
            <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[330px_minmax(0,1fr)_260px]">
                <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                    <header className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="mb-0 text-[14px] font-bold text-slate-900">Claim Details</h3>
                        <span className="flex items-center gap-2 text-[11.5px] font-semibold text-slate-800">
                            Edit Mode
                            <Switch size="small" checked={editMode && canEdit} disabled={!canEdit} onChange={setEditMode} />
                        </span>
                    </header>

                    <div className="mb-3 flex justify-center gap-3">
                        <Button icon={<LeftOutlined />} disabled={tabIndex === 0} onClick={() => step(-1)} className="!text-[#1450d8]">
                            Previous
                        </Button>
                        <Button type="primary" disabled={tabIndex === CLAIM_DETAIL_TABS.length - 1} onClick={() => step(1)}>
                            Next <RightOutlined />
                        </Button>
                    </div>

                    <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200 pb-1">
                        {CLAIM_DETAIL_TABS.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => setTab(item.key)}
                                className={cn(
                                    'flex shrink-0 items-center gap-1.5 px-2 pb-1.5 text-[10px] font-medium transition',
                                    item.key === tab ? 'border-b-2 border-[#1450d8] text-[#1450d8]' : 'text-slate-500 hover:text-slate-800'
                                )}
                            >
                                {(() => {
                                    const Icon = TAB_ICONS[item.icon] ?? CarOutlined;
                                    return <Icon className="text-[10.5px]" />;
                                })()}
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="mb-3 flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1450d8] text-[9.5px] font-bold text-white">{section.step}</span>
                        <h4 className="mb-0 text-[12px] font-bold text-slate-900">{section.title}</h4>
                    </div>

                    {tab === 'ai' ? (
                        <AiAssessmentTab claimId={claim?.id} onOpen={() => navigate(ROUTES.aiIla)} />
                    ) : saved === null ? (
                        <Spin />
                    ) : (
                        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                            {section.fields.map((field) => (
                                <div key={field.name} className={field.full ? 'sm:col-span-2' : ''}>
                                    <DynamicField
                                        field={{ ...field, disabled: !editMode || !canEdit }}
                                        value={values[field.name]}
                                        onChange={handleChange}
                                        documents={docsByType}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <Button type="primary" icon={<SaveOutlined />} loading={busy === 'save'} disabled={!canEdit} onClick={() => save(false)}>
                            Save Drift
                        </Button>
                        <Button icon={<CloseOutlined />} disabled={!canEdit} onClick={() => setValues({})} className="!text-[#1450d8]">
                            Clear
                        </Button>
                    </div>
                    <p className="mt-2 mb-0 text-[10.5px] text-slate-500">
                        {saved?.savedAt ? `Saved ${fmtDateTime(saved.savedAt)} by ${saved.savedBy}` : 'Prefilled from the intimation -- not saved yet'}
                    </p>
                </section>

                <DocumentViewer files={files} index={Math.min(docIndex, Math.max(0, files.length - 1))} onIndex={setDocIndex} />

                <DmsDocumentsPanel
                    claimId={claim?.id}
                    activeType={files[docIndex]?.type}
                    onChange={() => docs.reload()}
                    onSelect={(_tile, latest) => {
                        const i = files.findIndex((f) => f.id === latest.id);
                        if (i >= 0) setDocIndex(i);
                        else docs.reload();
                    }}
                />
            </div>

            <ClaimInfoSection claimId={claim?.id} canEdit={canEdit} files={files} />
        </ClaimShell>
    );
}
