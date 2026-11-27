import { useEffect, useState } from 'react';
import { App, Button, Empty, Segmented, Select, Tooltip, Upload } from 'antd';
import {
    ArrowLeftOutlined,
    BookOutlined,
    CheckCircleFilled,
    ClockCircleOutlined,
    CloudUploadOutlined,
    DownloadOutlined,
    ExperimentOutlined,
    EyeOutlined,
    FilePdfOutlined,
    FileTextOutlined,
    InfoCircleOutlined,
    LinkOutlined,
    RobotOutlined,
    LoadingOutlined,
    PlayCircleOutlined,
    SendOutlined,
    SyncOutlined,
    UploadOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { DMS_TABS, DOCUMENT_TYPES } from '../../data/documentsData.js';
import { getIcon } from '../../components/common/iconRegistry.jsx';
import { NoClaim } from '../../components/claim/ClaimShell.jsx';
import ClaimPicker from '../../components/claim/ClaimPicker.jsx';
import useClaimDocuments, { pickFiles } from '../../hooks/useClaimDocuments.js';
import { api, download, fileUrl } from '../../api/client.js';
import { useAppState } from '../../context/AppContext.jsx';
import { MODULES } from '../../constants/navigation.js';
import ROUTES from '../../constants/routes.js';
import { errText, fileSize, fmtDateTime } from '../../utils/format.js';
import cn from '../../utils/cn.js';

const { Dragger } = Upload;

const TAB_ICONS = { file: FileTextOutlined, book: BookOutlined, experiment: ExperimentOutlined, info: InfoCircleOutlined };
/** Files uploaded by the customer on the survey link carry this uploader id. */
const CUSTOMER_ID = 'survey-link';
const MULTI = ['vehicle-photos', 'other', 'surveyor-report', 'kyc', 'survey-video'];
const isImage = (f) => f.mime?.startsWith('image/');
const isVideo = (f) => f.mime?.startsWith('video/');
const isCustomer = (f) => f.uploadedById === CUSTOMER_ID;
const isAi = (f) => f.uploadedById === 'gemini-ai';
const SEVERITY_TONE = { Severe: 'bg-red-100 text-red-700', Moderate: 'bg-orange-100 text-orange-700', Minor: 'bg-yellow-100 text-yellow-800' };
const RECOMMENDATION = { approved: 'Approved', rejected: 'Rejected', pending: 'Pending' };

/** Small label: who uploaded the file. */
function UploaderTag({ file }) {
    if (isAi(file)) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                <RobotOutlined /> AI (Gemini)
            </span>
        );
    }
    return isCustomer(file) ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
            <LinkOutlined /> Customer (Survey Link)
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            <UserOutlined /> {file.uploadedBy || 'Staff'}
        </span>
    );
}

/** Thumbnail of a file: the photo itself, or an icon for PDF / video. */
function Thumb({ file, className = 'h-[92px]' }) {
    if (isImage(file)) return <img src={fileUrl(file.url)} alt={file.name} loading="lazy" className={cn('w-full rounded-md bg-slate-100 object-cover', className)} />;
    const Icon = isVideo(file) ? PlayCircleOutlined : file.mime === 'application/pdf' ? FilePdfOutlined : FileTextOutlined;
    return (
        <span className={cn('flex w-full items-center justify-center rounded-md text-[30px]', isVideo(file) ? 'bg-slate-800 text-white' : 'bg-red-50 text-red-500', className)}>
            <Icon />
        </span>
    );
}

