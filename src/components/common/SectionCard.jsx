import cn from '../../utils/cn.js';

/** White panel with the numbered blue step badge used across the intimation form. */
export default function SectionCard({ step, title, action, children, className = '' }) {
    return (
        <section
            className={cn(
                'rounded-xl border border-slate-100 bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.05)] sm:p-5',
                className
            )}
        >
            {title ? (
                <header className="mb-4 flex items-center gap-2.5">
                    {step ? (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1450d8] text-[11px] font-bold text-white">
                            {step}
                        </span>
                    ) : null}
                    <h2 className="text-[13.5px] font-bold text-[#123fa8]">{title}</h2>
                    {action ? <div className="ml-auto">{action}</div> : null}
                </header>
            ) : null}
            {children}
        </section>
    );
}
