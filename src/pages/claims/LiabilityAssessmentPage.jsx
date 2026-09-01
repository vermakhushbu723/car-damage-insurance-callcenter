import { useState } from 'react';
import { App, Button, Input, Select, Table } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

import {
    ADDITIONAL_CHARGES,
    ALLOWED_OPTIONS,
    FINAL_ASSESSMENT,
    LABOUR_COMPUTATION,
    MATERIAL_OPTIONS,
    PARTS_ASSESSMENT,
    PARTS_COMPUTATION,
    REPAIR_REPLACE_OPTIONS,
    TOTAL_PARTS_ALLOWED,
} from '../../data/liabilityData.js';
import ClaimShell from '../../components/claim/ClaimShell.jsx';
import cn from '../../utils/cn.js';

const header = (label) => <span className="text-[11.5px] font-semibold text-slate-800">{label}</span>;
const cell = (value) => <span className="text-[11.5px] text-slate-700">{value}</span>;

/** Simple label / values grid used by the four computation blocks. */
function ComputationCard({ title, table, onViewAll }) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
                <h3 className="mb-0 text-[13.5px] font-bold text-[#1450d8]">{title}</h3>
                <button
                    type="button"
                    onClick={onViewAll}
                    className="text-[11.5px] font-semibold text-[#1450d8] hover:underline"
                >
                    View All
                </button>
            </header>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse">
                    <thead>
                        <tr className="bg-slate-50">
                            {table.columns.map((column, index) => (
                                <th
                                    key={column}
                                    className={cn(
                                        'px-5 py-2.5 text-[11.5px] font-semibold text-slate-700',
                                        index === 0 ? 'text-left' : 'text-right'
                                    )}
                                >
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {table.rows.map((row) => (
                            <tr key={row.key} className="border-t border-slate-100">
                                <td
                                    className={cn(
                                        'px-5 py-2.5 text-[11.5px]',
                                        row.bold ? 'font-bold text-slate-900' : 'text-slate-700'
                                    )}
                                >
                                    {row.label}
                                </td>
                                {row.values.map((value, index) => (
                                    <td
                                        key={`${row.key}-${index}`}
                                        className={cn(
                                            'px-5 py-2.5 text-right text-[11.5px]',
                                            row.bold ? 'font-bold text-slate-900' : 'text-slate-700'
                                        )}
                                    >
                                        {value}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default function LiabilityAssessmentPage() {
    const { message } = App.useApp();
    const [parts, setParts] = useState(PARTS_ASSESSMENT);
    const [filters, setFilters] = useState({ part: '', material: undefined, action: undefined, allowed: undefined, remarks: '' });

    const visible = parts.filter((row) => {
        if (filters.part && !row.part.toLowerCase().includes(filters.part.toLowerCase())) return false;
        if (filters.material && row.material !== filters.material) return false;
        if (filters.action && row.action !== filters.action) return false;
        if (filters.allowed && row.allowed !== filters.allowed) return false;
        return true;
    });

    const addPart = () => {
        const next = String(parts.length + 1).padStart(2, '0');
        setParts((list) => [
            ...list,
            {
                key: `new-${Date.now()}`,
                srNo: next,
                part: filters.part || 'New Part',
                material: filters.material || 'Metal',
                action: filters.action || 'Repair',
                allowed: filters.allowed || 'Allowed',
                remarks: filters.remarks || '--',
                hsnCode: '8708',
                partPrice: '7,624',
                depreciation: '50%',
            },
        ]);
        message.success('Part added to the assessment');
    };

    const columns = [
        { title: header('Sr.No'), dataIndex: 'srNo', key: 'srNo', render: cell },
        { title: header('Part Time'), dataIndex: 'part', key: 'part', render: cell },
        { title: header('Material'), dataIndex: 'material', key: 'material', render: cell },
        { title: header('Repair/Replace'), dataIndex: 'action', key: 'action', render: cell },
        {
            title: header('Allowed/Disallowed'),
            dataIndex: 'allowed',
            key: 'allowed',
            render: (value) => (
                <span
                    className={cn(
                        'inline-flex rounded-md px-3 py-1 text-[11px] font-semibold',
                        value === 'Allowed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-600'
                    )}
                >
                    {value}
                </span>
            ),
        },
        { title: header('Remarks'), dataIndex: 'remarks', key: 'remarks', render: cell },
        { title: header('HSN/SAC Code'), dataIndex: 'hsnCode', key: 'hsnCode', render: cell },
        { title: header('Part Price'), dataIndex: 'partPrice', key: 'partPrice', render: cell },
        { title: header('Dep%'), dataIndex: 'depreciation', key: 'depreciation', render: cell },
    ];

    return (
        <ClaimShell title="ILA" subtitle="Intelligent Liability Assessment" stage="fla">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
                    <h3 className="mb-0 text-[13.5px] font-bold text-[#1450d8]">Parts Assessment</h3>
                    <Button type="primary" icon={<PlusOutlined />} onClick={addPart}>
                        Add Part
                    </Button>
                </header>

                <div className="grid grid-cols-1 gap-4 px-5 pb-4 sm:grid-cols-2 xl:grid-cols-5">
                    <div>
                        <span className="mb-1.5 block text-[11.5px] text-slate-600">Part Name</span>
                        <Input
                            value={filters.part}
                            placeholder="Search Part Name"
                            suffix={<SearchOutlined className="text-slate-400" />}
                            onChange={(event) => setFilters((prev) => ({ ...prev, part: event.target.value }))}
                        />
                    </div>
                    <div>
                        <span className="mb-1.5 block text-[11.5px] text-slate-600">Material</span>
                        <Select
                            allowClear
                            className="w-full"
                            placeholder="Select Material"
                            value={filters.material}
                            options={MATERIAL_OPTIONS}
                            onChange={(value) => setFilters((prev) => ({ ...prev, material: value }))}
                        />
                    </div>
                    <div>
                        <span className="mb-1.5 block text-[11.5px] text-slate-600">Repair/Replace</span>
                        <Select
                            allowClear
                            className="w-full"
                            placeholder="Select"
                            value={filters.action}
                            options={REPAIR_REPLACE_OPTIONS}
                            onChange={(value) => setFilters((prev) => ({ ...prev, action: value }))}
                        />
                    </div>
                    <div>
                        <span className="mb-1.5 block text-[11.5px] text-slate-600">Allowed/Disallowed</span>
                        <Select
                            allowClear
                            className="w-full"
                            placeholder="Select"
                            value={filters.allowed}
                            options={ALLOWED_OPTIONS}
                            onChange={(value) => setFilters((prev) => ({ ...prev, allowed: value }))}
                        />
                    </div>
                    <div>
                        <span className="mb-1.5 block text-[11.5px] text-slate-600">Remarks</span>
                        <Input
                            value={filters.remarks}
                            placeholder="Enter Remarks"
                            onChange={(event) => setFilters((prev) => ({ ...prev, remarks: event.target.value }))}
                        />
                    </div>
                </div>

                <Table
                    columns={columns}
                    dataSource={visible}
                    rowKey="key"
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                    className="[&_.ant-table-thead>tr>th]:!bg-white"
                />

                <footer className="flex justify-end gap-6 border-t border-slate-100 px-5 py-3 text-[12.5px] font-bold text-slate-900">
                    <span>Total Parts Allowed Ammount</span>
                    <span>{TOTAL_PARTS_ALLOWED}</span>
                </footer>
            </section>

            <ComputationCard
                title="Parts Computation"
                table={PARTS_COMPUTATION}
                onViewAll={() => message.info('Parts computation')}
            />
            <ComputationCard
                title="Labour Computation"
                table={LABOUR_COMPUTATION}
                onViewAll={() => message.info('Labour computation')}
            />
            <ComputationCard
                title="Additional Charges & Deductions"
                table={ADDITIONAL_CHARGES}
                onViewAll={() => message.info('Charges and deductions')}
            />
            <ComputationCard
                title="Final Assessment"
                table={FINAL_ASSESSMENT}
                onViewAll={() => message.info('Final assessment')}
            />

            <div className="flex flex-wrap justify-end gap-3">
                <Button onClick={() => message.success('Report submitted')}>
                    Submit Report
                </Button>
                <Button type="primary" onClick={() => message.success('Report generated')}>
                    Generate Report
                </Button>
            </div>
        </ClaimShell>
    );
}
