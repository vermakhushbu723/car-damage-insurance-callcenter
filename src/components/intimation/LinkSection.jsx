import { App, Button, Checkbox, Input, Switch } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, ClockCircleFilled, CopyOutlined, ExportOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import ROUTES from '../../constants/routes.js';
import { YES_NO } from '../../config/intimationForm.js';
import { fmtDateTime } from '../../utils/format.js';

const RECIPIENT_OPTIONS = ['Workshop Contact', 'Insured', 'Both'];
const SEND_VIA_OPTIONS = ['SMS', 'Whats App', 'Email', 'All'];

const DISPATCH_TONES = {
    Sent: { cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircleFilled, note: 'Delivered On' },
    Pending: { cls: 'bg-amber-100 text-amber-700', icon: ClockCircleFilled, note: 'Logged On (no gateway)' },
    Failed: { cls: 'bg-red-100 text-red-600', icon: CloseCircleFilled, note: 'Failed On' },
};

function Label({ children, tone = 'blue' }) {
    return (
        <span className={tone === 'blue' ? 'mb-1.5 block text-[11px] font-medium text-[#1668e3]' : 'mb-1.5 block text-[11px] font-semibold text-slate-700'}>
            {children}
        </span>
    );
}

function CheckboxField({ label, name, options, link, onChange }) {
    return (
        <div>
            <Label>{label}</Label>
            <Checkbox.Group value={link[name] || []} onChange={(next) => onChange(name, next)} className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                {options.map((option) => (
                    <Checkbox key={option} value={option} className="!ml-0 text-[11.5px]">
                        {option}
                    </Checkbox>
                ))}
            </Checkbox.Group>
        </div>
    );
}

/**
 * Survey-link dispatch block at the bottom of the intimation form, laid out as
 * the Figma intimation screen: Unique ID, then Link (preview, send via,
 * recipients, dispatch status / auto reminder) and Letter Dispatch.
 * The I-Bima Assist ID is the claim's own Assist Claim ID (one ID per claim).
 */
