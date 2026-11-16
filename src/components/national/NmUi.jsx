import { ArrowUpOutlined, CloseOutlined, DownOutlined, SearchOutlined } from '@ant-design/icons';
import { Drawer, Select } from 'antd';

import cn from '../../utils/cn.js';

export const NM_BLUE = '#0b4fc9';

const TONES = {
    blue: { text: 'text-[#0b4fc9]', tile: 'bg-[#dbe6fb] text-[#0b4fc9]', solid: '#b9cdf3' },
    purple: { text: 'text-[#7c3aed]', tile: 'bg-[#ead9fb] text-[#7c3aed]', solid: '#dcc8f6' },
    amber: { text: 'text-[#f59e0b]', tile: 'bg-[#fdeccd] text-[#f59e0b]', solid: '#fbe2bb' },
    orange: { text: 'text-[#ea7a1a]', tile: 'bg-[#fde4cf] text-[#ea7a1a]', solid: '#fbdcc0' },
    green: { text: 'text-[#0f9a59]', tile: 'bg-[#cfe9db] text-[#0f9a59]', solid: '#bddccb' },
    red: { text: 'text-[#c81e1e]', tile: 'bg-[#f6d3d3] text-[#c81e1e]', solid: '#ecbcbc' },
    rose: { text: 'text-[#e11d48]', tile: 'bg-[#fbd5dc] text-[#e11d48]', solid: '#f4c4ce' },
    teal: { text: 'text-[#0d8f9c]', tile: 'bg-[#cdeaee] text-[#0d8f9c]', solid: '#bfe1e6' },
};
export const toneOf = (tone) => TONES[tone] ?? TONES.blue;

/** Page heading; `sample` marks a page whose numbers are not live yet. */
export function NmTitle({ title, sample = false, onBack, children }) {
    return (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
                {onBack ? (
                    <button
                        type="button"
                        aria-label="Back"
                        onClick={onBack}
                        className="grid h-6 w-6 place-items-center rounded-full border-2 border-[#0b4fc9] text-[10px] text-[#0b4fc9]"
                    >
                        ‹
                    </button>
                ) : null}
                <h1 className="m-0 text-[26px] leading-tight font-bold tracking-tight text-[#0b4fc9]">{title}</h1>
                {sample ? (
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10.5px] font-semibold text-amber-700 ring-1 ring-amber-200">
                        Sample data
                    </span>
                ) : null}
            </div>
            {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
        </div>
    );
}

export function NmButton({ children, variant = 'primary', className = '', ...rest }) {
    return (
        <button
            type="button"
            {...rest}
            className={cn(
                'inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-[12.5px] font-semibold whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-50',
                variant === 'primary' && 'bg-[#0b4fc9] text-white hover:bg-[#0a44ad]',
                variant === 'soft' && 'bg-[#bcd0f3] text-[#0b4fc9] hover:bg-[#a9c2ee]',
                variant === 'outline' && 'border border-[#0b4fc9] bg-white text-[#0b4fc9] hover:bg-blue-50',
                className
            )}
        >
            {children}
        </button>
    );
}

/** KPI tile: small icon tile + coloured title, big value, optional trend. */
export function KpiCard({ title, value, delta, note, tone = 'blue', icon, footer }) {
    const t = toneOf(tone);
    return (
        <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2">
                <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-md text-[13px]', t.tile)}>{icon ?? '●'}</span>
                <span className={cn('text-[12px] leading-tight font-semibold', t.text)}>{title}</span>
            </div>
            <p className="mt-2 mb-0 pl-1 text-[22px] leading-none font-bold text-slate-900">{value}</p>
            {delta ? (
                <p className="mt-2 mb-0 flex items-center gap-1 pl-1 text-[10.5px] text-slate-700">
                    <ArrowUpOutlined className="text-[10px] text-[#0f9a59]" />
                    <span className="font-semibold text-[#0f9a59]">{delta}</span> {note}
                </p>
            ) : null}
            {footer ? <div className="mt-2 pl-1">{footer}</div> : null}
        </div>
    );
}

const STATUS_TONES = {
    Active: 'green',
    Success: 'green',
    Connected: 'green',
    Cleared: 'green',
    'Up to Date': 'green',
    Pending: 'amber',
    Warning: 'amber',
    'Under review': 'amber',
    'Approval Log': 'amber',
    Medium: 'amber',
    Suspended: 'red',
    Failed: 'red',
    Escalated: 'red',
    High: 'red',
    Critical: 'red',
    Open: 'blue',
    Low: 'blue',
};

export function StatusPill({ value, tone, className = '' }) {
    const t = toneOf(tone ?? STATUS_TONES[value] ?? 'blue');
    return (
        <span className={cn('inline-flex min-w-20 items-center justify-center rounded-md px-3 py-1 text-[12px] font-medium', t.tile, className)}>
            {value}
        </span>
    );
}

