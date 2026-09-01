import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import cn from '../../utils/cn.js';

/** Builds the "1 2 3 … 58" window shown in the mock-ups. */
function buildPages(current, total) {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    const window = [current - 1, current, current + 1].filter((page) => page >= 1 && page <= total);
    const head = window[0] > 1 ? [1] : [];
    const pages = [...new Set([...head, ...window])].filter((page) => page < total);
    const list = pages.length ? pages : [1];

    return list[list.length - 1] < total - 1 ? [...list, 'ellipsis', total] : [...list, total];
}

/** Compact pager used under the tables. `align` places it right or centred. */
export default function Pager({ current = 1, total = 1, onChange, align = 'end' }) {
    const pages = buildPages(current, total);
    const go = (page) => {
        if (onChange && page >= 1 && page <= total && page !== current) onChange(page);
    };

    const baseBtn =
        'flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-[11.5px] transition select-none';

    return (
        <div
            className={cn(
                'flex flex-wrap items-center gap-1.5 px-4 py-3',
                align === 'center' ? 'justify-center' : 'justify-end'
            )}
        >
            <button
                type="button"
                aria-label="Previous page"
                disabled={current === 1}
                onClick={() => go(current - 1)}
                className={cn(baseBtn, 'border-slate-200 bg-white text-slate-500 disabled:opacity-40')}
            >
                <LeftOutlined className="text-[10.5px]" />
            </button>

            {pages.map((page, index) =>
                page === 'ellipsis' ? (
                    <span key={`gap-${index}`} className="px-1 text-slate-400">
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        type="button"
                        onClick={() => go(page)}
                        className={cn(
                            baseBtn,
                            page === current
                                ? 'border-[#1450d8] bg-[#1450d8] font-semibold text-white'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-[#1450d8] hover:text-[#1450d8]'
                        )}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                type="button"
                aria-label="Next page"
                disabled={current === total}
                onClick={() => go(current + 1)}
                className={cn(baseBtn, 'border-slate-200 bg-white text-slate-500 disabled:opacity-40')}
            >
                <RightOutlined className="text-[10.5px]" />
            </button>
        </div>
    );
}
