import { useCallback, useEffect, useState } from 'react';
import { App, Form, Input, Modal, Radio, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import { api, download, fileUrl } from '../../api/client.js';
import ROUTES from '../../constants/routes.js';
import { errText, fileSize, fmtDateTime } from '../../utils/format.js';

/** API row -> the row shape both communication tables render. */
export const toRow = (c) => ({
    ...c,
    key: c.id,
    dateTime: { date: dayjs(c.at).format('DD MMM YYYY'), time: dayjs(c.at).format('hh:mm A') },
    pending: c.awaitingResponse,
    attachment: c.attachment ? { name: c.attachment.name, size: fileSize(c.attachment.size), url: fileUrl(c.attachment.url) } : null,
});

export const COMMUNICATION_FILTERS = {
    all: () => true,
    sent: (row) => row.direction === 'sent',
    received: (row) => row.direction === 'received',
    pending: (row) => Boolean(row.pending),
};

/** Summary tiles (same keys / tones / icons as the designs). */
export const buildStats = (data) => [
    { key: 'letters-sent', title: 'Total Letters Sent', value: String(data?.counts.sent ?? 0).padStart(2, '0'), tone: 'violet', icon: 'file' },
    { key: 'responses', title: 'Total Responses Received', value: String(data?.counts.received ?? 0).padStart(2, '0'), tone: 'green', icon: 'mail' },
    { key: 'pending', title: 'Pending Responses', value: String(data?.counts.pending ?? 0).padStart(2, '0'), tone: 'amber', icon: 'clock' },
    { key: 'last-communication', title: 'Last Communication', value: data?.lastCommunication ? fmtDateTime(data.lastCommunication) : '—', tone: 'blue', icon: 'calendar', small: true },
];

/**
 * Communication History of the active claim + the Quick Actions
 * (Issue Letter, Send Email, Send SMS, Add Note / record a response).
 */
export default function useCommunications(claim) {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [compose, setCompose] = useState(null); // 'send-email' | 'send-sms' | 'add-note'
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();

    const reload = useCallback(() => {
        if (!claim?.id) return;
        api.get(`/claims/${claim.id}/communications`)
            .then(setData)
            .catch((err) => message.error(errText(err)));
    }, [claim?.id, message]);

    useEffect(() => {
        reload();
    }, [reload]);

    const onAction = (action) => {
        if (action.key === 'issue-letter') return navigate(ROUTES.issueLetter);
        form.resetFields();
        form.setFieldsValue({
            to: action.key === 'send-email' ? claim.insuredEmail ?? '' : claim.mobile ?? '',
            kind: 'note',
            fromRole: 'Insured',
            from: claim.insuredName ?? '',
            channel: 'Phone',
        });
        setCompose(action.key);
        return undefined;
    };

    const send = async () => {
        const v = await form.validateFields();
        const payload =
            compose === 'send-email'
                ? { kind: 'email', to: v.to, subject: v.subject, message: v.message, awaitResponse: true }
                : compose === 'send-sms'
                  ? { kind: 'sms', to: v.to, message: v.message }
                  : v.kind === 'response'
                    ? { kind: 'response', from: v.from, fromRole: v.fromRole, channel: v.channel, message: v.message, replyTo: v.replyTo }
                    : { kind: 'note', message: v.message };
        setSaving(true);
        try {
            const next = await api.post(`/claims/${claim.id}/communications`, payload);
            setData(next);
            const status = next.rows[0]?.status;
            if (status === 'Pending') message.warning('Logged -- no message gateway is configured, so it was not delivered.');
            else if (status === 'Failed') message.error('Sending failed (gateway error). It is logged as Failed.');
            else message.success(payload.kind === 'note' ? 'Note added' : payload.kind === 'response' ? 'Response recorded' : 'Sent');
            setCompose(null);
        } catch (err) {
            message.error(errText(err));
        } finally {
            setSaving(false);
        }
    };

    const exportCsv = () =>
        download(`/claims/${claim.id}/communications/export.csv`, `Communication-${claim.claimNo}.csv`)
            .then(() => message.success('History exported'))
            .catch((err) => message.error(errText(err)));

    const awaiting = (data?.rows ?? []).filter((r) => r.awaitingResponse);
    const kind = Form.useWatch('kind', form);

    const modal = (
        <Modal
            title={compose === 'send-email' ? 'Send Email' : compose === 'send-sms' ? 'Send SMS' : 'Add Note'}
            open={!!compose}
            onCancel={() => setCompose(null)}
            onOk={send}
            okText={compose === 'add-note' ? 'Save' : 'Send'}
            confirmLoading={saving}
            destroyOnHidden
            forceRender
        >
            <Form form={form} layout="vertical">
                {compose === 'add-note' ? (
                    <Form.Item name="kind">
                        <Radio.Group>
                            <Radio value="note">Internal note</Radio>
                            <Radio value="response">Response received</Radio>
                        </Radio.Group>
                    </Form.Item>
                ) : null}
                {compose === 'add-note' && kind === 'response' ? (
                    <div className="grid grid-cols-2 gap-x-3">
                        <Form.Item name="from" label="Received From" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="fromRole" label="Who">
                            <Select options={['Insured', 'Workshop', 'Surveyor', 'Other'].map((v) => ({ label: v, value: v }))} />
                        </Form.Item>
                        <Form.Item name="channel" label="Channel">
                            <Select options={['Phone', 'Email', 'SMS', 'WhatsApp', 'Portal'].map((v) => ({ label: v, value: v }))} />
                        </Form.Item>
                        <Form.Item name="replyTo" label="In Reply To">
                            <Select allowClear placeholder="—" options={awaiting.map((r) => ({ label: `${r.tag}${r.reference ? ` · ${r.reference}` : ''}`, value: r.id }))} />
                        </Form.Item>
                    </div>
                ) : null}
                {compose === 'send-email' || compose === 'send-sms' ? (
                    <Form.Item name="to" label={compose === 'send-email' ? 'To (email)' : 'To (mobile)'} rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                ) : null}
                {compose === 'send-email' ? (
                    <Form.Item name="subject" label="Subject">
                        <Input maxLength={150} placeholder={`Claim ${claim?.claimNo ?? ''}`} />
                    </Form.Item>
                ) : null}
                <Form.Item name="message" label="Message" rules={[{ required: true, message: 'Write the message' }]}>
                    <Input.TextArea rows={4} maxLength={compose === 'send-sms' ? 480 : 2000} showCount />
                </Form.Item>
            </Form>
        </Modal>
    );

    return { data, rows: (data?.rows ?? []).map(toRow), reload, onAction, exportCsv, modal };
}
