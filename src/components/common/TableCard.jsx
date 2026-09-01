import { Table } from 'antd';

import Pager from './Pager.jsx';

/** White card with a heading, an antd table and the compact pager. */
export default function TableCard({
    title,
    extra,
    columns,
    dataSource,
    rowKey = 'key',
    page = 1,
    totalPages = 1,
    onPageChange,
}) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
            <header className="flex items-center justify-between gap-3 px-4 pt-4 pb-2 sm:px-5">
                <h2 className="text-[13.5px] font-bold text-slate-900">{title}</h2>
                {extra}
            </header>

            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey={rowKey}
                pagination={false}
                scroll={{ x: 'max-content' }}
                size="middle"
            />

            <Pager current={page} total={totalPages} onChange={onPageChange} />
        </section>
    );
}
