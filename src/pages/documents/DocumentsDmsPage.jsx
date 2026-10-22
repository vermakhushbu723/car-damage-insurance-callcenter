import { useState } from 'react';
import { App, Button, Select, Upload } from 'antd';
import {
    ArrowLeftOutlined,
    BookOutlined,
    CheckCircleOutlined,
    CloudUploadOutlined,
    DownloadOutlined,
    ExperimentOutlined,
    EyeOutlined,
    FileTextOutlined,
    InfoCircleOutlined,
    LoadingOutlined,
    SyncOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { DMS_TABS, DOCUMENT_TYPES } from '../../data/documentsData.js';
import { getIcon } from '../../components/common/iconRegistry.jsx';
import { NoClaim } from '../../components/claim/ClaimShell.jsx';
import useClaimDocuments, { pickFiles } from '../../hooks/useClaimDocuments.js';
import { api, fileUrl } from '../../api/client.js';
import { useAppState } from '../../context/AppContext.jsx';
import { MODULES } from '../../constants/navigation.js';
import ROUTES from '../../constants/routes.js';
import { errText, fileSize, fmtDateTime } from '../../utils/format.js';
import cn from '../../utils/cn.js';

const { Dragger } = Upload;

const TAB_ICONS = {
    file: FileTextOutlined,
    book: BookOutlined,
    experiment: ExperimentOutlined,
    info: InfoCircleOutlined,
};

export default function DocumentsDmsPage() {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const { claim, can } = useAppState();
    const [tab, setTab] = useState('documents');
    const [dropType, setDropType] = useState('other');
    const [processing, setProcessing] = useState(false);
    const docs = useClaimDocuments(claim?.id);

    if (!claim) return <NoClaim />;

    const byType = Object.fromEntries((docs.state?.types ?? []).map((t) => [t.type, t]));
    const files = docs.state?.files ?? [];
    const canUpload = can(MODULES.dms, 'create') || can(MODULES.intimation, 'create');

    const uploadType = async (type, multiple = false) => {
        const picked = await pickFiles({ multiple });
        for (const f of picked) await docs.upload(type, f);
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

    const bar = [
        { key: 'claimId', label: 'Claim Id', value: claim.claimNo },
        { key: 'status', label: '', value: claim.stageLabel },
        { key: 'policyNumber', label: 'Policy Number', value: claim.policyNo || '—' },
        { key: 'insured', label: 'Insured', value: claim.insuredName || '—' },
        { key: 'vehicle', label: 'Vehicle', value: [claim.intimation?.make, claim.intimation?.model].filter(Boolean).join(' ') || '—' },
        { key: 'regNo', label: 'Reg No', value: claim.vehicleNo || '—' },
    ];

    return (
        <div className="flex flex-col gap-4">
            <section className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-slate-50 px-5 py-4">
                <button
                    type="button"
                    onClick={() => navigate(can(MODULES.details) ? ROUTES.claimDetails : ROUTES.dashboard)}
                    className="flex items-center gap-2 text-[13px] font-semibold text-slate-800 hover:text-[#1450d8]"
                >
                    <ArrowLeftOutlined /> Back
                </button>
                {bar.map((item) => (
                    <span key={item.key} className="border-l border-slate-300 pl-6 text-[13px] font-semibold text-slate-800">
                        {item.label ? `${item.label}: ` : ''}
                        {item.value}
                    </span>
                ))}
            </section>

            <section className="flex flex-wrap gap-8 rounded-xl bg-slate-50 px-5 py-4">
                {DMS_TABS.map((item) => {
                    const Icon = TAB_ICONS[item.icon] || FileTextOutlined;
                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setTab(item.key)}
                            className={cn(
                                'flex items-center gap-2 text-[13.5px] font-semibold transition',
                                item.key === tab ? 'text-[#1450d8]' : 'text-slate-700 hover:text-[#1450d8]'
                            )}
                        >
                            <Icon /> {item.label}
                        </button>
                    );
                })}
            </section>

            {tab === 'documents' ? (
                <>
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
                        <div>
                            <h2 className="mb-1 text-[14.5px] font-bold text-[#1450d8]">Upload Documents</h2>
                            <p className="mb-3 text-[12.5px] font-semibold text-slate-800">Upload Requerd Documents For This Claim</p>

                            <div className="mb-2 flex items-center gap-2 text-[11.5px] text-slate-600">
                                Upload as
                                <Select
                                    size="small"
                                    className="w-[200px]"
                                    value={dropType}
                                    onChange={setDropType}
                                    options={DOCUMENT_TYPES.map((d) => ({ label: d.label, value: d.type }))}
                                />
                            </div>

                            <Dragger
                                multiple
                                disabled={!canUpload}
                                showUploadList={false}
                                beforeUpload={(file) => {
                                    docs.upload(dropType, file);
                                    return false;
                                }}
                                className="!rounded-lg !border-slate-200 !bg-white !py-16"
                            >
                                <p className="!mb-2 text-[20px] text-slate-700">{docs.uploading ? <LoadingOutlined /> : <CloudUploadOutlined />}</p>
                                <p className="!mb-1 text-[11.5px] text-slate-600">Drag &amp; Drop Files Here</p>
                                <p className="!mb-3 text-[11.5px] text-slate-600">Or</p>
                                <span className="inline-flex rounded-md bg-[#c6d5f5] px-4 py-1.5 text-[11.5px] font-semibold text-[#1450d8]">Browse Files</span>
                                <p className="!mt-2 !mb-0 text-[10px] text-slate-400">JPG, PNG, WEBP or PDF · max 10 MB</p>
                            </Dragger>
                        </div>

                        <div>
                            <h2 className="mb-3 text-[14.5px] font-bold text-[#1450d8]">Document Type</h2>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {DOCUMENT_TYPES.map((doc) => {
                                    const Icon = getIcon(doc.icon);
                                    const t = byType[doc.type];
                                    const status = t?.status ?? 'none';
                                    const multi = doc.type === 'vehicle-photos' || doc.type === 'other' || doc.type === 'surveyor-report';
                                    return (
                                        <div key={doc.key} className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                                            <div className="mb-3 flex items-center gap-3">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#dce6fb] text-[13px] text-[#1450d8]">
                                                    <Icon />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block text-[12px] font-bold text-[#1450d8]">
                                                        {doc.code}
                                                        {t?.count > 1 ? ` (${t.count})` : ''}
                                                    </span>
                                                    <span className="block text-[11.5px] text-slate-700">{doc.label}</span>
                                                </span>
                                            </div>

                                            {status !== 'none' ? (
                                                <span
                                                    className={cn(
                                                        'mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold',
                                                        status === 'uploaded' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-600'
                                                    )}
                                                >
                                                    {status === 'uploaded' ? <CheckCircleOutlined /> : <LoadingOutlined />}
                                                    {status === 'uploaded' ? 'Uploaded' : 'Pending'}
                                                </span>
                                            ) : null}

                                            {t?.latest ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <a
                                                        href={`${fileUrl(t.latest.url)}&download=1`}
                                                        className="flex items-center justify-center gap-1.5 rounded-md bg-[#c6d5f5] py-2 text-[11.5px] font-medium text-[#1450d8]"
                                                    >
                                                        <DownloadOutlined /> Download
                                                    </a>
                                                    <button
                                                        type="button"
                                                        disabled={!canUpload}
                                                        onClick={() => uploadType(doc.type, multi)}
                                                        className="flex items-center justify-center gap-1.5 rounded-md bg-[#c6d5f5] py-2 text-[11.5px] font-medium text-[#1450d8] disabled:opacity-50"
                                                    >
                                                        <SyncOutlined /> {multi ? 'Add' : 'Replace'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={!canUpload}
                                                    onClick={() => uploadType(doc.type, multi)}
                                                    className="flex w-full items-center justify-center gap-1.5 rounded-md bg-[#c6d5f5] py-2 text-[11.5px] font-medium text-[#1450d8] disabled:opacity-50"
                                                >
                                                    <UploadOutlined /> Upload
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="mb-3 text-[14.5px] font-bold text-[#1450d8]">Uploaded Files ({files.length})</h2>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {files.map((file) => (
                                <div key={file.id} className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="mb-0.5 truncate text-[14px] font-bold text-[#1450d8]" title={file.name}>
                                            {file.name}
                                        </p>
                                        <a href={fileUrl(file.url)} target="_blank" rel="noreferrer" aria-label="Open" className="text-slate-500 hover:text-[#1450d8]">
                                            <EyeOutlined />
                                        </a>
                                    </div>
                                    <p className="mb-4 text-[11.5px] font-semibold text-slate-700">
                                        {file.typeLabel} · {fileSize(file.size)} · {fmtDateTime(file.uploadedAt)}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <span className="h-2 flex-1 rounded-full bg-slate-200">
                                            <span style={{ width: '100%' }} className="block h-2 rounded-full bg-emerald-500" />
                                        </span>
                                        <span className="text-[11.5px] font-semibold text-slate-700">100%</span>
                                    </div>
                                </div>
                            ))}
                            {!files.length ? <p className="text-[12px] text-slate-500">No files uploaded yet.</p> : null}
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-3">
                        <Button onClick={() => navigate(-1)}>Cancel</Button>
                        <Button type="primary" loading={processing} disabled={!can(MODULES.dms, 'edit')} onClick={process}>
                            Upload &amp; Processes
                        </Button>
                    </div>
                </>
            ) : (
                <section className="rounded-xl border border-slate-200 bg-white px-6 py-20 text-center">
                    <p className="mb-1 text-[13px] font-semibold text-slate-800">{DMS_TABS.find((item) => item.key === tab)?.label}</p>
                    <p className="mb-0 text-[11.5px] text-slate-500">Screen design pending.</p>
                </section>
            )}
        </div>
    );
}
