import { InboxOutlined } from '@ant-design/icons';

/**
 * Stand-in for the sidebar sections whose screens have not been designed yet.
 * Keeps every menu entry navigable without inventing a UI for it.
 */
export default function PlaceholderPage({ title }) {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="mb-0 text-[18px] leading-6 font-bold text-slate-900">{title}</h1>

            <section className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white px-6 py-20 text-center shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[17px] text-[#1450d8]">
                    <InboxOutlined />
                </span>
                <p className="mt-2 mb-0 text-[12.5px] font-semibold text-slate-800">{title}</p>
                <p className="mb-0 text-[11.5px] text-slate-500">Screen design pending.</p>
            </section>
        </div>
    );
}
