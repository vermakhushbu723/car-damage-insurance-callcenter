import { useEffect, useMemo, useState } from 'react';
import { App, Button, Checkbox, DatePicker, Input, Modal, Radio, Select } from 'antd';
import { DownloadOutlined, FilePdfOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import {
    INSTRUCTIONS_LIMIT,
    LETTER_TYPE_OPTIONS,
    PRIORITY_OPTIONS,
    REASON_OPTIONS,
    REMARKS_LIMIT,
    REQUESTING_ON_OPTIONS,
    REQUIREMENTS_BY_LETTER_TYPE,
    SEND_VIA_CHANNELS,
    buildLetterBody,
    defaultLetterForm,
} from '../../data/letterData.js';
import LetterPreview from '../../components/letters/LetterPreview.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import { NoClaim } from '../../components/claim/ClaimShell.jsx';
import ClaimPicker from '../../components/claim/ClaimPicker.jsx';
import { api, download } from '../../api/client.js';
import { useAppState } from '../../context/AppContext.jsx';
import { MODULES } from '../../constants/navigation.js';
import { errText, fmtDate, fmtDateTime } from '../../utils/format.js';
import cn from '../../utils/cn.js';

const { TextArea } = Input;
const DATE_FORMAT = 'DD MMM YYYY';

function Label({ children }) {
    return <span className="mb-1.5 block text-[11.5px] font-medium text-[#1668e3]">{children}</span>;
}

const initialRequirements = (letterType) => REQUIREMENTS_BY_LETTER_TYPE[letterType].map((item) => ({ ...item }));

export default function IssueLetterPage() {
    const { message } = App.useApp();
    const { claim, can } = useAppState();

    const [form, setForm] = useState(() => defaultLetterForm(dayjs().startOf('day')));
    const [requirements, setRequirements] = useState(() => initialRequirements('vehicle-not-in-workshop'));
    const [channels, setChannels] = useState(() => SEND_VIA_CHANNELS.filter((c) => c.checked).map((c) => c.key));
    const [contact, setContact] = useState({ mobile: '', email: '' });
    const [info, setInfo] = useState(null);
    const [lastLetter, setLastLetter] = useState(null);
    const [busy, setBusy] = useState(null);
    const [newReq, setNewReq] = useState(null);

    const load = () =>
        claim &&
        api
            .get(`/claims/${claim.id}/letters`)
            .then((d) => {
                setInfo(d);
                setContact((c) => ({ mobile: c.mobile || d.contact.mobile, email: c.email || d.contact.email }));
            })
            .catch((err) => message.error(errText(err)));

    useEffect(() => {
        setContact({ mobile: '', email: '' });
        setLastLetter(null);
        load();
    }, [claim?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = (name, value) => {
        setForm((prev) => {
            const next = { ...prev, [name]: value };
            // Moving the issue date keeps the agreed response window intact.
            if (name === 'issueDate') next.responseDueBy = value.add(prev.responseDueBy.diff(prev.issueDate, 'day'), 'day');
            return next;
        });
        if (name === 'letterType') setRequirements(initialRequirements(value));
    };

    const toggleRequirement = (key) => setRequirements((list) => list.map((item) => (item.key === key ? { ...item, checked: !item.checked } : item)));

    const addRequirement = () => {
        const label = newReq?.trim();
        if (!label) return;
        setRequirements((list) => [...list, { key: `custom-${Date.now()}`, label, checked: true }]);
        setNewReq(null);
    };

    const letterClaim = useMemo(
        () => ({
            claimId: claim?.claimNo ?? '',
            intimationDate: claim?.submittedAt ? fmtDateTime(claim.submittedAt) : fmtDateTime(claim?.createdAt),
            insuredName: claim?.insuredName ?? '',
            vehicleNo: claim?.vehicleNo ?? '',
        }),
        [claim]
    );

    const letter = useMemo(
        () => buildLetterBody({ claim: letterClaim, form: { ...form, responseDueBy: form.responseDueBy.format(DATE_FORMAT) }, requirements }),
        [letterClaim, form, requirements]
    );

    if (!claim) return <NoClaim />;

    const dueDays = Math.max(0, form.responseDueBy.diff(form.issueDate, 'day'));
    const body = () => ({
        form: {
            ...form,
            issueDate: form.issueDate.format('YYYY-MM-DD'),
            responseDueBy: form.responseDueBy.format('YYYY-MM-DD'),
        },
        requirements: requirements.map(({ label, checked }) => ({ label, checked })),
        channels,
        contact,
    });

    const generate = async () => {
        if (!letter.items.length) return message.warning('Select at least one document / detail to request');
        if (!channels.length) return message.warning('Choose how the letter is sent (SMS / Email / WhatsApp)');
        setBusy('generate');
        try {
            const res = await api.post(`/claims/${claim.id}/letters`, body());
            setLastLetter(res.letter);
            const s = res.delivery.status;
            if (s === 'Delivered' && !res.delivery.error) message.success(`Letter ${res.letter.id} sent by ${res.letter.channel}`);
            else if (s === 'Delivered') message.warning(`Letter ${res.letter.id} sent, but one channel failed: ${res.delivery.error}`);
            else if (s === 'Pending') message.warning(`Letter ${res.letter.id} issued -- no message gateway is configured, so it was not delivered.`);
            else message.error(`Letter ${res.letter.id} issued but sending failed: ${res.delivery.error}`);
            load();
        } catch (err) {
            message.error(errText(err));
        } finally {
            setBusy(null);
        }
        return undefined;
    };

    const downloadLetter = async () => {
        setBusy('download');
        try {
            if (lastLetter) await download(`/claims/${claim.id}/letters/${lastLetter.id}/pdf`, `${lastLetter.id}.pdf`);
            else await download(`/claims/${claim.id}/letters/preview.pdf`, `Letter-${claim.claimNo}-draft.pdf`, { method: 'POST', body: body() });
            message.success('Letter downloaded');
        } catch (err) {
            message.error(errText(err));
        } finally {
            setBusy(null);
        }
    };

    const canCreate = can(MODULES.letters, 'create') && claim.status !== 'Draft';
    const summaryGrid = [
        { key: 'claimId', label: 'Claim ID', value: claim.claimNo, highlight: true },
        { key: 'intimationDate', label: 'Intimation Date', value: fmtDateTime(claim.submittedAt) },
        { key: 'insuredName', label: 'Insured Name', value: claim.insuredName || '—' },
        { key: 'claimType', label: 'Claim Type', value: claim.claimType || '—' },
        { key: 'policyNumber', label: 'Policy Number', value: claim.policyNo || '—' },
        { key: 'intimatedBy', label: 'Intimated By', value: claim.intimatedBy || '—' },
        { key: 'vehicleNo', label: 'Vehicle Number', value: claim.vehicleNo || '—' },
        { key: 'mobileNo', label: 'Contact No', value: claim.mobile || '—' },
    ];

    const generateButton = (
        <Button type="primary" loading={busy === 'generate'} disabled={!canCreate} onClick={generate}>
            Generate Letter
        </Button>
    );

    return (
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
            <div className="flex items-center justify-between gap-3 xl:col-span-2">
                <h1 className="mb-0 text-[20px] leading-7 font-bold text-[#1450d8]">Issue Letter</h1>
                <ClaimPicker />
            </div>
            <div className="flex flex-col gap-5">
                <SectionCard step={1} title="Letter Details">
                    <Label>Letter Type</Label>
                    <Radio.Group value={form.letterType} onChange={(event) => handleChange('letterType', event.target.value)} className="mb-4 flex flex-wrap gap-x-8 gap-y-2">
                        {LETTER_TYPE_OPTIONS.map((option) => (
                            <Radio key={option.value} value={option.value} className="!mr-0 text-[12px]">
                                {option.label}
                            </Radio>
                        ))}
                    </Radio.Group>

                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        <div>
                            <Label>Requesting On</Label>
                            <Select className="w-full" value={form.requestingOn} options={REQUESTING_ON_OPTIONS} onChange={(value) => handleChange('requestingOn', value)} />
                        </div>
                        <div>
                            <Label>Priorty</Label>
                            <Select className="w-full" value={form.priority} options={PRIORITY_OPTIONS} onChange={(value) => handleChange('priority', value)} />
                        </div>
                        <div>
                            <Label>Issue Date</Label>
                            <DatePicker allowClear={false} className="w-full" format={DATE_FORMAT} value={form.issueDate} onChange={(value) => handleChange('issueDate', value)} />
                        </div>
                        <div>
                            <Label>Response Due By</Label>
                            <DatePicker
                                allowClear={false}
                                className="w-full"
                                format={DATE_FORMAT}
                                value={form.responseDueBy}
                                disabledDate={(d) => d.isBefore(form.issueDate, 'day')}
                                onChange={(value) => handleChange('responseDueBy', value)}
                            />
                            <p className="mt-1.5 mb-0 text-[10.5px] text-slate-600">{dueDays} Days From Issue Date</p>
                        </div>
                    </div>
                </SectionCard>

                <SectionCard step={2} title="Reason For Letter">
                    <Label>Select Reason</Label>
                    <Select className="mb-4 w-full" value={form.reason} options={REASON_OPTIONS} onChange={(value) => handleChange('reason', value)} />
                    <Label>Remarks (Optional)</Label>
                    <TextArea rows={3} maxLength={REMARKS_LIMIT} value={form.remarks} onChange={(event) => handleChange('remarks', event.target.value)} />
                    <p className="mt-1.5 mb-0 text-[10.5px] text-slate-600">{Math.max(0, REMARKS_LIMIT - form.remarks.length)} Characters Remaining</p>
                </SectionCard>

                <SectionCard
                    step={3}
                    title="Documents / Details Requested"
                    action={
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setNewReq('')}>
                            Add Requirment
                        </Button>
                    }
                >
                    <div className="flex flex-col gap-3">
                        {requirements.map((item) => (
                            <Checkbox key={item.key} checked={item.checked} onChange={() => toggleRequirement(item.key)} className="!ml-0 text-[12px] font-semibold text-slate-800">
                                {item.label}
                            </Checkbox>
                        ))}
                    </div>

                    <div className="mt-6">
                        <Label>Additional Instructions (Optional)</Label>
                        <TextArea rows={3} maxLength={INSTRUCTIONS_LIMIT} value={form.instructions} onChange={(event) => handleChange('instructions', event.target.value)} />
                        <p className="mt-1.5 mb-0 text-[10.5px] text-slate-600">{Math.max(0, INSTRUCTIONS_LIMIT - form.instructions.length)} Characters Remaining</p>
                    </div>

                    <div className="mt-5 flex flex-wrap justify-end gap-3">
                        <Button
                            className="!border-[#1450d8] !text-[#1450d8]"
                            onClick={() => {
                                setForm(defaultLetterForm(dayjs().startOf('day')));
                                setRequirements(initialRequirements('vehicle-not-in-workshop'));
                                setLastLetter(null);
                                message.info('Form cleared');
                            }}
                        >
                            Clear
                        </Button>
                        {generateButton}
                    </div>
                </SectionCard>
            </div>

            <div className="flex flex-col gap-5">
                <SectionCard step={4} title="Claim Summary">
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                        {summaryGrid.map((row) => (
                            <div key={row.key} className="flex items-start gap-3">
                                <dt className="w-[120px] shrink-0 text-[11.5px] font-semibold text-[#1668e3]">{row.label}</dt>
                                <dd className={cn('mb-0 text-[11.5px] font-semibold break-all', row.highlight ? 'text-slate-900' : 'text-slate-800')}>{row.value}</dd>
                            </div>
                        ))}
                    </dl>
                </SectionCard>

                <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <header className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="mb-0 text-[13.5px] font-bold text-[#1450d8]">Letter Preview</h3>
                        <Button type="primary" icon={<DownloadOutlined />} loading={busy === 'download'} onClick={downloadLetter}>
                            Download
                        </Button>
                    </header>

                    <LetterPreview
                        claim={letterClaim}
                        letter={letter}
                        letterNo={lastLetter?.id ?? info?.nextLetterNo ?? '—'}
                        issueDate={form.issueDate.format(DATE_FORMAT)}
                        instructions={form.instructions}
                    />
                </section>

                <div>
                    <h3 className="mb-3 text-[15px] font-bold text-[#1450d8]">Letter will be sent via</h3>
                    <Checkbox.Group value={channels} onChange={setChannels} className="mb-5 flex flex-wrap gap-x-8 gap-y-2">
                        {SEND_VIA_CHANNELS.map((option) => (
                            <Checkbox key={option.key} value={option.key} className="!ml-0 text-[12.5px]">
                                {option.label}
                            </Checkbox>
                        ))}
                    </Checkbox.Group>

                    <h3 className="mb-3 text-[15px] font-bold text-[#1450d8]">Contact Details</h3>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        <div>
                            <Label>Mobile No</Label>
                            <Input value={contact.mobile} onChange={(event) => setContact((prev) => ({ ...prev, mobile: event.target.value }))} />
                        </div>
                        <div>
                            <Label>Email ID</Label>
                            <Input value={contact.email} onChange={(event) => setContact((prev) => ({ ...prev, email: event.target.value }))} />
                        </div>
                    </div>
                    {info && !info.gatewayConfigured ? (
                        <p className="mt-2 mb-0 text-[10.5px] text-amber-600">No message gateway is configured on the server: letters are issued and logged, not delivered.</p>
                    ) : null}

                    <div className="mt-5 flex justify-end">{generateButton}</div>
                </div>

                {info?.history?.length ? (
                    <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                        <h3 className="mb-3 text-[13.5px] font-bold text-slate-900">Letters Issued ({info.history.length})</h3>
                        <div className="flex flex-col gap-2">
                            {info.history.map((l) => (
                                <div key={l.id} className="flex items-center justify-between gap-3 text-[11.5px]">
                                    <span>
                                        <span className="font-semibold text-[#1450d8]">{l.id}</span> · {l.letterType} · {l.channel} ({l.status}) · due {fmtDate(l.responseDueBy)}
                                        <span className="block text-[10.5px] text-slate-500">
                                            {l.createdBy} · {fmtDateTime(l.createdAt)}
                                        </span>
                                    </span>
                                    <Button size="small" icon={<FilePdfOutlined />} onClick={() => download(`/claims/${claim.id}/letters/${l.id}/pdf`, `${l.id}.pdf`).catch((err) => message.error(errText(err)))} />
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null}
            </div>

            <Modal title="Add Requirment" open={newReq !== null} onCancel={() => setNewReq(null)} onOk={addRequirement} okButtonProps={{ disabled: !newReq?.trim() }}>
                <Input autoFocus value={newReq ?? ''} maxLength={150} placeholder="e.g. Repair estimate from workshop" onChange={(e) => setNewReq(e.target.value)} onPressEnter={addRequirement} />
            </Modal>
        </div>
    );
}
