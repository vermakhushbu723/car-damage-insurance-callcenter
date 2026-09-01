import { useState } from 'react';
import { App, Button, Input, InputNumber } from 'antd';
import { DownloadOutlined, FileTextOutlined, SaveOutlined } from '@ant-design/icons';

import {
    BANK_DETAILS,
    BILL_DETAILS,
    DEFAULT_PAYBILL_REMARK,
    GST_RATE,
    PAYBILL_DOCUMENTS,
    PAYBILL_LINES,
    REMARK_LIMIT,
    SURVEY_DETAILS,
} from '../../data/paybillData.js';
import ClaimShell from '../../components/claim/ClaimShell.jsx';
import cn from '../../utils/cn.js';

const { TextArea } = Input;

const money = (value) =>
    value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function DetailGrid({ rows, columns = 4 }) {
    return (
        <div className={cn('grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2', columns === 4 && 'xl:grid-cols-4')}>
            {rows.map((row) => (
                <div key={row.key}>
                    <span className="mb-1 block text-[12.5px] font-bold text-slate-900">{row.label}</span>
                    <span className="block text-[11.5px] whitespace-pre-line text-slate-700">{row.value}</span>
                </div>
            ))}
        </div>
    );
}

export default function SurveyPaybillPage() {
    const { message } = App.useApp();
    const [lines, setLines] = useState(PAYBILL_LINES.map((line) => ({ ...line })));
    const [mode, setMode] = useState('manual');
    const [remark, setRemark] = useState(DEFAULT_PAYBILL_REMARK);

    const updateRate = (key, rate) =>
        setLines((list) => list.map((line) => (line.key === key ? { ...line, rate: rate || 0 } : line)));

    const subTotal = lines.reduce((sum, line) => sum + line.rate * line.qty, 0);
    const gst = subTotal * GST_RATE;
    const total = subTotal + gst;

    return (
        <ClaimShell
            title="Survey Paybill"
            subtitle="Review, Verify And Process Surveyor Payments"
            stage="survey-paybill"
        >
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <section className="rounded-xl border border-slate-200 bg-white px-5 py-5">
                    <h3 className="mb-4 text-[14.5px] font-bold text-slate-900">Survey Details</h3>
                    <DetailGrid rows={SURVEY_DETAILS} />
                </section>

                <section className="rounded-xl border border-slate-200 bg-white px-5 py-5">
                    <h3 className="mb-4 text-[14.5px] font-bold text-slate-900">Bill Details</h3>
                    <DetailGrid rows={BILL_DETAILS} columns={3} />
                </section>

                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="grid grid-cols-4 gap-2 bg-[#c6d5f5] px-5 py-2.5 text-[12px] font-semibold text-slate-800">
                        <span>Particulars</span>
                        <span className="text-center">Rate</span>
                        <span className="text-center">Qty/Basis</span>
                        <span className="text-right">Ammount</span>
                    </div>

                    <div className="px-5 py-3">
                        {lines.map((line) => (
                            <div key={line.key} className="grid grid-cols-4 items-center gap-2 py-1.5">
                                <span className="text-[12px] font-semibold text-slate-800">{line.label}</span>
                                <span className="flex justify-center">
                                    <InputNumber
                                        value={line.rate}
                                        min={0}
                                        disabled={mode === 'auto'}
                                        className="w-[120px] text-center"
                                        formatter={(value) => money(Number(value || 0))}
                                        parser={(value) => Number(String(value).replace(/[^\d.]/g, ''))}
                                        onChange={(value) => updateRate(line.key, value)}
                                    />
                                </span>
                                <span className="text-center text-[12px] text-slate-800">{line.basis}</span>
                                <span className="text-right text-[12px] text-slate-800">
                                    {money(line.rate * line.qty)}
                                </span>
                            </div>
                        ))}

                        <div className="mt-4 flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-start">
                            <div className="flex gap-3">
                                <Button
                                   
                                    onClick={() => setMode('auto')}
                                    className={cn(mode === 'auto' && '!border-[#1450d8] !text-[#1450d8]')}
                                >
                                    Auto
                                </Button>
                                <Button
                                    type={mode === 'manual' ? 'primary' : 'default'}
                                   
                                    onClick={() => setMode('manual')}
                                >
                                    Manual
                                </Button>
                            </div>

                            <dl className="ml-auto w-full max-w-[340px] space-y-2">
                                <div className="flex justify-between gap-4">
                                    <dt className="text-[12px] font-semibold text-slate-800">Sub Total</dt>
                                    <dd className="mb-0 text-[12px] text-slate-800">{money(subTotal)}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-[12px] font-semibold text-slate-800">GST (18%)</dt>
                                    <dd className="mb-0 text-[12px] text-slate-800">{money(gst)}</dd>
                                </div>
                                <div className="flex justify-between gap-4 border-t border-slate-200 pt-2">
                                    <dt className="text-[12.5px] font-bold text-slate-900">Total Payable</dt>
                                    <dd className="mb-0 text-[12.5px] font-bold text-slate-900">{money(total)}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white px-5 py-5">
                    <h3 className="mb-4 text-[14.5px] font-bold text-slate-900">Bank Details (For NEFT/RTGS)</h3>
                    <DetailGrid rows={BANK_DETAILS} columns={3} />
                </section>

                <section className="rounded-xl border border-slate-200 bg-white px-5 py-5">
                    <TextArea
                        value={remark}
                        rows={4}
                        maxLength={REMARK_LIMIT}
                        onChange={(event) => setRemark(event.target.value)}
                        className="!bg-white !text-[12.5px] !font-semibold"
                    />
                    <p className="mt-2 mb-0 text-[11.5px] text-slate-600">
                        {remark.length}/{REMARK_LIMIT}
                    </p>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white px-5 py-5">
                    <h3 className="mb-4 text-[14.5px] font-bold text-slate-900">Documents</h3>
                    {PAYBILL_DOCUMENTS.map((doc) => (
                        <div key={doc.key} className="flex flex-wrap items-center gap-3">
                            <FileTextOutlined className="text-[14px] text-slate-500" />
                            <span className="min-w-0 flex-1">
                                <span className="block text-[13px] font-semibold text-slate-900">{doc.name}</span>
                                <span className="block text-[11px] text-slate-500">{doc.uploadedOn}</span>
                            </span>
                            <Button type="primary" onClick={() => message.info('Opening document')}>
                                View
                            </Button>
                        </div>
                    ))}
                </section>
            </div>

            <p className="mb-0 text-[11px] text-slate-600">
                {remark.length}/{REMARK_LIMIT}
            </p>

            <div className="flex flex-wrap gap-3">
                <Button icon={<SaveOutlined />} onClick={() => message.success('Saved as draft')}>
                    Save As Draft
                </Button>
                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => message.success(`Paybill PDF generated · ₹${money(total)}`)}
                >
                    Generate PDF
                </Button>
            </div>
        </ClaimShell>
    );
}
