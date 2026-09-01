import { useState } from 'react';
import {
    BulbOutlined,
    ExpandOutlined,
    ReloadOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
} from '@ant-design/icons';

import { DAMAGE_MODES, DAMAGE_OVERLAYS, SEVERITY_TONES, SURVEY_IMAGES } from '../../data/ilaData.js';
import SurveyPhoto from './SurveyPhoto.jsx';
import cn from '../../utils/cn.js';

const TOOLS = [
    { key: 'zoom-in', icon: ZoomInOutlined, label: 'Zoom in' },
    { key: 'zoom-out', icon: ZoomOutOutlined, label: 'Zoom out' },
    { key: 'rotate', icon: ReloadOutlined, label: 'Rotate' },
    { key: 'brightness', icon: BulbOutlined, label: 'Brightness' },
    { key: 'expand', icon: ExpandOutlined, label: 'Full screen' },
];

/** Survey viewer with the AI damage overlay and the image strip. */
export default function AiAnalysisCard({ images = SURVEY_IMAGES, activeKey }) {
    const [mode, setMode] = useState('repair');

    const active = images.find((image) => image.key === activeKey) || images[0];
    const overlays = DAMAGE_OVERLAYS[active.key] || [];

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h3 className="mb-0 text-[13px] font-bold text-[#1450d8]">AI Analysis</h3>
                    <p className="mb-0 text-[11px] text-slate-500">Survey Images - {active.label}</p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[11.5px] font-bold text-slate-800">Damage:</span>
                    <div className="flex overflow-hidden rounded-md">
                        {DAMAGE_MODES.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => setMode(item.key)}
                                className={cn(
                                    'px-5 py-1.5 text-[11.5px] font-semibold text-white transition',
                                    item.className,
                                    mode === item.key ? 'opacity-100' : 'opacity-45 hover:opacity-75'
                                )}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="relative bg-slate-900">
                <SurveyPhoto className="h-[300px] w-full sm:h-[360px]" />

                {overlays.map((box) => {
                    const tone = SEVERITY_TONES[box.severity];
                    return (
                        <div
                            key={box.key}
                            style={{
                                left: `${box.x}%`,
                                top: `${box.y}%`,
                                width: `${box.w}%`,
                                height: `${box.h}%`,
                                borderColor: tone.stroke,
                                backgroundColor: tone.fill,
                            }}
                            className="absolute rounded-md border-2"
                        >
                            <span
                                style={{ backgroundColor: tone.stroke }}
                                className="absolute -top-3 left-1 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold whitespace-nowrap text-white"
                            >
                                <span className="flex h-3 w-3 items-center justify-center rounded-full bg-white/30">
                                    {box.index}
                                </span>
                                {box.label}
                            </span>
                        </div>
                    );
                })}

                <span className="absolute top-3 left-3 rounded-md bg-black/60 px-2.5 py-1 text-[10.5px] text-white">
                    {overlays.length} damages · 96% mean confidence
                </span>
                <span className="absolute top-3 right-3 rounded-md bg-black/60 px-2.5 py-1 text-[10.5px] text-white">
                    2048 × 1536 · Front
                </span>

                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-2 py-1.5 shadow-md">
                    {TOOLS.map((tool) => {
                        const Icon = tool.icon;
                        return (
                            <button
                                key={tool.key}
                                type="button"
                                aria-label={tool.label}
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
