import { useState } from 'react';
import {
    FileTextOutlined,
    LeftOutlined,
    MinusOutlined,
    PlusOutlined,
    RedoOutlined,
    RightOutlined,
    UndoOutlined,
} from '@ant-design/icons';

import { VIEWER_DOCUMENT } from '../../data/claimDetailsData.js';

function Row({ label, value }) {
    return (
        <div className="flex gap-2 text-[11px] text-slate-800">
            <span className="w-[130px] shrink-0 font-semibold">{label}</span>
            <span className="shrink-0">:</span>
            <span className="font-bold whitespace-pre-line">{value}</span>
        </div>
    );
}

/** Paged viewer with the registration certificate rendered from data. */
export default function DocumentViewer({ document = VIEWER_DOCUMENT }) {
    const [page, setPage] = useState(document.page);
    const [zoom, setZoom] = useState(document.zoom);

    const step = (delta) => setPage((current) => Math.min(document.totalPages, Math.max(1, current + delta)));

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="flex flex-wrap items-center justify-between gap-3 bg-[#c6d5f5] px-4 py-2.5">
                <span className="flex items-center gap-2 text-[12px] font-semibold text-slate-800">
                    <FileTextOutlined /> {document.title}
                </span>

                <span className="flex items-center gap-2">
                    <button
                        type="button"
                        aria-label="Previous page"
                        onClick={() => step(-1)}
                        className="flex h-6 w-6 items-center justify-center rounded bg-[#1450d8] text-[9.5px] text-white"
                    >
                        <LeftOutlined />
                    </button>
                    <span className="text-[11.5px] font-medium text-slate-800">
                        {page}/{document.totalPages}
                    </span>
                    <button
                        type="button"
                        aria-label="Next page"
                        onClick={() => step(1)}
                        className="flex h-6 w-6 items-center justify-center rounded bg-[#1450d8] text-[9.5px] text-white"
                    >
                        <RightOutlined />
                    </button>
                </span>

                <span className="flex items-center gap-2">
                    <button
                        type="button"
                        aria-label="Zoom out"
                        onClick={() => setZoom((value) => Math.max(50, value - 10))}
                        className="flex h-6 w-6 items-center justify-center rounded bg-[#1450d8] text-[9.5px] text-white"
                    >
                        <MinusOutlined />
                    </button>
                    <span className="text-[11.5px] font-medium text-slate-800">{zoom}</span>
                    <button
                        type="button"
                        aria-label="Zoom in"
                        onClick={() => setZoom((value) => Math.min(200, value + 10))}
                        className="flex h-6 w-6 items-center justify-center rounded bg-[#1450d8] text-[9.5px] text-white"
                    >
                        <PlusOutlined />
                    </button>
                    <UndoOutlined className="cursor-pointer text-[11.5px] text-slate-600" />
                    <RedoOutlined className="cursor-pointer text-[11.5px] text-slate-600" />
                </span>
            </header>

            <div className="overflow-auto bg-slate-50 px-4 py-4">
                <article
                    style={{ zoom: `${zoom}%` }}
                    className="mx-auto max-w-[560px] border-[6px] border-double border-amber-700/40 bg-[#fdf9ef] px-8 py-7"
                >
                    <h3 className="mb-1 text-center text-[17px] font-bold tracking-wide text-slate-900">
                        {document.heading}
                    </h3>
                    {document.subHeadings.map((line) => (
                        <p key={line} className="mb-0 text-center text-[11.5px] font-bold text-slate-800">
                            {line}
                        </p>
                    ))}

                    <div className="my-5 flex items-center justify-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1450d8] text-[11.5px] font-bold text-white">
                            {document.stateCode}
                        </span>
                        <span className="text-[20px] font-bold text-slate-900">{document.registrationNo}</span>
                    </div>
                    <p className="mb-5 text-center text-[10.5px] text-slate-600">{document.registrationLabel}</p>

                    <div className="space-y-1.5">
                        {document.primaryRows.map((row) => (
                            <Row key={row.key} label={row.label} value={row.value} />
                        ))}
                    </div>

                    <div className="my-4 border-t border-amber-700/30" />

                    <div className="space-y-1">
                        {document.secondaryRows.map((row) => (
                            <Row key={row.key} label={row.label} value={row.value} />
                        ))}
                    </div>

                    <div className="mt-6 flex items-end justify-between gap-4">
                        <span className="text-[9.5px] whitespace-pre-line text-slate-600">
                            {document.footNote}
                            <span className="mt-1 block font-bold text-slate-800">{document.authority}</span>
                        </span>
                        <span className="text-right text-[9.5px] text-slate-700">
                            {document.signatory.map((line) => (
                                <span key={line} className="block">
                                    {line}
                                </span>
                            ))}
                        </span>
                    </div>
                </article>
            </div>
        </section>
    );
}
