import { useMemo, useState } from 'react';
import { App, Button, Checkbox, DatePicker, Input, Radio, Select } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import {
    DEFAULT_LETTER_FORM,
    INSTRUCTIONS_LIMIT,
    LETTER_TYPE_OPTIONS,
    PRIORITY_OPTIONS,
    REASON_OPTIONS,
    REMARKS_LIMIT,
    REQUESTING_ON_OPTIONS,
    REQUIREMENTS_BY_LETTER_TYPE,
    SEND_VIA_CHANNELS,
    buildLetterBody,
} from '../../data/letterData.js';
import { CLAIM_SUMMARY, CLAIM_SUMMARY_GRID } from '../../data/claimData.js';
import LetterPreview from '../../components/letters/LetterPreview.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import cn from '../../utils/cn.js';

const { TextArea } = Input;
const DATE_FORMAT = 'DD MMM YYYY';

function Label({ children }) {
    return <span className="mb-1.5 block text-[11.5px] font-medium text-[#1668e3]">{children}</span>;
}

const initialForm = () => ({
    ...DEFAULT_LETTER_FORM,
    issueDate: dayjs(DEFAULT_LETTER_FORM.issueDate),
    responseDueBy: dayjs(DEFAULT_LETTER_FORM.responseDueBy),
});

const initialRequirements = (letterType) =>
    REQUIREMENTS_BY_LETTER_TYPE[letterType].map((item) => ({ ...item }));

