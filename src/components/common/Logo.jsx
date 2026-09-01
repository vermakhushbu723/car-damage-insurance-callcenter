import cn from '../../utils/cn.js';

/** Shield mark on its own – used on the letter preview and small spots. */
export function LogoMark({ className = '' }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={cn('shrink-0', className)}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
        >
            <path d="M12 2.5 4.5 5.6v5.6c0 4.5 3.2 8.7 7.5 10.3 4.3-1.6 7.5-5.8 7.5-10.3V5.6L12 2.5Z" />
            <path d="m8.8 12 2.2 2.2 4.2-4.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/** IBima Assist wordmark used in the blue application bar. */
export default function Logo({ className = '' }) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#1450d8]">
                <LogoMark className="h-5 w-5" />
            </span>
            <span className="leading-tight">
                <span className="block text-[11.5px] font-bold tracking-wide text-[#0b2f7a]">
                    IBima <span className="text-orange-500">Assist</span>
                </span>
                <span className="block text-[9px] font-semibold tracking-[0.1em] text-[#0b2f7a]">
                    Claim Managment
                </span>
            </span>
        </div>
    );
}
