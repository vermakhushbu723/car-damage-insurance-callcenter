import { DONUT_TONES } from '../../data/ilaData.js';
import cn from '../../utils/cn.js';

/** Simple SVG ring gauge – no chart library needed for a single value. */
function Donut({ value, tone, display }) {
    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    const filled = (Math.min(100, Math.max(0, value)) / 100) * circumference;

    return (
        <svg viewBox="0 0 64 64" className="h-[62px] w-[62px] shrink-0">
            <circle cx="32" cy="32" r={radius} fill="none" stroke="#eef2f7" strokeWidth="6" />
            <circle
                cx="32"
                cy="32"
                r={radius}
                fill="none"
                stroke={tone}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${filled} ${circumference - filled}`}
                transform="rotate(-90 32 32)"
            />
            <text
                x="32"
                y="36"
                textAnchor="middle"
                className="fill-slate-900 text-[11.5px] font-bold"
                style={{ fontSize: 13, fontWeight: 700 }}
            >
                {display}
            </text>
        </svg>
    );
}

/** Model diagnostics panel next to the survey viewer. */
export default function AiInsightsCard({ donuts = [], rows = [] }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
            <h3 className="mb-0.5 text-[13px] font-bold text-[#1450d8]">AI Assessment Insights</h3>
            <p className="mb-3 text-[11px] text-slate-500">Model Diagnostics</p>

            <div className="grid grid-cols-2 gap-2.5">
                {donuts.map((donut) => (
                    <div
                        key={donut.key}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2.5"
                    >
                        <Donut value={donut.value} tone={DONUT_TONES[donut.key] ?? '#1450d8'} display={donut.display} />
                        <span className="min-w-0">
                            <span className="block text-[9px] leading-tight font-semibold tracking-wider text-slate-500 uppercase">
                                {donut.label}
                            </span>
                        </span>
                    </div>
                ))}
            </div>

            <dl className="mt-4 space-y-3">
                {rows.map((row) => (
                    <div key={row.key} className="flex items-center justify-between gap-3">
                        <dt className="text-[11.5px] font-semibold text-slate-800">{row.label}</dt>
                        <dd className={cn('mb-0 text-[11.5px] font-medium text-slate-700', row.tone)}>
                            {row.value}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