/** The On/Off pill of the Figma permission matrix. */
export function OnOff({ checked, onChange, disabled = false, label }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange?.(!checked)}
            className="relative inline-flex h-[17px] w-[52px] items-center rounded-full bg-[#c5d5f4] text-[10px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
            <span className={cn('absolute top-0 h-[17px] w-[28px] rounded-full bg-[#0b4fc9] transition-all', checked ? 'left-0' : 'left-[24px]')} />
            <span className={cn('relative w-[28px] text-center', checked ? 'text-white' : 'text-white/90')}>On</span>
            <span className={cn('relative w-[24px] text-center', checked ? 'text-white/90' : 'text-white')}>Off</span>
        </button>
    );
}

export const Card = ({ title, action, className = '', children }) => (
    <section className={cn('rounded-lg border border-slate-200 bg-white', className)}>
        {title ? (
            <header className="flex items-center justify-between gap-2 px-4 pt-3 pb-2">
                <h2 className="m-0 text-[15px] font-bold text-[#0b4fc9]">{title}</h2>
                {action}
            </header>
        ) : null}
        {children}
    </section>
);

/** Plain data table. `blue` gives the solid blue header row of the Figma tables. */
export function NmTable({ columns, rows, rowKey = 'id', blue = false, empty = 'No records', minWidth = 760 }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left" style={{ minWidth }}>
                <thead>
                    <tr className={blue ? 'bg-[#0b4fc9] text-white' : 'bg-slate-50 text-slate-900'}>
                        {columns.map((c) => (
                            <th key={c.key} className="px-3 py-3 text-[12.5px] font-semibold whitespace-nowrap" style={{ width: c.width, textAlign: c.align }}>
                                {c.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-3 py-10 text-center text-[12.5px] text-slate-500">
                                {empty}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, i) => (
                            <tr key={row[rowKey] ?? i} className="border-t border-slate-200">
                                {columns.map((c) => (
                                    <td key={c.key} className="px-3 py-2.5 text-[12.5px] text-slate-800" style={{ textAlign: c.align }}>
                                        {c.render ? c.render(row) : row[c.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export function FieldLabel({ label, required = false, children, className = '' }) {
    return (
        <label className={cn('block min-w-0', className)}>
            <span className="mb-1.5 block text-[12px] font-semibold text-slate-900">
                {label}
                {required ? <span className="text-red-600"> *</span> : null}
            </span>
            {children}
        </label>
    );
}

const FIELD = 'w-full rounded-md border border-slate-200 bg-[#f1f3f6] px-3 py-2.5 text-[12.5px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0b4fc9]';

export const NmInput = ({ className = '', ...rest }) => <input {...rest} className={cn(FIELD, className)} />;

export function NmSearch({ value, onChange, placeholder, className = '' }) {
    return (
        <span className={cn('relative block', className)}>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
                className={cn(FIELD, 'bg-white pr-9')}
            />
            <SearchOutlined className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500" />
        </span>
    );
}

export function NmSelect({ value, onChange, options, placeholder, className = '', showSearch = false }) {
    return (
        <Select
            value={value || undefined}
            showSearch={showSearch ? { optionFilterProp: 'label' } : undefined}
            onChange={onChange}
            placeholder={placeholder}
            suffixIcon={<DownOutlined className="text-[10px] text-slate-500" />}
            options={options.map((o) => (typeof o === 'string' ? { label: o, value: o } : o))}
            className={cn('w-full', className)}
        />
    );
}

/** Right-hand panel (Create Branch, Audit Event Details, ...). */
export function NmDrawer({ open, onClose, title, subtitle, footer, children }) {
    return (
        <Drawer
            open={open}
            onClose={onClose}
            placement="right"
            size={440}
            closable={false}
            destroyOnHidden
            footer={footer}
            styles={{ body: { padding: 16 } }}
        >
            <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="m-0 text-[20px] font-bold text-slate-900">{title}</h2>
                <button
                    type="button"
                    aria-label="Close"
                    onClick={onClose}
                    className="grid h-6 w-6 place-items-center rounded-md border-2 border-[#0b4fc9] text-[10px] text-[#0b4fc9]"
                >
                    <CloseOutlined />
                </button>
            </div>
            {subtitle ? <p className="mb-3 text-[12px] text-slate-700">{subtitle}</p> : null}
            {children}
        </Drawer>
    );
}

export const DrawerSection = ({ title, children }) => (
    <section className="mb-3 rounded-md border border-slate-100">
        <h3 className="m-0 bg-[#f1f6fd] px-3 py-1.5 text-[12.5px] font-medium text-slate-800">{title}</h3>
        <div className="grid gap-3 p-3 sm:grid-cols-2">{children}</div>
    </section>
);

/** Donut chart with its legend, drawn as SVG arcs (the portal has no chart library). */
export function DonutCard({ title, data }) {
    const sum = data.rows.reduce((n, r) => n + r.value, 0);
    let offset = 0;
    const R = 40;
    const C = 2 * Math.PI * R;
    return (
        <Card title={title} className="min-w-0">
            <div className="flex flex-wrap items-center gap-4 px-4 pb-4">
                <div className="relative h-[130px] w-[130px] shrink-0">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label={`${title}: ${data.total} total`}>
                        {data.rows.map((r) => {
                            const len = (r.value / sum) * C;
                            const dash = (
                                <circle
                                    key={r.label}
                                    cx="50"
                                    cy="50"
                                    r={R}
                                    fill="none"
                                    stroke={r.color}
                                    strokeWidth="18"
                                    strokeDasharray={`${len} ${C - len}`}
                                    strokeDashoffset={-offset}
                                />
                            );
                            offset += len;
                            return dash;
                        })}
                    </svg>
                    <div className="absolute inset-0 grid place-content-center text-center">
                        <span className="text-[19px] leading-none font-bold text-slate-900">{data.total}</span>
                        <span className="mt-1 text-[10.5px] font-medium text-slate-700">Total</span>
                    </div>
                </div>
                <ul className="m-0 min-w-[150px] flex-1 list-none space-y-1 p-0">
                    {data.rows.map((r) => (
                        <li key={r.label} className="flex items-center justify-between gap-3 text-[11.5px] text-slate-800">
                            <span className="flex min-w-0 items-center gap-2">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color }} />
                                <span className="truncate">{r.label}</span>
                            </span>
                            <span className="font-medium">{r.note}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </Card>
    );
}

/** Line chart for Claims Trend. */
export function TrendCard({ title, data }) {
    const W = 520;
    const H = 210;
    const left = 30;
    const bottom = 20;
    const max = 700;
    const right = W - 22;
    const stepX = (right - left) / (data.labels.length - 1);
    const y = (v) => H - bottom - (v / max) * (H - bottom - 8);
    // A series with fewer points than labels still spans the whole axis (as in the Figma chart).
    const pointX = (s, i) => left + (i * (right - left)) / (s.points.length - 1);
    return (
        <Card title={title} className="min-w-0">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full px-2 pb-2" role="img" aria-label={title}>
                {[0, 100, 200, 300, 400, 500, 600, 700].map((v) => (
                    <g key={v}>
                        <line x1={left} x2={right} y1={y(v)} y2={y(v)} stroke="#e5e7eb" strokeWidth="1" />
                        <text x={left - 6} y={y(v) + 3} textAnchor="end" fontSize="8" fill="#334155">
                            {v}
                        </text>
                    </g>
                ))}
                {data.labels.map((l, i) => (
                    <text key={l} x={left + i * stepX} y={H - 6} textAnchor="middle" fontSize="8" fill="#334155">
                        {l}
                    </text>
                ))}
                {data.series.map((s) => (
                    <g key={s.color}>
                        <polyline
                            fill="none"
                            stroke={s.color}
                            strokeWidth="1.5"
                            points={s.points.map((p, i) => `${pointX(s, i)},${y(p)}`).join(' ')}
                        />
                        {s.points.map((p, i) => (
                            <circle key={i} cx={pointX(s, i)} cy={y(p)} r="3" fill={s.color} />
                        ))}
                    </g>
                ))}
            </svg>
        </Card>
    );
}

export function BarRow({ label, value, max, showValue = true }) {
    return (
        <li className="grid grid-cols-[110px_1fr_36px] items-center gap-3 text-[11.5px] text-slate-800">
            <span className="truncate">{label}</span>
            <span className="h-2 overflow-hidden rounded-sm bg-slate-200">
                <span className="block h-full bg-[#0b4fc9]" style={{ width: `${(value / max) * 100}%` }} />
            </span>
            {showValue ? <span className="text-right font-medium">{value.toLocaleString('en-IN')}</span> : null}
        </li>
    );
}

export function Tabs({ tabs, active, onChange }) {
    return (
        <div className="mb-4 inline-flex flex-wrap gap-6 border-b-2 border-slate-200" role="tablist">
            {tabs.map((t) => (
                <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={active === t.key}
                    onClick={() => onChange(t.key)}
                    className={cn(
                        '-mb-0.5 border-b-2 pb-1.5 text-[14px] font-semibold',
                        active === t.key ? 'border-[#0b4fc9] text-[#0b4fc9]' : 'border-transparent text-slate-900'
                    )}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
}