export default function LinkSection({ link, assistId, onChange, onGenerateId, generatingId, onGenerateLink, generatingLink, onSend, sending, onAutoReminder }) {
    const { message } = App.useApp();
    const navigate = useNavigate();

    const copy = async (text, what, emptyNote) => {
        if (!text) return message.info(emptyNote);
        try {
            await navigator.clipboard.writeText(text);
            message.success(`${what} copied`);
        } catch {
            message.error(`Could not copy the ${what.toLowerCase()}`);
        }
        return undefined;
    };
    const copyLink = () => copy(link.url, 'Link', 'Click Generate Link first');

    const dispatch = link.dispatch;
    const tone = dispatch ? DISPATCH_TONES[dispatch.status] ?? DISPATCH_TONES.Pending : null;
    const ToneIcon = tone?.icon;

    return (
        <section className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white px-4 py-4">
            <div>
                <h3 className="mb-2 text-[13.5px] font-bold text-[#1450d8]">I-Bima Assist Unique ID</h3>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Input
                        readOnly
                        className="sm:max-w-[460px]"
                        value={assistId || ''}
                        placeholder="Issued when the intimation is saved"
                        suffix={<CopyOutlined onClick={() => copy(assistId, 'ID', 'Click Save & Generate Unique Claim ID first')} title="Copy" className="cursor-pointer text-[#1450d8]" />}
                    />
                    <Button className="!border-[#1450d8] !font-semibold !text-[#1450d8]" loading={generatingId} disabled={!!assistId} onClick={onGenerateId}>
                        Save & Generate Unique Claim ID
                    </Button>
                </div>
            </div>

            <div>
                <h3 className="mb-3 text-[13.5px] font-bold text-[#1450d8]">Link</h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
                    <CheckboxField label="Whether Vehicle At Workshop?" name="vehicleAtWorkshop" options={YES_NO.map((o) => o.label)} link={link} onChange={onChange} />
                    <div className="sm:col-span-2">
                        <Label>Generate Link Preview</Label>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Input
                                readOnly
                                value={link.url || ''}
                                placeholder="Click Generate Link to create the survey link"
                                suffix={
                                    <span className="flex items-center gap-2">
                                        {link.url ? (
                                            <a href={link.url} target="_blank" rel="noreferrer" title="Open the survey web link" className="text-[#1450d8]">
                                                <ExportOutlined />
                                            </a>
                                        ) : null}
                                        <CopyOutlined onClick={copyLink} title="Copy" className="cursor-pointer text-[#1450d8]" />
                                    </span>
                                }
                            />
                            <Button type="primary" loading={generatingLink} onClick={onGenerateLink} className="sm:w-[120px]">
                                Generate Link
                            </Button>
                        </div>
                    </div>

                    <CheckboxField label="Send Via" name="sendVia" options={SEND_VIA_OPTIONS} link={link} onChange={onChange} />
                    <div>
                        <Label>Recipient Mobile Number</Label>
                        <Input placeholder="+91 1234567890" value={link.mobile || ''} onChange={(e) => onChange('mobile', e.target.value)} />
                    </div>
                    <div>
                        <Label>Recipient Email</Label>
                        <Input placeholder="Rohit.Kumar@Gmail.Com" value={link.email || ''} onChange={(e) => onChange('email', e.target.value)} />
                    </div>

                    <CheckboxField label="Dispatch Type" name="dispatchType" options={['Send Survey Link']} link={link} onChange={onChange} />
                    <CheckboxField label="Survey Link Recipient" name="recipients" options={RECIPIENT_OPTIONS} link={link} onChange={onChange} />
                    <div className="flex items-end">
                        <Button type="primary" size="large" block loading={sending} onClick={onSend}>
                            {link.sentAt ? 'Resend Link' : 'Send Link'}
                        </Button>
                    </div>

                    <div>
                        <Label tone="dark">Dispatch Status</Label>
                        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-[#f3f5f9] px-3 py-2.5">
                            {dispatch ? (
                                <>
                                    <span className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold ${tone.cls}`}>
                                        {dispatch.status} <ToneIcon className="text-[10.5px]" />
                                    </span>
                                    <span className="text-[10.5px] text-slate-500">
                                        {tone.note} {fmtDateTime(dispatch.at)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-[10.5px] text-slate-500">Not sent yet</span>
                            )}
                            {link.survey?.submittedAt ? (
                                <span className="w-full text-[10.5px] font-medium text-emerald-700">
                                    Survey submitted {fmtDateTime(link.survey.submittedAt)} · {link.survey.fileCount} file(s) in DMS
                                </span>
                            ) : link.accessedAt ? (
                                <span className="w-full text-[10.5px] text-slate-500">Link opened {fmtDateTime(link.accessedAt)}</span>
                            ) : null}
                        </div>
                    </div>
                    <div>
                        <Label tone="dark">Auto Reminder</Label>
                        <div className="flex items-center justify-between gap-2 rounded-lg bg-[#f3f5f9] px-3 py-2.5">
                            <span className="text-[10.5px] text-slate-600">
                                {link.reminderSentAt ? `Reminder sent ${fmtDateTime(link.reminderSentAt)}` : 'Reminder In 2 Hours If No Response'}
                            </span>
                            <Switch size="small" checked={Boolean(link.autoReminder)} onChange={onAutoReminder} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
                <CheckboxField label="Letter Dispatch" name="letterDispatch" options={['Issue Letters']} link={link} onChange={onChange} />
                <div className="flex flex-wrap items-end gap-2 sm:col-span-2">
                    <Button type="primary" onClick={() => navigate(ROUTES.communicationHistory)}>
                        Go To Communication Log
                    </Button>
                    {link.letterDispatch?.includes('Issue Letters') ? <Button onClick={() => navigate(ROUTES.issueLetter)}>Issue Letter</Button> : null}
                </div>
            </div>
        </section>
    );
}
