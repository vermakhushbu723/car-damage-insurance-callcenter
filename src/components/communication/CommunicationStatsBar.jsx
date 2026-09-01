import { getIcon } from '../common/iconRegistry.jsx';
import cn from '../../utils/cn.js';

/** Pastel circle + coloured caption, as in the claim-communication design. */
const TONES = {
    violet: { circle: 'bg-violet-100 text-violet-500', title: 'text-violet-500' },
    green: { circle: 'bg-emerald-100 text-emerald-500', title: 'text-emerald-600' },
    amber: { circle: 'bg-amber-100 text-amber-500', title: 'text-amber-500' },
    blue: { circle: 'bg-blue-100 text-blue-500', title: 'text-blue-500' },
};

/** This layout uses a paper-plane for "letters sent"; the rest match the data. */
const ICON_OVERRIDES = { 'letters-sent': 'send' };

export default function CommunicationStatsBar({ stats }) {
    return (
        <section className="grid grid-cols-1 gap-5 rounded-xl border border-slate-200 bg-white px-5 py-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
                const tone = TONES[stat.tone] || TONES.blue;
                const Icon = getIcon(ICON_OVERRIDES[stat.key] || stat.icon);

                return (
                    <div key={stat.key} className="flex items-center gap-4">
                        <span
                            className={cn(
                                'flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[15.5px]',
                                tone.circle
                            )}
                        >
                            <Icon />
                        </span>
                        <span className="min-w-0">
                            <span className={cn('block text-[13px] leading-6 font-bold', tone.title)}>
                                {stat.title}
                            </span>
                            <span className="block text-[12px] font-medium text-slate-800">{stat.value}</span>
                        </span>
                    </div>
                );
            })}
        </section>
    );
}
