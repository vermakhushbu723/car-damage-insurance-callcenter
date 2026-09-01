import { App, Button, Checkbox, Input, Switch } from 'antd';
import { CheckCircleFilled, CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import ROUTES from '../../constants/routes.js';
import { YES_NO } from '../../config/intimationForm.js';

const RECIPIENT_OPTIONS = ['Workshop Contact', 'Insured', 'Both'];
const SEND_VIA_OPTIONS = ['SMS', 'Whats App', 'Email', 'All'];

function Label({ children, tone = 'blue' }) {
    return (
        <span
            className={
                tone === 'blue'
                    ? 'mb-1.5 block text-[11px] font-medium text-[#1668e3]'
                    : 'mb-1.5 block text-[11px] font-semibold text-slate-700'
            }
        >
            {children}
        </span>
    );
}

function CheckboxField({ label, name, options, values, onChange }) {
    return (
        <div>
            <Label>{label}</Label>
            <Checkbox.Group
                value={values[name] || []}
                onChange={(next) => onChange(name, next)}
                className="flex flex-wrap gap-x-5 gap-y-2 pt-1"
            >
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
export default function LinkSection({ values, onChange }) {
    const { message } = App.useApp();
    const navigate = useNavigate();

    const previewLink = values.linkPreview || 'Http://Api.Testsite.Dev/Home';

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(previewLink);
            message.success('Link copied');
        } catch {
            message.error('Could not copy the link');
        }
    };

    return (
        <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
            <h3 className="mb-3 text-[13.5px] font-bold text-[#1450d8]">Link</h3>

            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
                <CheckboxField
                    label="Whether Vehicle At Workshop?"
                    name="linkVehicleAtWorkshop"
                    options={YES_NO.map((option) => option.label)}
                    values={values}
                    onChange={onChange}
                />
                <CheckboxField
                    label="Letter Dispatch"
                    name="letterDispatch"
                    options={['Issue Letters']}
                    values={values}
                    onChange={onChange}
                />
                <CheckboxField
                    label="Dispatch Type"
                    name="dispatchType"
                    options={['Send Survey Link']}
                    values={values}
                    onChange={onChange}
                />
                <CheckboxField
                    label="Survey Link Recipient"
                    name="surveyRecipient"
                    options={RECIPIENT_OPTIONS}
                    values={values}
                    onChange={onChange}
                />

                <div>
                    <Label>Recipient Mobile Number</Label>
                    <Input
                        placeholder="+91 1234567890"
                        value={values.recipientMobile || ''}
                        onChange={(event) => onChange('recipientMobile', event.target.value)}
                    />
                </div>
                <div>
                    <Label>Recipient Email</Label>
                    <Input
                        placeholder="Rohit.Kumar@Gmail.Com"
                        value={values.recipientEmail || ''}
                        onChange={(event) => onChange('recipientEmail', event.target.value)}
                    />
                </div>
                <div className="flex items-end">
                    <Button type="primary" onClick={() => navigate(ROUTES.communicationHistory)}>
                        Go To Communication Log
                    </Button>
                </div>

                <div className="sm:col-span-2 xl:col-span-4">
                    <CheckboxField
                        label="Send Via"
                        name="sendVia"
                        options={SEND_VIA_OPTIONS}
                        values={values}
                        onChange={onChange}
                    />
                </div>

                <div className="sm:col-span-2">
                    <Label>Generate Link Preview</Label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Input
                            value={previewLink}
                            onChange={(event) => onChange('linkPreview', event.target.value)}
                            suffix={<CopyOutlined onClick={copyLink} className="cursor-pointer text-[#1450d8]" />}
                        />
                        <Button
                            type="primary"
                            onClick={() => message.success('Survey link sent')}
                            className="sm:w-[120px]"
                        >
                            Send Link
                        </Button>
                    </div>
                </div>

                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <Label tone="dark">Dispact Status</Label>
                        <ReloadOutlined className="text-[11px] text-slate-400" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-[#f3f5f9] px-3 py-2.5">
                        <span className="flex items-center gap-1.5 rounded-md bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            Sent <CheckCircleFilled className="text-[10.5px]" />
                        </span>
                        <span className="text-[10.5px] text-slate-500">Deliveried On 12 May 2025, 10:12 AM</span>
                    </div>
                </div>

                <div>
                    <Label tone="dark">Auto Reminder</Label>
                    <div className="flex items-center justify-between gap-2 rounded-lg bg-[#f3f5f9] px-3 py-2.5">
                        <span className="text-[10.5px] text-slate-600">Reminder In 2 Hours If No Response</span>
                        <Switch
                            size="small"
                            checked={Boolean(values.autoReminder)}
                            onChange={(checked) => onChange('autoReminder', checked)}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