/** One uploaded file in the gallery. */
function FileCard({ file }) {
    return (
        <div className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
            <a href={fileUrl(file.url)} target="_blank" rel="noreferrer" className="block p-1.5">
                <Thumb file={file} />
            </a>
            <div className="flex flex-1 flex-col gap-1 px-2.5 pb-2.5">
                <p className="mb-0 truncate text-[11.5px] font-semibold text-slate-900" title={file.name}>{file.name}</p>
                <p className="mb-0 text-[10px] text-slate-500">{fileSize(file.size)} · {fmtDateTime(file.uploadedAt)}</p>
                <div className="mt-auto flex items-center justify-between gap-1 pt-1">
                    <UploaderTag file={file} />
                    <span className="flex gap-2 text-[13px]">
                        <Tooltip title="Open"><a href={fileUrl(file.url)} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-[#1450d8]"><EyeOutlined /></a></Tooltip>
                        <Tooltip title="Download"><a href={`${fileUrl(file.url)}&download=1`} className="text-slate-500 hover:text-[#1450d8]"><DownloadOutlined /></a></Tooltip>
                    </span>
                </div>
            </div>
        </div>
    );
}

/** Link sent -> opened -> submitted, with dates. */
function SurveyTimeline({ survey }) {
    const steps = [
        { key: 'sent', label: 'Link Sent', at: survey.sentAt, icon: SendOutlined },
        { key: 'opened', label: `Opened${survey.accessCount > 1 ? ` (${survey.accessCount} times)` : ''}`, at: survey.accessedAt, icon: EyeOutlined },
        { key: 'submitted', label: 'Survey Submitted', at: survey.submittedAt, icon: CheckCircleFilled },
    ];
    return (
        <ol className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-3">
            {steps.map((s, i) => {
                const Icon = s.icon;
                const done = !!s.at;
                return (
                    <li key={s.key} className={cn('flex items-center gap-3 rounded-lg border px-3 py-2.5', done ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white')}>
                        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[14px]', done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400')}>
                            {done ? <Icon /> : i + 1}
                        </span>
                        <span className="min-w-0">
                            <span className={cn('block text-[12px] font-bold', done ? 'text-emerald-700' : 'text-slate-500')}>{s.label}</span>
                            <span className="block text-[10.5px] text-slate-500">{done ? fmtDateTime(s.at) : 'Not yet'}</span>
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}

/** Label / value grid of what the customer filled. */
function DetailGrid({ rows }) {
    if (!rows?.length) return <p className="mb-0 text-[11.5px] text-slate-500">Nothing filled.</p>;
    return (
        <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((r) => (
                <div key={r.key} className="rounded-md bg-slate-50 px-3 py-2">
                    <dt className="text-[10.5px] font-medium text-[#1668e3]">{r.label}</dt>
                    <dd className="m-0 break-words text-[12.5px] font-semibold text-slate-900">{r.value}</dd>
                </div>
            ))}
        </dl>
    );
}

/** Gemini damage highlighting of the customer's photos: status, parts found, highlighted copies. */
function AiPanel({ ai, files, canRun, running, onRun }) {
    const aiFiles = files.filter((f) => f.type === 'ai-damage');
    const byDoc = Object.fromEntries(aiFiles.map((f) => [f.id, f]));
    const status = ai?.status;
    const STATUS = {
        running: { text: `Gemini is checking the photos... ${ai?.done ?? 0} of ${ai?.photos ?? 0} done`, tone: 'border-blue-200 bg-blue-50 text-blue-800', icon: <LoadingOutlined /> },
        done: { text: `${ai?.damagesFound ?? 0} damaged area(s) found on ${ai?.photos ?? 0} photo(s)${ai?.failed ? ` · ${ai.failed} photo(s) could not be checked` : ''}`, tone: 'border-emerald-200 bg-emerald-50 text-emerald-800', icon: <CheckCircleFilled /> },
        failed: { text: `AI highlighting failed: ${ai?.error || 'unknown error'}`, tone: 'border-red-200 bg-red-50 text-red-700', icon: <InfoCircleOutlined /> },
        'not-configured': { text: 'AI highlighting is not switched on (GEMINI_API_KEY is not set on the server).', tone: 'border-slate-200 bg-slate-50 text-slate-600', icon: <InfoCircleOutlined /> },
    };
    const s = STATUS[status] ?? { text: 'Not run yet.', tone: 'border-slate-200 bg-slate-50 text-slate-600', icon: <ClockCircleOutlined /> };
    return (
        <section className="rounded-xl border border-violet-200 bg-white px-5 py-4">
            <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h3 className="mb-0 flex items-center gap-2 text-[13.5px] font-bold text-violet-700">
                        <RobotOutlined /> AI Damage Highlights (Gemini)
                    </h3>
                    <p className="mb-0 text-[11px] text-slate-500">The customer's photos are checked by Gemini; damaged parts are boxed on a copy of each photo.</p>
                </div>
                {canRun ? (
                    <Button size="small" icon={<SyncOutlined />} loading={running || status === 'running'} onClick={onRun}>
                        {status ? 'Run AI Again' : 'Run AI'}
                    </Button>
                ) : null}
            </header>
            <p className={cn('mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px]', s.tone)}>
                {s.icon} {s.text}
            </p>
            {ai?.results?.length ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {ai.results.map((r) => {
                        const f = byDoc[r.docId];
                        return (
                            <div key={r.sourceId} className="overflow-hidden rounded-lg border border-slate-200">
                                {f ? (
                                    <a href={fileUrl(f.url)} target="_blank" rel="noreferrer" className="block bg-slate-100">
                                        <img src={fileUrl(f.url)} alt={f.name} loading="lazy" className="h-[170px] w-full object-contain" />
                                    </a>
                                ) : null}
                                <div className="px-3 py-2">
                                    <p className="mb-1 truncate text-[11px] font-semibold text-slate-700" title={r.sourceName}>{r.sourceName}</p>
                                    {r.error ? (
                                        <p className="mb-0 text-[11px] text-red-600">Could not check: {r.error}</p>
                                    ) : r.damages?.length ? (
                                        <ul className="m-0 flex list-none flex-col gap-1 p-0">
                                            {r.damages.map((d, i) => (
                                                <li key={i} className="flex flex-wrap items-center gap-1.5 text-[11.5px] text-slate-800">
                                                    <b>{i + 1}. {d.part}</b> · {d.damage}
                                                    <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold', SEVERITY_TONE[d.severity])}>{d.severity}</span>
                                                    <span className="text-[10px] text-slate-500">{d.action}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mb-0 text-[11px] text-slate-500">No visible damage.</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : null}
        </section>
    );
}

/** "Survey" tab: everything the customer did on the survey link. */
function SurveyPanel({ survey, files, canRunAi, aiRunning, onRunAi }) {
    if (!survey) {
        return (
            <section className="rounded-xl border border-slate-200 bg-white px-6 py-14">
                <Empty description="No survey link has been generated for this claim yet. Send it from the Intimation screen." />
            </section>
        );
    }
    const fromCustomer = files.filter(isCustomer);
    const report = files.find((f) => f.id === survey.reportDocId);
    const yes = (v) => (v ? <span className="font-semibold text-emerald-600">Accepted</span> : <span className="font-semibold text-red-500">Not accepted</span>);
    return (
        <div className="flex flex-col gap-4">
            <section className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h2 className="mb-0 text-[14.5px] font-bold text-[#1450d8]">Customer Survey (Survey Link)</h2>
                        <p className="mb-0 text-[11.5px] text-slate-500">What the customer filled and uploaded on the link sent from Intimation.</p>
                    </div>
                    {report ? (
                        <Button icon={<FilePdfOutlined />} href={fileUrl(report.url)} target="_blank">
                            Open Survey Details PDF
                        </Button>
                    ) : null}
                </header>
                <SurveyTimeline survey={survey} />
            </section>

            {survey.submittedAt ? (
                <>
                    <section className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <h3 className="mb-3 text-[13px] font-bold text-slate-900">Owner &amp; Vehicle Details (filled by the customer)</h3>
                        <DetailGrid rows={survey.owner} />
                        {survey.inspection?.length ? (
                            <>
                                <h3 className="mt-4 mb-3 text-[13px] font-bold text-slate-900">Inspection Details</h3>
                                <DetailGrid rows={survey.inspection} />
                            </>
                        ) : null}
                    </section>
                    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                            <p className="mb-1 text-[11px] text-slate-500">Customer Declaration</p>
                            <p className="mb-0 text-[13px]">{yes(survey.declarations?.customer)}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                            <p className="mb-1 text-[11px] text-slate-500">Inspector Declaration</p>
                            <p className="mb-0 text-[13px]">{yes(survey.declarations?.inspector)}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                            <p className="mb-1 text-[11px] text-slate-500">Survey Recommendation</p>
                            <p className="mb-0 text-[13px] font-semibold text-slate-900">{RECOMMENDATION[survey.recommendation] ?? survey.recommendation ?? '-'}</p>
                        </div>
                    </section>
                </>
            ) : (
                <section className="rounded-xl border border-dashed border-orange-300 bg-orange-50 px-5 py-4 text-[12px] text-orange-800">
                    <ClockCircleOutlined /> The customer has not submitted the survey yet. Files they upload still appear below as they come in.
                </section>
            )}

            {survey.submittedAt ? <AiPanel ai={survey.ai} files={files} canRun={canRunAi} running={aiRunning} onRun={onRunAi} /> : null}

            <section className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                <h3 className="mb-3 text-[13px] font-bold text-slate-900">Files From The Customer ({fromCustomer.length})</h3>
                {fromCustomer.length ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
                        {fromCustomer.map((f) => <FileCard key={f.id} file={f} />)}
                    </div>
                ) : (
                    <p className="mb-0 text-[11.5px] text-slate-500">No files from the customer yet.</p>
                )}
            </section>
        </div>
    );
}

export default function DocumentsDmsPage() {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const { claim, can } = useAppState();
    const [tab, setTab] = useState('documents');
    const [dropType, setDropType] = useState('other');
    const [filter, setFilter] = useState('all');
    const [processing, setProcessing] = useState(false);
    const [busy, setBusy] = useState(null);
    const docs = useClaimDocuments(claim?.id);
    const aiStatus = docs.state?.survey?.ai?.status;
    const reloadDocs = docs.reload;

    // While Gemini is working, refresh every few seconds so the highlights appear by themselves.
    useEffect(() => {
        if (aiStatus !== 'running') return undefined;
        const t = setInterval(() => reloadDocs(), 4000);
        return () => clearInterval(t);
    }, [aiStatus, reloadDocs]);

    if (!claim) return <NoClaim />;

    const byType = Object.fromEntries((docs.state?.types ?? []).map((t) => [t.type, t]));
    const files = docs.state?.files ?? [];
    const survey = docs.state?.survey ?? null;
    const canUpload = can(MODULES.dms, 'create') || can(MODULES.intimation, 'create');
    const required = (docs.state?.types ?? []).filter((t) => t.required);
    const requiredDone = required.filter((t) => t.status === 'uploaded').length;
    const fromCustomer = files.filter(isCustomer).length;
    const shown = files.filter((f) => (filter === 'customer' ? isCustomer(f) : filter === 'staff' ? !isCustomer(f) : true));
    // Gallery grouped by document type (in the order of the checklist).
    const typeOrder = [...DOCUMENT_TYPES.map((d) => d.type), 'survey-video', 'ai-damage', 'fir', 'permit', 'fitness', 'aadhar'];
    const groups = [...new Set(shown.map((f) => f.type))]
        .sort((a, b) => (typeOrder.indexOf(a) + 1 || 99) - (typeOrder.indexOf(b) + 1 || 99))
        .map((type) => ({ type, label: shown.find((f) => f.type === type)?.typeLabel ?? type, files: shown.filter((f) => f.type === type) }));

    const runAi = async () => {
        setBusy('ai');
        try {
            await api.post(`/claims/${claim.id}/survey/ai`);
            message.success('Gemini is checking the photos again');
            await docs.reload();
        } catch (err) {
            message.error(errText(err));
        } finally {
            setBusy(null);
        }
    };

    const uploadType = async (type, multiple = false) => {
        const picked = await pickFiles({ multiple });
        for (const f of picked) await docs.upload(type, f);
    };

    const bundle = async (kind) => {
        setBusy(kind);
        try {
            await download(`/claims/${claim.id}/documents/download.${kind}`, `Documents-${claim.claimNo}.${kind}`);
            message.success(kind === 'zip' ? 'ZIP downloaded' : 'PDF downloaded');
        } catch (err) {
            message.error(errText(err));
        } finally {
            setBusy(null);
        }
    };

    const process = async () => {
        setProcessing(true);
        try {
            await api.post(`/claims/${claim.id}/documents/process`);
            message.success('Documents verified complete and processed');
        } catch (err) {
            message.warning(errText(err));
        } finally {
            setProcessing(false);
        }
    };

    const info = [
        { key: 'policyNumber', label: 'Policy Number', value: claim.policyNo },
        { key: 'insured', label: 'Insured', value: claim.insuredName },
        { key: 'vehicle', label: 'Vehicle', value: [claim.intimation?.make, claim.intimation?.model].filter(Boolean).join(' ') },
        { key: 'regNo', label: 'Reg No', value: claim.vehicleNo },
    ];
    const stats = [
        { key: 'req', label: 'Required Documents', value: `${requiredDone} / ${required.length}`, hint: requiredDone === required.length ? 'All received' : `${required.length - requiredDone} pending`, tone: requiredDone === required.length ? 'emerald' : 'orange' },
        { key: 'files', label: 'Total Files', value: files.length, hint: 'In this claim', tone: 'blue' },
        { key: 'cust', label: 'From Customer', value: fromCustomer, hint: 'Via survey link', tone: 'orange' },
        {
            key: 'survey',
            label: 'Customer Survey',
            value: survey?.submittedAt ? 'Submitted' : survey?.accessedAt ? 'Opened' : survey?.sentAt ? 'Link Sent' : 'Not Sent',
            hint: survey?.submittedAt ? fmtDateTime(survey.submittedAt) : 'See the Survey tab',
            tone: survey?.submittedAt ? 'emerald' : 'slate',
        },
    ];
    const TONE = {
        emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        orange: 'border-orange-200 bg-orange-50 text-orange-700',
        blue: 'border-blue-200 bg-blue-50 text-[#1450d8]',
        slate: 'border-slate-200 bg-white text-slate-700',
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Claim header */}
            <section className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(can(MODULES.details) ? ROUTES.claimDetails : ROUTES.dashboard)}
                        className="flex items-center gap-2 text-[12.5px] font-semibold text-slate-700 hover:text-[#1450d8]"
                    >
                        <ArrowLeftOutlined /> Back
                    </button>
                    <h1 className="mb-0 text-[17px] font-bold text-slate-900">Documents DMS</h1>
                    <span className="rounded-full bg-[#e8efff] px-3 py-1 text-[11.5px] font-bold text-[#1450d8]">{claim.claimNo}</span>
                    {claim.stageLabel ? <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">{claim.stageLabel}</span> : null}
                    <span className="ml-auto">
                        <ClaimPicker className="w-[260px]" />
                    </span>
                </div>
                <dl className="m-0 mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {info.map((item) => (
                        <div key={item.key}>
                            <dt className="text-[10.5px] text-slate-500">{item.label}</dt>
                            <dd className="m-0 truncate text-[12.5px] font-semibold text-slate-900">{item.value || '—'}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            {/* At a glance */}
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {stats.map((s) => (
                    <button
                        key={s.key}
                        type="button"
                        onClick={() => (s.key === 'survey' ? setTab('survey') : s.key === 'cust' ? (setTab('documents'), setFilter('customer')) : setTab('documents'))}
                        className={cn('rounded-xl border px-4 py-3 text-left transition hover:shadow-sm', TONE[s.tone])}
                    >
                        <span className="block text-[11px] font-medium opacity-80">{s.label}</span>
                        <span className="block text-[20px] leading-tight font-bold">{s.value}</span>
                        <span className="block text-[10.5px] opacity-80">{s.hint}</span>
                    </button>
                ))}
            </section>

            {/* Tabs */}
            <section className="flex flex-wrap gap-6 rounded-xl border border-slate-200 bg-white px-5 py-3">
                {DMS_TABS.map((item) => {
                    const Icon = TAB_ICONS[item.icon] || FileTextOutlined;
                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setTab(item.key)}
                            className={cn(
                                'flex items-center gap-2 border-b-2 pb-1 text-[13px] font-semibold transition',
                                item.key === tab ? 'border-[#1450d8] text-[#1450d8]' : 'border-transparent text-slate-600 hover:text-[#1450d8]'
                            )}
                        >
                            <Icon /> {item.key === 'survey' ? 'Customer Survey' : item.label}
                            {item.key === 'survey' && survey?.submittedAt ? <span className="h-2 w-2 rounded-full bg-emerald-500" /> : null}
                        </button>
                    );
                })}
            </section>

            {tab === 'documents' ? (
                <>
                    {survey?.submittedAt ? (
                        <button
                            type="button"
                            onClick={() => setTab('survey')}
                            className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-left text-[12px] text-emerald-800"
                        >
                            <CheckCircleFilled /> The customer submitted the survey on {fmtDateTime(survey.submittedAt)} ({survey.fileCount} files).
                            <b className="underline">See the details they filled</b>
                        </button>
                    ) : null}

                    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
                        {/* Upload */}
                        <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                            <h2 className="mb-0.5 text-[14px] font-bold text-[#1450d8]">Upload Documents</h2>
                            <p className="mb-3 text-[11.5px] text-slate-500">1. Choose the document type · 2. Drop or browse the files</p>
                            <label className="mb-1 block text-[11px] font-medium text-[#1668e3]">Document Type</label>
                            <Select
                                className="mb-3 w-full"
                                value={dropType}
                                onChange={setDropType}
                                options={DOCUMENT_TYPES.map((d) => ({ label: `${d.label}${byType[d.type]?.required ? ' (Required)' : ''}`, value: d.type }))}
                            />
                            <Dragger
                                multiple
                                disabled={!canUpload}
                                showUploadList={false}
                                beforeUpload={(file) => {
                                    docs.upload(dropType, file);
                                    return false;
                                }}
                                className="!rounded-lg !border-slate-300 !bg-slate-50 !py-8"
                            >
                                <p className="!mb-2 text-[26px] text-[#1450d8]">{docs.uploading ? <LoadingOutlined /> : <CloudUploadOutlined />}</p>
                                <p className="!mb-1 text-[12px] font-semibold text-slate-700">Drag &amp; drop files here</p>
                                <p className="!mb-3 text-[11px] text-slate-500">or</p>
                                <span className="inline-flex rounded-md bg-[#1450d8] px-4 py-1.5 text-[11.5px] font-semibold text-white">Browse Files</span>
                                <p className="!mt-3 !mb-0 text-[10px] text-slate-400">JPG, PNG, WEBP or PDF · max 10 MB each</p>
                            </Dragger>
                        </section>

                        {/* Checklist */}
                        <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h2 className="mb-0.5 text-[14px] font-bold text-[#1450d8]">Document Checklist</h2>
                                    <p className="mb-0 text-[11.5px] text-slate-500">Green = received. Orange = required and still missing.</p>
                                </div>
                                <span className="text-[11.5px] font-semibold text-slate-700">
                                    Required received: {requiredDone} of {required.length}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                                {DOCUMENT_TYPES.map((doc) => {
                                    const Icon = getIcon(doc.icon);
                                    const t = byType[doc.type];
                                    const status = t?.status ?? 'none';
                                    const latest = t?.latest;
                                    const multi = MULTI.includes(doc.type);
                                    return (
                                        <div
                                            key={doc.key}
                                            className={cn(
                                                'flex flex-col gap-2 rounded-lg border px-3 py-3',
                                                status === 'uploaded' ? 'border-emerald-200 bg-emerald-50/40' : status === 'pending' ? 'border-orange-200 bg-orange-50/40' : 'border-slate-200 bg-white'
                                            )}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#dce6fb] text-[14px] text-[#1450d8]">
                                                    <Icon />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block text-[12px] font-bold text-slate-900">
                                                        {doc.label}
                                                        {t?.count > 1 ? <span className="font-medium text-slate-500"> · {t.count} files</span> : null}
                                                    </span>
                                                    <span className="block text-[10.5px] text-slate-500">
                                                        {status === 'uploaded' ? 'Received' : status === 'pending' ? 'Required · not uploaded' : 'Optional'}
                                                    </span>
                                                </span>
                                                {status === 'uploaded' ? <CheckCircleFilled className="text-[16px] text-emerald-500" /> : status === 'pending' ? <ClockCircleOutlined className="text-[15px] text-orange-500" /> : null}
                                            </div>

                                            {latest ? (
                                                <div className="rounded-md bg-white px-2.5 py-2 text-[10.5px] text-slate-600 ring-1 ring-slate-200">
                                                    <a href={fileUrl(latest.url)} target="_blank" rel="noreferrer" className="block truncate font-semibold text-slate-800 hover:text-[#1450d8]" title={latest.name}>
                                                        {latest.name}
                                                    </a>
                                                    <span className="mt-1 flex flex-wrap items-center gap-1.5">
                                                        <UploaderTag file={latest} />
                                                        <span>{fmtDateTime(latest.uploadedAt)}</span>
                                                    </span>
                                                </div>
                                            ) : null}

                                            <div className="mt-auto flex gap-2">
                                                {latest ? (
                                                    <>
                                                        <Button size="small" icon={<EyeOutlined />} href={fileUrl(latest.url)} target="_blank">View</Button>
                                                        <Button size="small" icon={<DownloadOutlined />} href={`${fileUrl(latest.url)}&download=1`}>Download</Button>
                                                    </>
                                                ) : null}
                                                <Button
                                                    size="small"
                                                    type={latest ? 'default' : 'primary'}
                                                    ghost={!latest}
                                                    className="ml-auto"
                                                    disabled={!canUpload}
                                                    icon={latest && !multi ? <SyncOutlined /> : <UploadOutlined />}
                                                    onClick={() => uploadType(doc.type, multi)}
                                                >
                                                    {latest ? (multi ? 'Add' : 'Replace') : 'Upload'}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* All files */}
                    <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <h2 className="mb-0 text-[14px] font-bold text-[#1450d8]">All Uploaded Files ({files.length})</h2>
                            <Segmented
                                size="small"
                                value={filter}
                                onChange={setFilter}
                                options={[
                                    { label: `All (${files.length})`, value: 'all' },
                                    { label: `From Customer (${fromCustomer})`, value: 'customer' },
                                    { label: `From Staff (${files.length - fromCustomer})`, value: 'staff' },
                                ]}
                            />
                        </div>
                        {groups.length ? (
                            <div className="flex flex-col gap-4">
                                {groups.map((g) => (
                                    <div key={g.type}>
                                        <h3 className="mb-2 text-[12px] font-bold text-slate-800">
                                            {g.label} <span className="font-medium text-slate-500">({g.files.length})</span>
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
                                            {g.files.map((f) => <FileCard key={f.id} file={f} />)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mb-0 text-[12px] text-slate-500">{files.length ? 'No files for this filter.' : 'No files uploaded yet.'}</p>
                        )}
                    </section>

                    <section className="flex flex-wrap items-center justify-end gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <span className="mr-auto text-[11px] text-slate-500">Upload &amp; Process checks that every required document is received.</span>
                        <Button onClick={() => navigate(-1)}>Cancel</Button>
                        <Button icon={<DownloadOutlined />} loading={busy === 'zip'} disabled={!files.length || !can(MODULES.dms, 'download')} onClick={() => bundle('zip')}>
                            Download ZIP
                        </Button>
                        <Button icon={<FilePdfOutlined />} loading={busy === 'pdf'} disabled={!files.length || !can(MODULES.dms, 'download')} onClick={() => bundle('pdf')}>
                            Download PDF
                        </Button>
                        <Button type="primary" loading={processing} disabled={!can(MODULES.dms, 'edit')} onClick={process}>
                            Upload &amp; Process
                        </Button>
                    </section>
                </>
            ) : tab === 'survey' ? (
                <SurveyPanel survey={survey} files={files} canRunAi={can(MODULES.dms, 'edit')} aiRunning={busy === 'ai'} onRunAi={runAi} />
            ) : (
                <section className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
                    <p className="mb-1 text-[13px] font-semibold text-slate-800">{DMS_TABS.find((item) => item.key === tab)?.label}</p>
                    <p className="mb-0 text-[11.5px] text-slate-500">Screen design pending.</p>
                </section>
            )}
        </div>
    );
}
