import { useEffect, useRef, useState } from 'react';
import { App, AutoComplete, Button, DatePicker, Form, Input, InputNumber, Modal, Radio, Select, Spin, Table } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import { PAYMENT_MODE_OPTIONS, PAYMENT_PRIORITY_OPTIONS, PAYMENT_TYPE_OPTIONS } from '../../data/paymentData.js';
import ClaimShell from '../../components/claim/ClaimShell.jsx';
import { api } from '../../api/client.js';
import { useAppState } from '../../context/AppContext.jsx';
import { MODULES } from '../../constants/navigation.js';
import ROUTES from '../../constants/routes.js';
import { errText, fmtDateTime, money } from '../../utils/format.js';

const header = (label) => <span className="text-[11.5px] font-semibold text-slate-800">{label}</span>;

function Label({ children }) {
    return <span className="mb-1.5 block text-[11.5px] font-bold text-[#1450d8]">{children}</span>;
}

const opts = (list) => (list ?? []).map((v) => ({ label: v, value: v }));

export default function PaymentRecommendationPage() {
    const { message, modal } = App.useApp();
    const navigate = useNavigate();
    const { claim, reloadClaim, can } = useAppState();
    const [data, setData] = useState(null);
    const [details, setDetails] = useState(null);
    const [rows, setRows] = useState([]);
    const [editing, setEditing] = useState(null);
    const [editInit, setEditInit] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const timer = useRef(null);

    const base = claim ? `/claims/${claim.id}/payment` : null;

    const apply = (d) => {
        setData(d);
        setDetails(d.details);
        setRows(d.payees);
    };

    useEffect(() => {
        if (!base || claim?.status === 'Draft') return;
        api.get(base)
            .then(apply)
            .catch((err) => message.error(errText(err)));
    }, [base, claim?.status, message]);

    const locked = data && data.status !== 'Draft';
    const canEdit = can(MODULES.payment, 'edit') && claim?.status === 'Open' && !locked;

    /** Saves a moment after the last change. */
    const persist = (nextDetails, nextRows) => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            api.put(base, { details: nextDetails, payees: nextRows })
                .then((d) => setData(d))
                .catch((err) => message.error(errText(err)));
        }, 700);
    };

    const setDetail = (name) => (value) => {
        const v = value?.target ? value.target.value : dayjs.isDayjs(value) ? value.format('YYYY-MM-DD') : value;
        const next = { ...details, [name]: v };
        setDetails(next);
        persist(next, rows);
    };

    const setRowList = (next) => {
        setRows(next);
        persist(details, next);
    };
    const updateRow = (id, field, value) => setRowList(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));

    const addRow = () => {
        const n = rows.reduce((m, r) => Math.max(m, Number(String(r.id).split('-')[1]) || 0), 0) + 1;
        const id = `PY-${n}`;
        setRowList([...rows, { id, payeeType: 'Workshop', payeeName: '', bankName: '', bankBranch: '', ifsc: '', accountNo: '', paymentFor: 'Repair Expenses', amount: Math.max(0, unallocated), tds: 0 }]);
        setEditInit({ payeeName: '', bankName: '', bankBranch: '', ifsc: '', accountNo: '' });
        setEditing(id);
    };

    const openEdit = (row) => {
        setEditInit(row);
        setEditing(row.id);
    };

    const saveEdit = async () => {
        const v = await form.validateFields();
        setRowList(rows.map((r) => (r.id === editing ? { ...r, ...v, ifsc: v.ifsc.toUpperCase() } : r)));
        setEditing(null);
    };

    const submit = async () => {
        if (!data) return;
        if (locked) return navigate(ROUTES.surveyPaybill);
        if (!canEdit) return message.info('Your role cannot submit payment recommendations');
        modal.confirm({
            title: 'Submit the payment recommendation for approval?',
            content: `₹${money(allocated)} to ${rows.map((r) => r.payeeName || '?').join(', ')}. It goes to ${data.approval.nextApprover} and can no longer be changed.`,
            onOk: async () => {
                clearTimeout(timer.current);
                setSubmitting(true);
                try {
                    apply(await api.post(`${base}/submit`, { details, payees: rows }));
                    await reloadClaim();
                    message.success('Submitted for approval');
                    navigate(ROUTES.surveyPaybill);
                } catch (err) {
                    message.error(errText(err));
                } finally {
                    setSubmitting(false);
                }
            },
        });
        return undefined;
    };

    const total = data?.summary.netPayable ?? 0;
    const allocated = rows.reduce((sum, row) => sum + (row.amount || 0), 0);
    const tdsTotal = rows.reduce((sum, row) => sum + (row.tds || 0), 0);
    const unallocated = total - allocated;

    const columns = [
        {
            title: header('Payee Type'),
            key: 'payeeType',
            render: (_v, row) => (
                <Select value={row.payeeType} disabled={!canEdit} options={opts(data.options.payeeTypes)} className="w-[130px]" onChange={(v) => updateRow(row.id, 'payeeType', v)} />
            ),
        },
        {
            title: header('Payee Name'),
            key: 'payeeName',
            render: (_v, row) => (
                <AutoComplete
                    value={row.payeeName}
                    disabled={!canEdit}
                    options={opts(data.options.payeeNames)}
                    className="w-[160px]"
                    popupMatchSelectWidth={false}
                    onChange={(v) => updateRow(row.id, 'payeeName', v)}
                />
            ),
        },
        {
            title: header('Bank Details'),
            key: 'bank',
            render: (_v, row) => (
                <span className="block min-w-[120px]">
                    <span className="block text-[11.5px] font-semibold text-slate-800">{row.bankName || <span className="text-red-500">Add bank details</span>}</span>
                    <span className="block text-[10.5px] text-slate-500">{row.bankBranch}</span>
                </span>
            ),
        },
        { title: header('IFSC Code'), dataIndex: 'ifsc', key: 'ifsc', render: (v) => <span className="text-[11.5px] text-slate-700">{v || '—'}</span> },
        { title: header('Account No'), dataIndex: 'accountNo', key: 'accountNo', render: (v) => <span className="text-[11.5px] text-slate-700">{v || '—'}</span> },
        {
            title: header('Payment For'),
            key: 'paymentFor',
            render: (_v, row) => (
                <Select
                    value={row.paymentFor}
                    disabled={!canEdit}
                    options={opts(data.options.paymentFor)}
                    className="w-[160px]"
                    popupMatchSelectWidth={false}
                    onChange={(v) => updateRow(row.id, 'paymentFor', v)}
                />
            ),
        },
        {
            title: header('Amount'),
            key: 'amount',
            render: (_v, row) => (
                <InputNumber
                    value={row.amount}
                    min={0}
                    disabled={!canEdit}
                    className="w-[110px]"
                    formatter={(value) => money(Number(value || 0)).replace('.00', '')}
                    parser={(value) => Number(String(value).replace(/[^\d]/g, ''))}
                    onChange={(value) => updateRow(row.id, 'amount', value || 0)}
                />
            ),
        },
        {
            title: header('TDS'),
            key: 'tds',
            render: (_v, row) => <InputNumber value={row.tds} min={0} disabled={!canEdit} className="w-[90px]" onChange={(value) => updateRow(row.id, 'tds', value || 0)} />,
        },
        {
            title: header('Net Ammount'),
            key: 'net',
            render: (_v, row) => <span className="text-[11.5px] text-slate-700">{money((row.amount || 0) - (row.tds || 0))}</span>,
        },
        {
            title: header('Action'),
            key: 'action',
            align: 'center',
            render: (_v, row) =>
                canEdit ? (
                    <span className="flex items-center justify-center gap-3">
                        <EditOutlined onClick={() => openEdit(row)} className="cursor-pointer text-slate-500 hover:text-[#1450d8]" />
                        <DeleteOutlined onClick={() => setRowList(rows.filter((item) => item.id !== row.id))} className="cursor-pointer text-slate-500 hover:text-red-500" />
                    </span>
                ) : null,
        },
    ];

    if (claim?.status === 'Draft') {
        return (
            <ClaimShell title="Payment Recommendation" subtitle="Evaluate And Recommend The Settlement Amount" stage="payment-recommendation">
                <p className="text-[12px] text-slate-600">Submit the intimation first.</p>
            </ClaimShell>
        );
    }

    const s = data?.summary;
    const summaryRows = s
        ? [
              ['Estimated Repair Cost (AI ILA)', money(s.aiIla)],
              ['Handler ILA Amount', money(s.handlerIla)],
              ['Approved FLA Ammount', s.approvedFla === null ? 'Pending' : money(s.approvedFla)],
              ['Deductions', ''],
              ['Total Deductions', money(s.deductions)],
          ]
        : [];

    return (
        <ClaimShell
            title="Payment Recommendation"
            subtitle="Evaluate And Recommend The Settlement Amount"
            stage="payment-recommendation"
            onNext={submit}
            nextLoading={submitting}
        >
            {!data ? (
                <Spin className="!py-10" />
            ) : (
                <>
                    {!s.flaDone ? (
                        <p className="mb-0 rounded-lg bg-amber-50 px-4 py-2 text-[11.5px] text-amber-700">
                            Net payable is set once the Handler ILA (liability) report is submitted.
                        </p>
                    ) : null}
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <h3 className="mb-3 px-5 pt-4 text-[15px] font-bold text-[#1450d8]">Claim Financial Summary</h3>
                            <dl className="space-y-3 px-5 pb-4">
                                {summaryRows.map(([label, value]) => (
                                    <div key={label} className="flex items-center justify-between gap-3">
                                        <dt className="text-[12px] font-semibold text-slate-800">{label}</dt>
                                        <dd className="mb-0 text-[12px] text-slate-800">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                            <div className="flex items-center justify-between gap-3 bg-[#c6d5f5] px-5 py-3">
                                <span className="text-[12.5px] font-bold text-slate-900">Net Payable Ammount</span>
                                <span className="text-[12.5px] font-bold text-slate-900">{money(s.netPayable)}</span>
                            </div>
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                            <h3 className="mb-3 text-[15px] font-bold text-[#1450d8]">Payment Details</h3>
                            <Label>Payment Type</Label>
                            <Radio.Group value={details.type} disabled={!canEdit} onChange={setDetail('type')} className="mb-4 flex flex-wrap gap-x-6">
                                {PAYMENT_TYPE_OPTIONS.map((option) => (
                                    <Radio key={option.value} value={option.value} className="!mr-0 text-[11.5px]">
                                        {option.label}
                                    </Radio>
                                ))}
                            </Radio.Group>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <Label>Payment Mode</Label>
                                    <Select className="w-full" disabled={!canEdit} value={details.mode} options={PAYMENT_MODE_OPTIONS} onChange={setDetail('mode')} />
                                </div>
                                <div>
                                    <Label>Payment Priority</Label>
                                    <Select className="w-full" disabled={!canEdit} value={details.priority} options={PAYMENT_PRIORITY_OPTIONS} onChange={setDetail('priority')} />
                                </div>
                                <div>
                                    <Label>Payment Date</Label>
                                    <DatePicker allowClear={false} disabled={!canEdit} className="w-full" format="DD MMM YYYY" value={dayjs(details.date)} onChange={setDetail('date')} />
                                </div>
                                <div>
                                    <Label>Remarks</Label>
                                    <Input placeholder="Remarks" disabled={!canEdit} value={details.remarks} onChange={setDetail('remarks')} />
                                </div>
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <h3 className="mb-3 px-5 pt-4 text-[15px] font-bold text-[#1450d8]">Payment Summary</h3>
                            <dl className="space-y-3 px-5 pb-4">
                                <div className="flex items-center justify-between gap-3">
                                    <dt className="text-[12px] text-slate-700">Total Payable Ammount</dt>
                                    <dd className="mb-0 text-[12px] text-slate-800">{money(total)}</dd>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <dt className="text-[12px] text-slate-700">Total Payment Allocated</dt>
                                    <dd className="mb-0 text-[12px] text-slate-800">{money(allocated)}</dd>
                                </div>
                            </dl>
                            <div className="mt-auto flex items-center justify-between gap-3 bg-[#c6d5f5] px-5 py-3">
                                <span className="text-[12px] text-slate-800">Unallocated Ammount</span>
                                <span className={`text-[12px] font-semibold ${unallocated < 0 ? 'text-red-600' : 'text-slate-900'}`}>{money(unallocated)}</span>
                            </div>
                        </section>
                    </div>

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <Table
                            columns={columns}
                            dataSource={rows}
                            rowKey="id"
                            pagination={false}
                            scroll={{ x: 'max-content' }}
                            locale={{ emptyText: 'No payees yet -- Add Payee Row.' }}
                            className="[&_.ant-table-thead>tr>th]:!bg-[#c6d5f5]"
                        />
                        <footer className="flex flex-wrap items-center justify-between gap-4 px-5 py-3">
                            <Button icon={<PlusOutlined />} disabled={!canEdit} onClick={addRow}>
                                Add Payee Row
                            </Button>
                            <div className="flex flex-wrap items-center gap-4">
                                <span className="text-[11.5px] text-slate-700">Total</span>
                                <span className="rounded-md border border-slate-300 px-4 py-1.5 text-[11.5px] font-semibold text-slate-900">{money(allocated)}</span>
                                <span className="rounded-md border border-slate-300 px-4 py-1.5 text-[11.5px] font-semibold text-slate-900">{money(tdsTotal)}</span>
                                <span className="text-[11.5px] text-slate-700">{money(allocated - tdsTotal)}</span>
                            </div>
                        </footer>
                    </section>

                    <section className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 xl:w-[520px]">
                        <h3 className="mb-1 text-[15px] font-bold text-[#1450d8]">Approval Information</h3>
                        <p className="mb-4 text-[12px] font-semibold text-slate-800">{data.approval.status}</p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {[
                                ['Next Approver', data.approval.nextApprover],
                                ['Due Date', data.approval.dueDate ? fmtDateTime(data.approval.dueDate) : '—'],
                                ['Approver Name', data.approval.approverName],
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <span className="mb-1 block text-[13px] font-bold text-[#1450d8]">{label}</span>
                                    <span className="block text-[12px] text-slate-800">{value}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}

            <Modal title="Payee Bank Details" open={!!editing} onCancel={() => setEditing(null)} onOk={saveEdit} destroyOnHidden>
                <Form form={form} layout="vertical" preserve={false} initialValues={editInit}>
                    <Form.Item name="payeeName" label="Payee Name" rules={[{ required: true }]}>
                        <AutoComplete options={opts(data?.options.payeeNames)} />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-x-3">
                        <Form.Item name="bankName" label="Bank Name" rules={[{ required: true }]}>
                            <Input placeholder="HDFC Bank Ltd." />
                        </Form.Item>
                        <Form.Item name="bankBranch" label="Branch">
                            <Input placeholder="Noida" />
                        </Form.Item>
                        <Form.Item name="ifsc" label="IFSC Code" rules={[{ required: true, pattern: /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/, message: 'e.g. HDFC0001234' }]}>
                            <Input placeholder="HDFC0001234" />
                        </Form.Item>
                        <Form.Item name="accountNo" label="Account No" rules={[{ required: true, pattern: /^\d{9,18}$/, message: '9-18 digits' }]}>
                            <Input placeholder="123456789012345" />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </ClaimShell>
    );
}
