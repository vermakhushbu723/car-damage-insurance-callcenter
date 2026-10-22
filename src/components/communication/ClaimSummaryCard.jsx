import { CLAIM_NOTE, claimSummaryRows, QUICK_ACTIONS } from '../../data/claimData.js';
import { getIcon } from '../common/iconRegistry.jsx';
import cn from '../../utils/cn.js';

const ACTION_TONES = {
    violet: 'bg-violet-100 text-violet-500',
    amber: 'bg-amber-100 text-amber-500',
    blue: 'bg-blue-100 text-blue-500',
    green: 'bg-emerald-100 text-emerald-500',
};

/** This layout uses a paper-plane for "Send Email". */
const ICON_OVERRIDES = { 'send-email': 'send' };

/** Claim ID sits in the page header here, so the card starts at Insured Name. */
const summaryRows = (claim) => claimSummaryRows(claim).filter((row) => row.key !== 'claimId');

/**
 * Single right-hand card holding Claim Summary, Notes and Quick Action —
 * the grouped variant used on the claim-communication screen.
 */
export default function ClaimSummaryCard({ claim, onAction, canAct = true }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-5">
            <h3 className="mb-4 text-[15px] font-bold text-slate-900">Claim Summary</h3>

            <dl className="space-y-3">
                {summaryRows(claim).map((row) => (
                    <div key={row.key} className="grid grid-cols-2 items-center gap-3">
                        <dt className="text-[11.5px] font-semibold text-slate-800">{row.label}:</dt>
                        <dd className="mb-0 text-[11.5px] text-slate-800">
                            {row.tag ? (
                                <span className="inline-flex rounded-md bg-emerald-100 px-3 py-1.5 text-[11.5px] font-semibold text-emerald-600">
                                    {row.value}
                                </span>
                            ) : (
                                row.value
                            )}
                        </dd>
                    </div>
                ))}
            </dl>

            <h3 className="mt-6 mb-2 text-[15px] font-bold text-slate-900">Notes</h3>
            <p className="mb-0 text-[11.5px] leading-5 font-semibold text-slate-800">{CLAIM_NOTE}</p>

            <h3 className="mt-6 mb-3 text-[15px] font-bold text-slate-900">Quick Action</h3>
            <div className="flex flex-col gap-3.5">
                {QUICK_ACTIONS.filter((a) => canAct || a.key === 'issue-letter').map((action) => {
                    const Icon = getIcon(ICON_OVERRIDES[action.key] || action.icon);
                    return (
                        <button
                            key={action.key}
                            type="button"
                            onClick={() => onAction?.(action)}
                            className="flex items-center gap-3.5 text-left transition hover:opacity-80"
                        >
                            <span
                                className={cn(
                                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13.5px]',
                                    ACTION_TONES[action.tone]
                                )}
                            >
                                <Icon />
                            </span>
                            <span className="text-[12px] font-medium text-slate-800">{action.label}</span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
