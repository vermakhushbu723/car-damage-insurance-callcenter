import { useState } from 'react';
import { Empty } from 'antd';
import {
    DownloadOutlined,
    FileTextOutlined,
    LeftOutlined,
    MinusOutlined,
    PlusOutlined,
    RedoOutlined,
    RightOutlined,
    UndoOutlined,
} from '@ant-design/icons';

import { fileUrl } from '../../api/client.js';
import { fmtDateTime } from '../../utils/format.js';

const btn = 'flex h-6 w-6 items-center justify-center rounded bg-[#1450d8] text-[9.5px] text-white disabled:opacity-40';

/**
 * Viewer of the claim's uploaded documents (from Documents DMS): images and
 * PDFs, one at a time. ‹ › steps through the files, − / + zoom, ↶ ↷ rotate.
 */
export default function DocumentViewer({ files = [], index = 0, onIndex }) {
    const [zoom, setZoom] = useState(100);
    const [rotate, setRotate] = useState(0);
    const doc = files[index] ?? null;
    const step = (delta) => {
        const next = Math.min(files.length - 1, Math.max(0, index + delta));
        onIndex?.(next);
        setRotate(0);
    };
    const url = doc ? fileUrl(doc.url) : null;

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="flex flex-wrap items-center justify-between gap-3 bg-[#c6d5f5] px-4 py-2.5">
                <span className="flex min-w-0 items-center gap-2 text-[12px] font-semibold text-slate-800">
                    <FileTextOutlined /> <span className="truncate">{doc ? `${doc.typeLabel} · ${doc.name}` : 'No Document'}</span>
                </span>

                <span className="flex items-center gap-2">
                    <button type="button" aria-label="Previous document" disabled={index <= 0} onClick={() => step(-1)} className={btn}>
                        <LeftOutlined />
                    </button>
                    <span className="text-[11.5px] font-medium text-slate-800">
                        {files.length ? index + 1 : 0}/{files.length}
                    </span>
                    <button type="button" aria-label="Next document" disabled={index >= files.length - 1} onClick={() => step(1)} className={btn}>
                        <RightOutlined />
                    </button>
                </span>

                <span className="flex items-center gap-2">
                    <button type="button" aria-label="Zoom out" onClick={() => setZoom((v) => Math.max(50, v - 10))} className={btn}>
                        <MinusOutlined />
                    </button>
                    <span className="text-[11.5px] font-medium text-slate-800">{zoom}</span>
                    <button type="button" aria-label="Zoom in" onClick={() => setZoom((v) => Math.min(200, v + 10))} className={btn}>
                        <PlusOutlined />
                    </button>
                    <UndoOutlined aria-label="Rotate left" onClick={() => setRotate((r) => r - 90)} className="cursor-pointer text-[11.5px] text-slate-600" />
                    <RedoOutlined aria-label="Rotate right" onClick={() => setRotate((r) => r + 90)} className="cursor-pointer text-[11.5px] text-slate-600" />
                    {url ? (
                        <a href={`${url}&download=1`} aria-label="Download" className="text-[11.5px] text-slate-600 hover:text-[#1450d8]">
                            <DownloadOutlined />
                        </a>
                    ) : null}
                </span>
            </header>

            <div className="flex min-h-[460px] items-center justify-center overflow-auto bg-slate-50 px-4 py-4">
                {!doc ? (
                    <Empty description="No documents uploaded for this claim yet. Upload them from the DMS panel." />
                ) : doc.mime?.startsWith('video/') ? (
                    <video src={url} controls className="max-h-[560px] w-full rounded bg-black" />
                ) : doc.mime === 'application/pdf' ? (
                    <iframe title={doc.name} src={url} className="h-[560px] w-full rounded border border-slate-200 bg-white" style={{ zoom: `${zoom}%` }} />
                ) : (
                    <img
                        src={url}
                        alt={doc.name}
                        style={{ width: `${zoom}%`, transform: `rotate(${rotate}deg)` }}
                        className="max-w-none rounded shadow-sm transition-transform"
                    />
                )}
            </div>
            {doc ? (
                <footer className="border-t border-slate-100 px-4 py-2 text-[10.5px] text-slate-500">
                    Uploaded by {doc.uploadedBy ?? '—'} · {fmtDateTime(doc.uploadedAt)}
                </footer>
            ) : null}
        </section>
    );
}
