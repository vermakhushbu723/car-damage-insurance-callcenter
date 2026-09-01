import { useState } from 'react';
import { App, Button, DatePicker, Input, InputNumber, Radio, Select, Table } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import {
    APPROVAL_INFO,
    FINANCIAL_SUMMARY,
    NET_PAYABLE,
    PAYEE_NAME_OPTIONS,
    PAYEE_ROWS,
    PAYEE_TYPE_OPTIONS,
    PAYMENT_FOR_OPTIONS,
    PAYMENT_MODE_OPTIONS,
    PAYMENT_PRIORITY_OPTIONS,
    PAYMENT_TYPE_OPTIONS,
    TOTAL_PAYABLE,
} from '../../data/paymentData.js';
import { formatINR } from '../../data/ilaData.js';
import ClaimShell from '../../components/claim/ClaimShell.jsx';

const header = (label) => <span className="text-[11.5px] font-semibold text-slate-800">{label}</span>;

function Label({ children }) {
    return <span className="mb-1.5 block text-[11.5px] font-bold text-[#1450d8]">{children}</span>;
}

export default function PaymentRecommendationPage() {
    const { message } = App.useApp();
    const [payment, setPayment] = useState({
        type: 'full',
        mode: 'neft',
        priority: 'normal',
        date: dayjs('2025-05-03'),
        remarks: '',
    });
    const [rows, setRows] = useState(PAYEE_ROWS.map((row) => ({ ...row })));

    const set = (name) => (value) => setPayment((prev) => ({ ...prev, [name]: value?.target ? value.target.value : value }));
    const updateRow = (key, field, value) =>
        setRows((list) => list.map((row) => (row.key === key ? { ...row, [field]: value } : row)));

    const allocated = rows.reduce((sum, row) => sum + (row.amount || 0), 0);
    const tdsTotal = rows.reduce((sum, row) => sum + (row.tds || 0), 0);
    const netTotal = allocated - tdsTotal;
    const unallocated = TOTAL_PAYABLE - allocated;

    const addRow = () =>
        setRows((list) => [
            ...list,
            {
                key: `new-${Date.now()}`,
                payeeType: 'Workshop',
                payeeName: 'ABC Motors, Noida',
                bankName: 'HDFC Bank Ltd.',
                bankBranch: 'Noida, Branch',
                ifsc: 'HDFC001234',
                accountNo: '123456789012345',
                paymentFor: 'Repair Expenses',
                amount: 0,
                tds: 0,
            },
        ]);

    const columns = [
        {
            title: header('Payee Type'),
            key: 'payeeType',
            render: (_value, row) => (
                <Select
                    value={row.payeeType}
                    options={PAYEE_TYPE_OPTIONS}
                    className="w-[130px]"
                    onChange={(value) => updateRow(row.key, 'payeeType', value)}
                />
            ),
        },
        {
            title: header('Payee Name'),
            key: 'payeeName',
            render: (_value, row) => (
                <Select
                    value={row.payeeName}
                    options={PAYEE_NAME_OPTIONS}
                    className="w-[160px]"
                    popupMatchSelectWidth={false}
                    onChange={(value) => updateRow(row.key, 'payeeName', value)}
                />
            ),
        },
        {
            title: header('Bank Details'),
            key: 'bank',
            render: (_value, row) => (
                <span className="block min-w-[120px]">
                    <span className="block text-[11.5px] font-semibold text-slate-800">{row.bankName}</span>
                    <span className="block text-[10.5px] text-slate-500">{row.bankBranch}</span>
                </span>
            ),
        },
        {
            title: header('IFSC Code'),
            dataIndex: 'ifsc',
            key: 'ifsc',
            render: (value) => <span className="text-[11.5px] text-slate-700">{value}</span>,
        },
        {
            title: header('Account No'),
            dataIndex: 'accountNo',
            key: 'accountNo',
            render: (value) => <span className="text-[11.5px] text-slate-700">{value}</span>,
        },
        {
            title: header('Payment For'),
            key: 'paymentFor',
            render: (_value, row) => (
                <Select
                    value={row.paymentFor}
                    options={PAYMENT_FOR_OPTIONS}
                    className="w-[160px]"
                    popupMatchSelectWidth={false}
                    onChange={(value) => updateRow(row.key, 'paymentFor', value)}
                />
            ),
        },
        {
            title: header('Amount'),
            key: 'amount',
            render: (_value, row) => (
                <InputNumber
                    value={row.amount}
                    min={0}
                    className="w-[110px]"
                    formatter={(value) => formatINR(Number(value || 0))}
                    parser={(value) => Number(String(value).replace(/[^\d]/g, ''))}
                    onChange={(value) => updateRow(row.key, 'amount', value || 0)}
                />
            ),
        },
        {
            title: header('TDS'),
            key: 'tds',
            render: (_value, row) => (
                <InputNumber
                    value={row.tds}
                    min={0}
                    className="w-[90px]"
                    onChange={(value) => updateRow(row.key, 'tds', value || 0)}
                />
            ),
        },
        {
            title: header('Net Ammount'),
            key: 'net',
            render: (_value, row) => (
                <span className="text-[11.5px] text-slate-700">
                    {formatINR((row.amount || 0) - (row.tds || 0))}.00
                </span>
            ),
        },
        {
            title: header('Action'),
            key: 'action',
            align: 'center',
            render: (_value, row) => (
                <span className="flex items-center justify-center gap-3">
                    <EditOutlined
                        onClick={() => message.info('Edit payee row')}
                        className="cursor-pointer text-slate-500 hover:text-[#1450d8]"
                    />
                    <DeleteOutlined
                        onClick={() => setRows((list) => list.filter((item) => item.key !== row.key))}
                        className="cursor-pointer text-slate-500 hover:text-red-500"
                    />
                </span>
            ),
        },
    ];

    return (
        <ClaimShell
            title="Payment Recommendation"
            subtitle="Evaluate And Recommend The Settlement Amount"
            stage="payment-recommendation"
        >
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <h3 className="mb-3 px-5 pt-4 text-[15px] font-bold text-[#1450d8]">Claim Financial Summary</h3>
                    <dl className="space-y-3 px-5 pb-4">
                        {FINANCIAL_SUMMARY.map((row) => (
                            <div key={row.key} className="flex items-center justify-between gap-3">
                                <dt className="text-[12px] font-semibold text-slate-800">{row.label}</dt>
                                <dd className="mb-0 text-[12px] text-slate-800">{row.value}</dd>
                            </div>
                        ))}
                    </dl>
                    <div className="flex items-center justify-between gap-3 bg-[#c6d5f5] px-5 py-3">
                        <span className="text-[12.5px] font-bold text-slate-900">{NET_PAYABLE.label}</span>
                        <span className="text-[12.5px] font-bold text-slate-900">{NET_PAYABLE.value}</span>
                    </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                    <h3 className="mb-3 text-[15px] font-bold text-[#1450d8]">Payment Details</h3>

                    <Label>Payment Type</Label>
                    <Radio.Group
                        value={payment.type}
                        onChange={set('type')}
                        className="mb-4 flex flex-wrap gap-x-6"
                    >
                        {PAYMENT_TYPE_OPTIONS.map((option) => (
                            <Radio key={option.value} value={option.value} className="!mr-0 text-[11.5px]">
                                {option.label}
                            </Radio>
                        ))}
                    </Radio.Group>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label>Payment Mode</Label>
                            <Select
                                className="w-full"
                                value={payment.mode}
                                options={PAYMENT_MODE_OPTIONS}
                                onChange={set('mode')}
                            />
                        </div>
                        <div>
                            <Label>Payment Priority</Label>
                            <Select
                                className="w-full"
                                value={payment.priority}
                                options={PAYMENT_PRIORITY_OPTIONS}
                                onChange={set('priority')}
                            />
                        </div>
                        <div>
                            <Label>Payment Date</Label>
                            <DatePicker
                                allowClear={false}
                                className="w-full"
                                format="DD MMM YYYY"
                                value={payment.date}
                                onChange={set('date')}
                            />
                        </div>
                        <div>
                            <Label>Remarks</Label>
                            <Input placeholder="Remarks" value={payment.remarks} onChange={set('remarks')} />
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <h3 className="mb-3 px-5 pt-4 text-[15px] font-bold text-[#1450d8]">Payment Summary</h3>
                    <dl className="space-y-3 px-5 pb-4">
                        <div className="flex items-center justify-between gap-3">
                            <dt className="text-[12px] text-slate-700">Total Payable Ammount</dt>
                            <dd className="mb-0 text-[12px] text-slate-800">{formatINR(TOTAL_PAYABLE)}.00</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <dt className="text-[12px] text-slate-700">Total Payment Allocated</dt>
                            <dd className="mb-0 text-[12px] text-slate-800">{formatINR(allocated)}.00</dd>
                        </div>
                    </dl>
                    <div className="mt-auto flex items-center justify-between gap-3 bg-[#c6d5f5] px-5 py-3">
                        <span className="text-[12px] text-slate-800">Unallocated Ammount</span>
                        <span className="text-[12px] font-semibold text-slate-900">{formatINR(unallocated)}.00</span>
                    </div>
                </section>
            </div>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <Table
                    columns={columns}
                    dataSource={rows}
                    rowKey="key"
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                    className="[&_.ant-table-thead>tr>th]:!bg-[#c6d5f5]"
                />

                <footer className="flex flex-wrap items-center justify-between gap-4 px-5 py-3">
                    <Button icon={<PlusOutlined />} onClick={addRow}>
                        Add Payee Row
                    </Button>
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="text-[11.5px] text-slate-700">Total</span>
                        <span className="rounded-md border border-slate-300 px-4 py-1.5 text-[11.5px] font-semibold text-slate-900">
                            {formatINR(allocated)}.00
                        </span>
                        <span className="rounded-md border border-slate-300 px-4 py-1.5 text-[11.5px] font-semibold text-slate-900">
                            {formatINR(tdsTotal)}.00
                        </span>
                        <span className="text-[11.5px] text-slate-700">{formatINR(netTotal)}.00</span>
                    </div>
                </footer>
            </section>

            <section className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 xl:w-[520px]">
                <h3 className="mb-1 text-[15px] font-bold text-[#1450d8]">Approval Information</h3>
                <p className="mb-4 text-[12px] font-semibold text-slate-800">{APPROVAL_INFO.status}</p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {APPROVAL_INFO.rows.map((row) => (
                        <div key={row.key}>
                            <span className="mb-1 block text-[13px] font-bold text-[#1450d8]">{row.label}</span>
                            <span className="block text-[12px] text-slate-800">{row.value}</span>
                        </div>
                    ))}
                </div>
            </section>
        </ClaimShell>
    );
}
