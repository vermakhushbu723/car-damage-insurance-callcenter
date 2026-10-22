import { useState } from 'react';
import { Button, Empty } from 'antd';
import { ExpandOutlined, ReloadOutlined, ThunderboltOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';

import { DAMAGE_MODES, SEVERITY_TONES } from '../../data/ilaData.js';
import { fileUrl } from '../../api/client.js';
import SurveyPhoto from './SurveyPhoto.jsx';
import cn from '../../utils/cn.js';

/**
 * Survey viewer: the selected vehicle photo from Documents DMS with the AI's
 * damage boxes on top. The Damage toggle shows only Repair / Replace boxes
 * (None hides them; click the active one again to show all).
 */
export default function AiAnalysisCard({ images = [], rows = [], activeKey, ai, canRun, running, onRun }) {
    const [mode, setMode] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [rotate, setRotate] = useState(0);

    const active = images.find((image) => image.id === activeKey) || images[0];
    const overlays = rows
        .filter((r) => r.documentId === active?.id && r.box && r.status !== 'Rejected')
        .filter((r) => (mode === null ? true : mode === 'none' ? false : r.action.toLowerCase() === mode));
    const withConf = overlays.filter((o) => o.confidence !== null);
    const mean = withConf.length ? Math.round(withConf.reduce((s, o) => s + o.confidence, 0) / withConf.length) : null;

    const tools = [
        { key: 'zoom-in', icon: ZoomInOutlined, label: 'Zoom in', run: () => setZoom((z) => Math.min(3, z + 0.25)) },
        { key: 'zoom-out', icon: ZoomOutOutlined, label: 'Zoom out', run: () => setZoom((z) => Math.max(1, z - 0.25)) },
        { key: 'rotate', icon: ReloadOutlined, label: 'Rotate', run: () => setRotate((r) => r + 90) },
        { key: 'expand', icon: ExpandOutlined, label: 'Open full size', run: () => active && window.open(fileUrl(active.url), '_blank') },
    ];

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h3 className="mb-0 text-[13px] font-bold text-[#1450d8]">AI Analysis</h3>
                    <p className="mb-0 text-[11px] text-slate-500">
                        {active ? `Survey Images - ${active.name}` : 'No vehicle photos yet'}
                        {ai?.model ? ` · Model ${ai.model}` : ''}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {canRun ? (
                        <Button size="small" icon={<ThunderboltOutlined />} loading={running} onClick={onRun}>
                            {ai?.status === 'done' ? 'Re-run AI' : 'Run AI Assessment'}
                        </Button>
                    ) : null}
                    <span className="text-[11.5px] font-bold text-slate-800">Damage:</span>
                    <div className="flex overflow-hidden rounded-md">
                        {DAMAGE_MODES.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => setMode((m) => (m === item.key ? null : item.key))}
                                className={cn(
                                    'px-5 py-1.5 text-[11.5px] font-semibold text-white transition',
                                    item.className,
                                    mode === null || mode === item.key ? 'opacity-100' : 'opacity-45 hover:opacity-75'
                                )}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="relative h-[300px] overflow-hidden bg-slate-900 sm:h-[360px]">
                {active ? (
                    <div className="absolute inset-0 transition-transform" style={{ transform: `scale(${zoom}) rotate(${rotate}deg)` }}>
                        <img src={fileUrl(active.url)} alt={active.name} className="h-full w-full object-fill" />
                        {overlays.map((row, i) => {
                            const tone = SEVERITY_TONES[row.severity.toLowerCase()] ?? SEVERITY_TONES.minor;
                            return (
                                <div
                                    key={row.id}
                                    style={{
                                        left: `${row.box.x}%`,
                                        top: `${row.box.y}%`,
                                        width: `${row.box.w}%`,
                                        height: `${row.box.h}%`,
                                        borderColor: tone.stroke,
                                        backgroundColor: tone.fill,
                                    }}
                                    className="absolute rounded-md border-2"
                                >
                                    <span
                                        style={{ backgroundColor: tone.stroke }}
                                        className="absolute -top-3 left-1 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold whitespace-nowrap text-white"
                                    >
                                        <span className="flex h-3 w-3 items-center justify-center rounded-full bg-white/30">{i + 1}</span>
                                        {row.damageType} · {row.part}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="absolute inset-0">
                        <SurveyPhoto className="h-full w-full opacity-40" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Empty description={<span className="text-white">Upload vehicle photos in Documents DMS</span>} />
                        </div>
                    </div>
                )}

                {active ? (
                    <span className="absolute top-3 left-3 rounded-md bg-black/60 px-2.5 py-1 text-[10.5px] text-white">
                        {overlays.length} damages{mean !== null ? ` · ${mean}% mean confidence` : ''}
                    </span>
                ) : null}

                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-2 py-1.5 shadow-md">
                    {tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                            <button
                                key={tool.key}
                                type="button"
                                aria-label={tool.label}
                                onClick={tool.run}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-[11.5px] text-slate-600 transition hover:bg-slate-100 hover:text-[#1450d8]"
                            >
                                <Icon />
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
