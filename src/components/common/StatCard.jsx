import { ArrowDownOutlined, ArrowUpOutlined, InfoCircleOutlined } from '@ant-design/icons';

import { getIcon } from './iconRegistry.jsx';
import cn from '../../utils/cn.js';

const TONES = {
    blue: { text: 'text-[#1450d8]', bubble: 'bg-[#1450d8]', soft: 'bg-blue-50 text-[#1450d8]' },
    green: { text: 'text-emerald-600', bubble: 'bg-emerald-500', soft: 'bg-emerald-50 text-emerald-600' },
    orange: { text: 'text-amber-500', bubble: 'bg-amber-500', soft: 'bg-amber-50 text-amber-600' },
    purple: { text: 'text-violet-600', bubble: 'bg-violet-500', soft: 'bg-violet-50 text-violet-600' },
    violet: { text: 'text-violet-600', bubble: 'bg-violet-500', soft: 'bg-violet-50 text-violet-600' },
    amber: { text: 'text-amber-500', bubble: 'bg-amber-500', soft: 'bg-amber-50 text-amber-600' },
};

/**
 * KPI tile.
 * variant="kpi"     – dashboard cards (title, big value, caption, trend)
 * variant="summary" – communication-history cards (icon, title, value)
 */
export default function StatCard({ stat, variant = 'kpi' }) {
    const tone = TONES[stat.tone] || TONES.blue;
    const Icon = getIcon(stat.icon);

    if (variant === 'summary') {
        return (
            <div className="flex items-center gap-3.5 px-1 py-1">
                <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg', tone.soft)}>
                    <Icon />
                </span>
                <span className="min-w-0">
                    <span className="block text-[11px] text-slate-500">{stat.title}</span>
                    <span
                        className={cn(
                            'block font-bold text-slate-900',
                            stat.small ? 'text-[12.5px]' : 'text-[17px] leading-6'
                        )}
                    >
                        {stat.value}
                    </span>
                </span>
            </div>
        );
    }

    const TrendIcon = stat.trend?.direction === 'down' ? ArrowDownOutlined : ArrowUpOutlined;

    return (
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
            <div className="mb-3 flex items-start justify-between gap-2">
                <span className={cn('text-[12.5px] font-bold', tone.text)}>{stat.title}</span>
                <InfoCircleOutlined className="mt-1 text-[11.5px] text-slate-400" />
            </div>

            <div className="flex items-center gap-3">
                <span
                    className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl text-white',
                        tone.bubble
                    )}
                >
                    <Icon />
                </span>
                <div className="min-w-0">
                    <div className="text-[19px] leading-7 font-bold text-slate-900">{stat.value}</div>
                    <div className="truncate text-[10.5px] text-slate-500">{stat.caption}</div>
                </div>
            </div>

            {stat.trend ? (
                <div className="mt-2.5 flex items-center gap-1 text-[10.5px]">
                    <span
                        className={cn(
                            'flex items-center gap-1 font-semibold',
                            stat.trend.direction === 'down' ? 'text-red-500' : 'text-emerald-600'
                        )}
                    >
                        <TrendIcon className="text-[9.5px]" />
                        {stat.trend.value}
                    </span>
                    <span className="text-slate-500">{stat.trend.label}</span>
                </div>
            ) : null}
        </div>
    );
}
