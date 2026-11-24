import cn from '../../utils/cn.js';
import ibimaLogo from '../../assets/images/ibimaLogo.png';

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

/** The IBima Assist logo of the website (same image on every panel). */
export default function Logo({ className = '', height = 34 }) {
    return <img src={ibimaLogo} alt="IBima Assist" className={cn('block w-auto', className)} style={{ height }} />;
}
