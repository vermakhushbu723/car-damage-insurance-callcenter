import { RightOutlined } from '@ant-design/icons';

import { CLAIM_NOTE, claimSummaryRows, QUICK_ACTIONS } from '../../data/claimData.js';
import { getIcon } from '../common/iconRegistry.jsx';
import cn from '../../utils/cn.js';

const ACTION_TONES = {
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-[#1450d8]',
    green: 'bg-emerald-50 text-emerald-600',
};

function Panel({ title, children }) {
    return (
        <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
            <h3 className="mb-3 text-[12.5px] font-bold text-slate-900">{title}</h3>
            {children}
        </section>
    );
}

/** Claim summary + note + quick actions rail. */
export default function ClaimSidePanel({ claim, onAction, canAct = true }) {
    return (
        <div className="flex flex-col gap-4">
            <Panel title="Claim Summary">
                <dl className="space-y-2.5">
                    {claimSummaryRows(claim).map((row) => (
                        <div key={row.key} className="flex items-center justify-between gap-3">
                            <dt className="text-[11px] text-slate-500">{row.label}</dt>
                            <dd
                                className={cn(
                                    'mb-0 text-right text-[11px] font-semibold',
                                    row.highlight && 'text-[#1450d8]',
                                    !row.highlight && !row.tag && 'text-slate-800'
                                )}
                            >
                                {row.tag ? (
                                    <span className="rounded-md bg-blue-50 px-2 py-1 text-[10.5px] font-semibold text-[#1450d8]">
                                        {row.value}
                                    </span>
                                ) : (
                                    row.value
                                )}
                            </dd>
                        </div>
                    ))}
                </dl>
            </Panel>

            <Panel title="Note">
                <p className="mb-0 text-[11px] leading-5 text-slate-600">{CLAIM_NOTE}</p>
            </Panel>

            <Panel title="Quick Actions">
                <div className="flex flex-col gap-2">
                    {QUICK_ACTIONS.filter((a) => canAct || a.key === 'issue-letter').map((action) => {
                        const Icon = getIcon(action.icon);
                        return (
                            <button
                                key={action.key}
                                type="button"
                                onClick={() => onAction?.(action)}
                                className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5 text-left transition hover:border-[#1450d8]/40 hover:bg-slate-50"
                            >
                                <span
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-lg text-[12px]',
                                        ACTION_TONES[action.tone]
                                    )}
                                >
                                    <Icon />
                                </span>
                                <span className="flex-1 text-[11.5px] font-medium text-slate-800">{action.label}</span>
                                <RightOutlined className="text-[9.5px] text-slate-300" />
                            </button>
                        );
                    })}
                </div>
            </Panel>
        </div>
    );
}