export default function IssueLetterPage() {
    const { message } = App.useApp();

    const [form, setForm] = useState(initialForm);
    const [requirements, setRequirements] = useState(() =>
        initialRequirements(DEFAULT_LETTER_FORM.letterType)
    );
    const [channel, setChannel] = useState('email');
    const [contact, setContact] = useState({ mobile: '+91 1234567890', email: 'Amit.Verma@Gmail.Com' });

    const handleChange = (name, value) => {
        setForm((prev) => {
            const next = { ...prev, [name]: value };
            // Moving the issue date keeps the agreed response window intact.
            if (name === 'issueDate') {
                next.responseDueBy = value.add(prev.responseDueBy.diff(prev.issueDate, 'day'), 'day');
            }
            return next;
        });
        // Each letter type asks for its own set of documents / details.
        if (name === 'letterType') setRequirements(initialRequirements(value));
    };

    const toggleRequirement = (key) =>
        setRequirements((list) =>
            list.map((item) => (item.key === key ? { ...item, checked: !item.checked } : item))
        );

    const addRequirement = () => {
        const label = window.prompt('New requirement');
        if (!label?.trim()) return;
        setRequirements((list) => [...list, { key: `custom-${Date.now()}`, label: label.trim(), checked: true }]);
    };

    const letter = useMemo(
        () =>
            buildLetterBody({
                claim: CLAIM_SUMMARY,
                form: { ...form, responseDueBy: form.responseDueBy.format(DATE_FORMAT) },
                requirements,
            }),
        [form, requirements]
    );

    const dueDays = Math.max(0, form.responseDueBy.diff(form.issueDate, 'day'));

    const generate = () => {
        if (!letter.items.length) {
            message.warning('Select at least one document / detail to request');
            return;
        }
        message.success(`Letter generated and queued for ${channel.toUpperCase()}`);
    };

    return (
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
            <div className="flex flex-col gap-5">
                <SectionCard step={1} title="Letter Details">
                    <Label>Letter Type</Label>
                    <Radio.Group
                        value={form.letterType}
                        onChange={(event) => handleChange('letterType', event.target.value)}
                        className="mb-4 flex flex-wrap gap-x-8 gap-y-2"
                    >
                        {LETTER_TYPE_OPTIONS.map((option) => (
                            <Radio key={option.value} value={option.value} className="!mr-0 text-[12px]">
                                {option.label}
                            </Radio>
                        ))}
                    </Radio.Group>

                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        <div>
                            <Label>Requesting On</Label>
                            <Select
                                className="w-full"
                                value={form.requestingOn}
                                options={REQUESTING_ON_OPTIONS}
                                onChange={(value) => handleChange('requestingOn', value)}
                            />
                        </div>
                        <div>
                            <Label>Priorty</Label>
                            <Select
                                className="w-full"
                                value={form.priority}
                                options={PRIORITY_OPTIONS}
                                onChange={(value) => handleChange('priority', value)}
                            />
                        </div>
                        <div>
                            <Label>Issue Date</Label>
                            <DatePicker
                                allowClear={false}
                                className="w-full"
                                format={DATE_FORMAT}
                                value={form.issueDate}
                                onChange={(value) => handleChange('issueDate', value)}
                            />
                        </div>
                        <div>
                            <Label>Response Due By</Label>
                            <DatePicker
                                allowClear={false}
                                className="w-full"
                                format={DATE_FORMAT}
                                value={form.responseDueBy}
                                onChange={(value) => handleChange('responseDueBy', value)}
                            />
                            <p className="mt-1.5 mb-0 text-[10.5px] text-slate-600">
                                {dueDays} Days From Issue Date
                            </p>
                        </div>
                    </div>
                </SectionCard>

                <SectionCard step={2} title="Reason For Letter">
                    <Label>Select Reason</Label>
                    <Select
                        className="mb-4 w-full"
                        value={form.reason}
                        options={REASON_OPTIONS}
                        onChange={(value) => handleChange('reason', value)}
                    />

                    <Label>Remarks (Optional)</Label>
                    <TextArea
                        rows={3}
                        maxLength={REMARKS_LIMIT}
                        value={form.remarks}
                        onChange={(event) => handleChange('remarks', event.target.value)}
                    />
                    <p className="mt-1.5 mb-0 text-[10.5px] text-slate-600">
                        {Math.max(0, REMARKS_LIMIT - form.remarks.length)} Characters Remaining
                    </p>
                </SectionCard>

                <SectionCard
                    step={3}
                    title="Documents / Details Requested"
                    action={
                        <Button type="primary" icon={<PlusOutlined />} onClick={addRequirement}>
                            Add Requirment
                        </Button>
                    }
                >
                    <div className="flex flex-col gap-3">
                        {requirements.map((item) => (
                            <Checkbox
                                key={item.key}
                                checked={item.checked}
                                onChange={() => toggleRequirement(item.key)}
                                className="!ml-0 text-[12px] font-semibold text-slate-800"
                            >
                                {item.label}
                            </Checkbox>
                        ))}
                    </div>

                    <div className="mt-6">
                        <Label>Additional Instructions (Optional)</Label>
                        <TextArea
                            rows={3}
                            maxLength={INSTRUCTIONS_LIMIT}
                            value={form.instructions}
                            onChange={(event) => handleChange('instructions', event.target.value)}
                        />
                        <p className="mt-1.5 mb-0 text-[10.5px] text-slate-600">
                            {Math.max(0, INSTRUCTIONS_LIMIT - form.instructions.length)} Characters Remaining
                        </p>
                    </div>

                    <div className="mt-5 flex flex-wrap justify-end gap-3">
                        <Button
                            className="!border-[#1450d8] !text-[#1450d8]"
                            onClick={() => {
                                setForm(initialForm());
                                setRequirements(initialRequirements(DEFAULT_LETTER_FORM.letterType));
                                message.info('Form cleared');
                            }}
                        >
                            Clear
                        </Button>
                        <Button type="primary" onClick={generate}>
                            Generate Letter
                        </Button>
                    </div>
                </SectionCard>
            </div>

            <div className="flex flex-col gap-5">
                <SectionCard step={4} title="Claim Summary">
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                        {CLAIM_SUMMARY_GRID.map((row) => (
                            <div key={row.key} className="flex items-start gap-3">
                                <dt className="w-[120px] shrink-0 text-[11.5px] font-semibold text-[#1668e3]">
                                    {row.label}
                                </dt>
                                <dd
                                    className={cn(
                                        'mb-0 text-[11.5px] font-semibold',
                                        row.highlight ? 'text-slate-900' : 'text-slate-800'
                                    )}
                                >
                                    {row.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </SectionCard>

                <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <header className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="mb-0 text-[13.5px] font-bold text-[#1450d8]">Letter Preview</h3>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={() => message.success('Letter downloaded')}
                        >
                            Download
                        </Button>
                    </header>

                    <LetterPreview
                        claim={CLAIM_SUMMARY}
                        letter={letter}
                        issueDate={form.issueDate.format(DATE_FORMAT)}
                        instructions={form.instructions}
                    />
                </section>

                <div>
                    <h3 className="mb-3 text-[15px] font-bold text-[#1450d8]">Letter will be sent via</h3>
                    <Radio.Group
                        value={channel}
                        onChange={(event) => setChannel(event.target.value)}
                        className="mb-5 flex flex-wrap gap-x-8 gap-y-2"
                    >
                        {SEND_VIA_CHANNELS.map((option) => (
                            <Radio key={option.key} value={option.key} className="!mr-0 text-[12.5px]">
                                {option.label}
                            </Radio>
                        ))}
                    </Radio.Group>

                    <h3 className="mb-3 text-[15px] font-bold text-[#1450d8]">Contact Details</h3>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        <div>
                            <Label>Mobile No</Label>
                            <Input
                                value={contact.mobile}
                                onChange={(event) =>
                                    setContact((prev) => ({ ...prev, mobile: event.target.value }))
                                }
                            />
                        </div>
                        <div>
                            <Label>Email ID</Label>
                            <Input
                                value={contact.email}
                                onChange={(event) =>
                                    setContact((prev) => ({ ...prev, email: event.target.value }))
                                }
                            />
                        </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                        <Button type="primary" onClick={generate}>
                            Generate Letter
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
