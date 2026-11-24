import { useCallback, useEffect, useRef, useState } from 'react';
import { App, Button, Spin, Switch } from 'antd';
import { LeftOutlined, RightOutlined, ScanOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import { CLAIM_DETAIL_SECTIONS, CLAIM_DETAIL_TABS } from '../../data/claimDetailsData.js';
import ClaimShell, { ViewOnlyNote, stepDone } from '../../components/claim/ClaimShell.jsx';
import DocumentViewer from '../../components/claim/DocumentViewer.jsx';
import DynamicField from '../../components/intimation/DynamicField.jsx';
import DmsDocumentsPanel from '../../components/intimation/DmsDocumentsPanel.jsx';
import useClaimDocuments from '../../hooks/useClaimDocuments.js';
import { api } from '../../api/client.js';
import { useAppState } from '../../context/AppContext.jsx';
import { MODULES } from '../../constants/navigation.js';
import ROUTES from '../../constants/routes.js';
import { errText, fmtDateTime } from '../../utils/format.js';

const MOMENT_FIELDS = new Set(
    Object.values(CLAIM_DETAIL_SECTIONS)
        .flatMap((s) => s.fields)
        .filter((f) => f.type === 'date' || f.type === 'time')
        .map((f) => f.name)
);
const toForm = (v = {}) => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, MOMENT_FIELDS.has(k) && x ? dayjs(x) : x]));
/** Documents the OCR reads (RC, policy, claim form, DL, FIR, permit, fitness, estimate). */
const OCR_TYPES = new Set(['rc', 'policy-copy', 'claim-form', 'dl', 'fir', 'permit', 'fitness', 'estimate', 'kyc', 'other']);
const isEmpty = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length);

const toApi = (v) => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dayjs.isDayjs(x) ? x.toISOString() : x]));

/**
 * Claim Details (Figma): 1. Claim Information, 2. Loss Details, 3. Vehicle Details
 * beside the document viewer and the DMS documents. Submit saves; Next (top)
 * completes the Claim Details step and opens AI ILA.
 */
export default function ClaimDetailsPage() {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const { claim, setClaim, can } = useAppState();
    const [tab, setTab] = useState('claim');
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
    // Claim Details completed (Next) = view only.
    const completed = stepDone(claim, 'claim-details');
    const canEdit = can(MODULES.details, 'edit') && claim?.status !== 'Draft' && !completed;

    // OCR: read the uploaded documents and fill the fields that are still empty.
    const [ocr, setOcr] = useState(null);
    const valuesRef = useRef(values);
    valuesRef.current = values;
    const runOcr = useCallback(
        async ({ quiet = false } = {}) => {
            if (!claim?.id || !canEdit) return;
            setBusy('ocr');
            try {
                const res = await api.post(`/claims/${claim.id}/details/ocr`);
                const found = toForm(res.values);
                const filled = Object.keys(found).filter((k) => isEmpty(valuesRef.current[k]));
                setValues((prev) => ({ ...prev, ...Object.fromEntries(filled.filter((k) => isEmpty(prev[k])).map((k) => [k, found[k]])) }));
                setOcr({ ...res, filled });
                const read = res.scanned.filter((s) => s.characters > 0).length;
                if (filled.length) message.success(`OCR filled ${filled.length} field${filled.length > 1 ? 's' : ''} from the documents -- check and Submit to save`);
                else if (!quiet) message.info(read ? 'OCR found nothing new: the fields it read are already filled' : 'Upload the RC / Policy / Claim Form / DL first (PDF or photo)');
            } catch (err) {
                if (!quiet) message.error(errText(err));
            } finally {
                setBusy(null);
            }
        },
        [claim?.id, canEdit, message]
    );

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
            } else message.success('Claim details saved');
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
            onNext={canEdit ? () => save(true) : () => navigate(ROUTES.aiIla)}
            nextLoading={busy === 'next'}
        >
            {completed ? <ViewOnlyNote step="Claim Details" /> : null}
            <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[330px_minmax(0,1fr)_260px]">
                <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                    <header className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="mb-0 text-[14px] font-bold text-slate-900">Claim Details</h3>
                        <span className="flex items-center gap-2 text-[11.5px] font-semibold text-slate-800">
                            Edit Mode
                            <Switch size="small" checked={editMode && canEdit} disabled={!canEdit} onChange={setEditMode} />
                        </span>
                    </header>

                    {canEdit ? (
                        <div className="mb-3 rounded-lg border border-dashed border-[#1450d8]/40 bg-[#f3f7ff] px-3 py-2">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] text-slate-600">Read the uploaded documents and fill the empty fields</span>
                                <Button size="small" type="primary" ghost icon={<ScanOutlined />} loading={busy === 'ocr'} onClick={() => runOcr()}>
                                    Auto-fill (OCR)
                                </Button>
                            </div>
                            {ocr ? (
                                <p className="mt-1 mb-0 text-[10.5px] text-slate-500">
                                    {ocr.filled.length ? `${ocr.filled.length} filled` : 'Nothing new'} · read{' '}
                                    {ocr.scanned.length ? ocr.scanned.map((s) => `${s.label}${s.fields ? ` (${s.fields})` : ''}`).join(', ') : 'no documents'}
                                </p>
                            ) : null}
                        </div>
                    ) : null}

                    <div className="mb-3 flex justify-center gap-3">
                        <Button icon={<LeftOutlined />} disabled={tabIndex === 0} onClick={() => step(-1)} className="!text-[#1450d8]">
                            Previous
                        </Button>
                        <Button type="primary" disabled={tabIndex === CLAIM_DETAIL_TABS.length - 1} onClick={() => step(1)}>
                            Next <RightOutlined />
                        </Button>
                    </div>

                    <div className="mb-3 flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1450d8] text-[9.5px] font-bold text-white">{section.step}</span>
                        <h4 className="mb-0 text-[12px] font-bold text-slate-900">{section.title}</h4>
                    </div>

                    {saved === null ? (
                        <Spin />
                    ) : (
                        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                            {section.fields.map((field) => (
                                <div key={field.name} className={field.full || field.type === 'heading' ? 'sm:col-span-2' : ''}>
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

                    <div className="mt-5 flex justify-center">
                        <Button type="primary" size="large" className="!px-10" loading={busy === 'save'} disabled={!canEdit} onClick={() => save(false)}>
                            Submit
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
                    onChange={(info) => {
                        docs.reload();
                        // A new RC / policy / claim form ... : fill the empty fields from it.
                        if (info?.type && OCR_TYPES.has(info.type)) runOcr({ quiet: true });
                    }}
                    onSelect={(_tile, latest) => {
                        const i = files.findIndex((f) => f.id === latest.id);
                        if (i >= 0) setDocIndex(i);
                        else docs.reload();
                    }}
                />
            </div>

        </ClaimShell>
    );
}
