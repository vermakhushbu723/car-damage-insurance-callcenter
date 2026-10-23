import { App, Button, Checkbox, Input, Switch } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, ClockCircleFilled, CopyOutlined, ReloadOutlined } from '@ant-design/icons';
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

/** Survey-link dispatch block at the bottom of the intimation form. */
export default function LinkSection({ link, onChange, onSend, sending, onAutoReminder, onRefreshId, refreshingId }) {
    const { message } = App.useApp();
    const navigate = useNavigate();

    const copyLink = async () => {
        if (!link.url) return message.info('The link is created when you send it');
        try {
            await navigator.clipboard.writeText(link.url);
            message.success('Link copied');
        } catch {
            message.error('Could not copy the link');
        }
        return undefined;
    };

    const dispatch = link.dispatch;
    const tone = dispatch ? DISPATCH_TONES[dispatch.status] ?? DISPATCH_TONES.Pending : null;
    const ToneIcon = tone?.icon;

    return (
        <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
            <h3 className="mb-3 text-[13.5px] font-bold text-[#1450d8]">Link</h3>

            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
                <CheckboxField label="Whether Vehicle At Workshop?" name="vehicleAtWorkshop" options={YES_NO.map((o) => o.label)} link={link} onChange={onChange} />
                <CheckboxField label="Letter Dispatch" name="letterDispatch" options={['Issue Letters']} link={link} onChange={onChange} />
                <CheckboxField label="Dispatch Type" name="dispatchType" options={['Send Survey Link']} link={link} onChange={onChange} />
                <CheckboxField label="Survey Link Recipient" name="recipients" options={RECIPIENT_OPTIONS} link={link} onChange={onChange} />

                <div>
                    <Label>Recipient Mobile Number</Label>
                    <Input placeholder="+91 1234567890" value={link.mobile || ''} onChange={(e) => onChange('mobile', e.target.value)} />
                </div>
                <div>
                    <Label>Recipient Email</Label>
                    <Input placeholder="Rohit.Kumar@Gmail.Com" value={link.email || ''} onChange={(e) => onChange('email', e.target.value)} />
                </div>
                <div className="flex items-end gap-2">
                    <Button type="primary" onClick={() => navigate(ROUTES.communicationHistory)}>
                        Go To Communication Log
                    </Button>
                    {link.letterDispatch?.includes('Issue Letters') ? <Button onClick={() => navigate(ROUTES.issueLetter)}>Issue Letter</Button> : null}
                </div>

                <div className="sm:col-span-2 xl:col-span-4">
                    <CheckboxField label="Send Via" name="sendVia" options={SEND_VIA_OPTIONS} link={link} onChange={onChange} />
                </div>

                <div className="sm:col-span-2 xl:col-span-2">
                    <Label>I-Bima Assist Unique ID</Label>
                    <Input
                        readOnly
                        value={link.uniqueId || ''}
                        placeholder="Issued when the intimation is saved"
                        suffix={
                            <ReloadOutlined
                                spin={refreshingId}
                                onClick={onRefreshId}
                                title={link.sentAt ? 'Fixed once the link is sent' : 'Issue a new ID'}
                                className="cursor-pointer text-[#1450d8]"
                            />
                        }
                    />
                </div>
                <div className="hidden xl:col-span-2 xl:block" />

                <div className="sm:col-span-2">
                    <Label>Generate Link Preview</Label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Input
                            readOnly
                            value={link.url || ''}
                            placeholder="The survey link is generated when you send it"
                            suffix={<CopyOutlined onClick={copyLink} className="cursor-pointer text-[#1450d8]" />}
                        />
                        <Button type="primary" loading={sending} onClick={onSend} className="sm:w-[120px]">
                            {link.url ? 'Resend Link' : 'Send Link'}
                        </Button>
                    </div>
                </div>

                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <Label tone="dark">Dispact Status</Label>
                    </div>
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
        </section>
    );
}
