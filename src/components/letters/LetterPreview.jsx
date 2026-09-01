import { LETTER_META } from '../../data/letterData.js';
import { LogoMark } from '../common/Logo.jsx';

/**
 * The printable letter. Everything on it is derived from the form state,
 * so the preview and the letter that gets issued can never disagree.
 */
export default function LetterPreview({ claim, letter, issueDate, instructions }) {
    return (
        <article className="rounded-lg border border-slate-200 bg-white px-6 py-5 text-slate-800">
            <header className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                    <LogoMark className="h-6 w-6 text-[#1450d8]" />
                    <span className="leading-tight">
                        <span className="block text-[12.5px] font-bold text-slate-900">IBIMA ASSIST</span>
                        <span className="block text-[9px] tracking-wide text-slate-500">Claims Management</span>
                    </span>
                </div>
                <div className="text-right text-[10px] text-slate-600">
                    <p className="mb-0.5">
                        <span className="font-semibold">Letter No.:</span> {LETTER_META.letterNo}
                    </p>
                    <p className="mb-0">
                        <span className="font-semibold">Date:</span> {issueDate}
                    </p>
                </div>
            </header>

            <h4 className="mb-5 text-center text-[11px] font-bold tracking-wide text-slate-900">
                {LETTER_META.title}
            </h4>

            <p className="mb-0 text-[10.5px] leading-5">To,</p>
            <p className="mb-0 text-[10.5px] leading-5">{claim.insuredName}</p>
            <p className="mb-4 text-[10.5px] leading-5">{claim.vehicleNo}</p>

            <p className="mb-4 text-[10.5px] leading-5 font-bold">Subject: {letter.subject}</p>

            <p className="mb-3 text-[10.5px] leading-5">Dear Sir/Madam,</p>
            <p className="mb-3 text-[10.5px] leading-5">{letter.intro}</p>
            <p className="mb-3 text-[10.5px] leading-5">{letter.lead}</p>

            <ol className="mb-3 list-decimal space-y-1 pl-5 text-[10.5px] leading-5">
                {letter.items.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ol>

            <p className="mb-3 text-[10.5px] leading-5">
                Please share the above information on or before <strong>{letter.deadline}</strong>.
            </p>
            <p className="mb-3 text-[10.5px] leading-5">{letter.warning}</p>
            {instructions ? <p className="mb-3 text-[10.5px] leading-5">{instructions}</p> : null}
            <p className="mb-4 text-[10.5px] leading-5">{letter.queries}</p>

            <p className="mb-0 text-[10.5px] leading-5">Thank you,</p>
            <p className="mb-0 text-[10.5px] leading-5">{LETTER_META.team}</p>
            <p className="mb-4 text-[10.5px] leading-5 font-bold">{LETTER_META.sender}</p>

            <p className="mb-0 text-[9px] text-slate-500 italic">{LETTER_META.footNote}</p>
        </article>
    );
}
