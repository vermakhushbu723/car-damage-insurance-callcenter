import { App, Badge, Tooltip, Upload } from 'antd';
import { CloudUploadOutlined, ReloadOutlined } from '@ant-design/icons';

import { DMS_DOCUMENTS, DOCUMENT_TONES, UPLOAD_HINT } from '../../config/dmsDocuments.js';
import { getIcon } from '../common/iconRegistry.jsx';
import useClaimDocuments, { pickFiles } from '../../hooks/useClaimDocuments.js';
import { fmtDateTime } from '../../utils/format.js';
import cn from '../../utils/cn.js';

const { Dragger } = Upload;

/**
 * Right-hand document rail (Intimation, Claim Details). A tile with no file
 * opens the file picker for that document type; a tile with files calls
 * `onSelect(tile, latestFile)`. `ensureClaim` lets the intimation screen save
 * a draft first when nothing is saved yet.
 */
export default function DmsDocumentsPanel({ claimId, onSelect, ensureClaim, activeType, documents = DMS_DOCUMENTS, onChange }) {
    const { message } = App.useApp();
    const docs = useClaimDocuments(claimId);
    const byType = Object.fromEntries((docs.state?.types ?? []).map((t) => [t.type, t]));

    const target = async () => {
        if (claimId) return claimId;
        if (!ensureClaim) {
            message.info('Open a claim first');
            return null;
        }
        return ensureClaim();
    };

    const uploadTo = async (type, files) => {
        const id = await target();
        if (!id) return;
        for (const f of files) await docs.upload(type, f, id);
        if (id !== claimId) await docs.reload();
        onChange?.();
    };

    const onTile = async (tile) => {
        const t = byType[tile.key];
        if (t?.latest) return onSelect?.(tile, t.latest);
        const files = await pickFiles({ multiple: tile.key === 'vehicle-photos' || tile.key === 'other' });
        if (files.length) await uploadTo(tile.key, files);
        return undefined;
    };

    if (docs.state?.denied) {
        return (
            <aside className="rounded-xl border border-slate-100 bg-white p-3.5 text-[11px] text-slate-500 shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
                Your role cannot view this claim&apos;s documents.
            </aside>
        );
    }

    return (
        <aside className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
            <header className="mb-3 flex items-center justify-between">
                <h2 className="text-[12.5px] font-bold text-slate-800">DMS Documents</h2>
                <button
                    type="button"
                    aria-label="Refresh documents"
                    onClick={() => docs.reload().then(() => message.success('Documents refreshed'))}
                    className="text-slate-400 transition hover:text-[#1450d8]"
                >
                    <ReloadOutlined spin={docs.uploading} />
                </button>
            </header>

            <div className="grid grid-cols-3 gap-2.5">
                {documents.map((doc) => {
                    const Icon = getIcon(doc.icon);
                    const t = byType[doc.key];
                    return (
                        <Tooltip
                            key={doc.key}
                            title={t?.latest ? `${t.latest.name} · ${fmtDateTime(t.latest.uploadedAt)}` : 'Not uploaded -- click to upload'}
                        >
                            <Badge count={t?.count || 0} size="small" offset={[-6, 6]} color="#10b981">
                                <button
                                    type="button"
                                    onClick={() => onTile(doc)}
                                    className={cn(
                                        'flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-lg border p-1.5 text-center transition hover:-translate-y-0.5 hover:shadow-sm',
                                        DOCUMENT_TONES[doc.tone] || DOCUMENT_TONES.blue,
                                        !t?.count && 'opacity-55',
                                        activeType === doc.key && 'ring-2 ring-[#1450d8]'
                                    )}
                                >
                                    <Icon className="text-[14px]" />
                                    <span className="text-[9px] leading-tight font-semibold">{doc.label}</span>
                                </button>
                            </Badge>
                        </Tooltip>
                    );
                })}
            </div>

            <Dragger
                multiple
                showUploadList={false}
                beforeUpload={(file, list) => {
                    // antd calls this per file; upload the batch once, on its first file.
                    if (file === list[0]) uploadTo('other', list);
                    return false;
                }}
                className="!mt-3.5 !rounded-lg !border-dashed !border-[#b9cdf3] !bg-[#f4f8ff]"
            >
                <p className="!mb-1 text-[#1450d8]">
                    <CloudUploadOutlined className="text-lg" />
                </p>
                <p className="!mb-0.5 text-[11px] font-semibold text-[#1450d8]">{UPLOAD_HINT.title}</p>
                <p className="!mb-0 text-[9px] leading-tight text-slate-500">
                    {UPLOAD_HINT.subtitle}
                    <br />
                    {UPLOAD_HINT.support}
                </p>
            </Dragger>
        </aside>
    );
}
