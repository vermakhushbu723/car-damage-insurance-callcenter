import { useEffect, useState } from 'react';
import { App, Button, Input, InputNumber, Spin } from 'antd';
import { DownloadOutlined, FileTextOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { GST_RATE, REMARK_LIMIT } from '../../data/paybillData.js';
import ClaimShell from '../../components/claim/ClaimShell.jsx';
import { api, download, fileUrl } from '../../api/client.js';
import { useAppState } from '../../context/AppContext.jsx';
import { MODULES } from '../../constants/navigation.js';
import ROUTES from '../../constants/routes.js';
import { errText, fmtDateTime, money } from '../../utils/format.js';
import cn from '../../utils/cn.js';

const { TextArea } = Input;

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
    const navigate = useNavigate();
    const { claim, reloadClaim, user, can } = useAppState();
    const [data, setData] = useState(null);
    const [lines, setLines] = useState([]);
    const [mode, setMode] = useState('manual');
    const [remark, setRemark] = useState('');
    const [busy, setBusy] = useState(null);

    const base = claim ? `/claims/${claim.id}/paybill` : null;

    const apply = (d) => {
        setData(d);
        setLines(d.lines);
        setMode(d.mode);
        setRemark(d.remark);
    };

    useEffect(() => {
        if (!base || claim?.status === 'Draft') return;
        api.get(base)
            .then(apply)
            .catch((err) => message.error(errText(err)));
    }, [base, claim?.status, message]);

    const canEdit = can(MODULES.paybill, 'edit') && claim?.status !== 'Draft';

    const update = (key, field, value) => setLines((list) => list.map((line) => (line.key === key ? { ...line, [field]: value ?? 0 } : line)));

    const subTotal = lines.reduce((sum, line) => sum + line.rate * line.qty, 0);
    const gst = subTotal * GST_RATE;
    const total = subTotal + gst;
    const body = () => ({ lines: lines.map(({ key, rate, qty }) => ({ key, rate, qty })), mode, remark });

    const save = async () => {
        setBusy('save');
        try {
            apply(await api.put(base, body()));
            message.success('Saved as draft');
        } catch (err) {
            message.error(errText(err));
        } finally {
            setBusy(null);
        }
    };

    const switchMode = async (next) => {
        setMode(next);
        if (next === 'auto') {
            try {
                apply(await api.put(base, { ...body(), mode: 'auto' }));
                message.info('Standard fee schedule applied');
            } catch (err) {
                message.error(errText(err));
            }
        }
    };

    const generate = async () => {
        setBusy('pdf');
        try {
            await api.put(base, body());
            await download(`${base}/pdf`, `Paybill-${claim.claimNo}.pdf`, { method: 'POST', body: body() });
            message.success(`Paybill PDF generated · ₹${money(total)}`);
            apply(await api.get(base));
            reloadClaim();
        } catch (err) {
            message.error(errText(err));
        } finally {
            setBusy(null);
        }
    };

    if (claim?.status === 'Draft') {
        return (
            <ClaimShell title="Survey Paybill" subtitle="Review, Verify And Process Surveyor Payments" stage="survey-paybill">
                <p className="text-[12px] text-slate-600">Submit the intimation first.</p>
            </ClaimShell>
        );
    }

    return (
        <ClaimShell
            title="Survey Paybill"
            subtitle="Review, Verify And Process Surveyor Payments"
            stage="survey-paybill"
            onNext={() => navigate(can(MODULES.letters) ? ROUTES.issueLetter : ROUTES.dashboard)}
        >
            {!data ? (
                <Spin className="!py-10" />
            ) : (
                <>
                    {!data.assigned ? (
                        <p className="mb-0 rounded-lg bg-amber-50 px-4 py-2 text-[11.5px] text-amber-700">
                            No surveyor is assigned to this claim yet -- assign one in Surveyor Assignment first.
                        </p>
                    ) : null}
                    {data.generatedAt ? (
                        <p className="mb-0 rounded-lg bg-emerald-50 px-4 py-2 text-[11.5px] text-emerald-700">Bill generated {fmtDateTime(data.generatedAt)}.</p>
                    ) : null}

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                        <section className="rounded-xl border border-slate-200 bg-white px-5 py-5">
                            <h3 className="mb-4 text-[14.5px] font-bold text-slate-900">Survey Details</h3>
                            {data.survey.length ? <DetailGrid rows={data.survey} /> : <p className="mb-0 text-[11.5px] text-slate-500">—</p>}
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white px-5 py-5">
                            <h3 className="mb-4 text-[14.5px] font-bold text-slate-900">Bill Details</h3>
                            <DetailGrid rows={data.bill.map((b) => (b.key === 'billTo' && b.value === '—' ? { ...b, value: user?.organization ?? '—' } : b))} columns={3} />
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
                                                disabled={mode === 'auto' || !canEdit}
                                                className="w-[120px] text-center"
                                                formatter={(value) => money(Number(value || 0))}
                                                parser={(value) => Number(String(value).replace(/[^\d.]/g, ''))}
                                                onChange={(value) => update(line.key, 'rate', value)}
                                            />
                                        </span>
                                        <span className="flex justify-center text-center text-[12px] text-slate-800">
                                            {line.key === 'distance' ? (
                                                <InputNumber
                                                    value={line.qty}
                                                    min={0}
                                                    disabled={!canEdit}
                                                    suffix="Kms"
                                                    className="w-[110px]"
                                                    onChange={(value) => update(line.key, 'qty', value)}
                                                />
                                            ) : (
                                                line.basis
                                            )}
                                        </span>
                                        <span className="text-right text-[12px] text-slate-800">{money(line.rate * line.qty)}</span>
                                    </div>
                                ))}

                                <div className="mt-4 flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-start">
                                    <div className="flex gap-3">
                                        <Button disabled={!canEdit} onClick={() => switchMode('auto')} className={cn(mode === 'auto' && '!border-[#1450d8] !text-[#1450d8]')}>
                                            Auto
                                        </Button>
                                        <Button type={mode === 'manual' ? 'primary' : 'default'} disabled={!canEdit} onClick={() => switchMode('manual')}>
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
                            <DetailGrid rows={data.bank} columns={3} />
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white px-5 py-5">
                            <TextArea
                                value={remark}
                                rows={4}
                                maxLength={REMARK_LIMIT}
                                disabled={!canEdit}
                                placeholder="Remarks for this bill"
                                onChange={(event) => setRemark(event.target.value)}
                                className="!bg-white !text-[12.5px] !font-semibold"
                            />
                            <p className="mt-2 mb-0 text-[11.5px] text-slate-600">
                                {remark.length}/{REMARK_LIMIT}
                            </p>
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white px-5 py-5">
                            <h3 className="mb-4 text-[14.5px] font-bold text-slate-900">Documents</h3>
                            {data.documents.length ? (
                                data.documents.map((doc) => (
                                    <div key={doc.id} className="mb-2 flex flex-wrap items-center gap-3">
                                        <FileTextOutlined className="text-[14px] text-slate-500" />
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-[13px] font-semibold text-slate-900">{doc.name}</span>
                                            <span className="block text-[11px] text-slate-500">Uploaded On {fmtDateTime(doc.uploadedAt)}</span>
                                        </span>
                                        <Button type="primary" href={fileUrl(doc.url)} target="_blank">
                                            View
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="mb-0 text-[11.5px] text-slate-500">
                                    No surveyor report yet. Upload it in Documents DMS as &quot;Surveyor Report&quot;.
                                </p>
                            )}
                        </section>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button icon={<SaveOutlined />} loading={busy === 'save'} disabled={!canEdit} onClick={save}>
                            Save As Draft
                        </Button>
                        <Button type="primary" icon={<DownloadOutlined />} loading={busy === 'pdf'} disabled={!canEdit || !data.assigned} onClick={generate}>
                            Generate PDF
                        </Button>
                    </div>
                </>
            )}
        </ClaimShell>
    );
}
