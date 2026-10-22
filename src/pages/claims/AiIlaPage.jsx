import { useCallback, useEffect, useRef, useState } from 'react';
import { App, Form, Input, InputNumber, Modal, Select, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';

import { ACTION_OPTIONS, DAMAGE_TYPE_OPTIONS, SEVERITY_OPTIONS, formatINR } from '../../data/ilaData.js';
import ClaimShell from '../../components/claim/ClaimShell.jsx';
import AiAnalysisCard from '../../components/ila/AiAnalysisCard.jsx';
import SurveyThumbnails from '../../components/ila/SurveyThumbnails.jsx';
import AiInsightsCard from '../../components/ila/AiInsightsCard.jsx';
import DetectedDamageTable from '../../components/ila/DetectedDamageTable.jsx';
import IlaSummaryCard from '../../components/ila/IlaSummaryCard.jsx';
import ModelFeedbackLoop from '../../components/ila/ModelFeedbackLoop.jsx';
import ReviewerToolkit from '../../components/ila/ReviewerToolkit.jsx';
import { api, download } from '../../api/client.js';
import { useAppState } from '../../context/AppContext.jsx';
import { MODULES } from '../../constants/navigation.js';
import ROUTES from '../../constants/routes.js';
import { errText } from '../../utils/format.js';

export default function AiIlaPage() {
    const { message, modal } = App.useApp();
    const navigate = useNavigate();
    const { claim, reloadClaim, can } = useAppState();
    const [data, setData] = useState(null);
    const [activeImage, setActiveImage] = useState(null);
    const [selected, setSelected] = useState([]);
    const [note, setNote] = useState('');
    const [noteSaved, setNoteSaved] = useState(true);
    const [busy, setBusy] = useState(null);
    const [editor, setEditor] = useState(null); // { mode: 'add' | 'annotation' | 'box', row? }
    const [form] = Form.useForm();
    const costTimers = useRef({});

    const base = claim ? `/claims/${claim.id}/ai-ila` : null;

    const apply = useCallback((next) => {
        setData(next);
        setNote(next.review.note);
        setNoteSaved(true);
        setSelected((sel) => sel.filter((id) => next.rows.some((r) => r.id === id)));
    }, []);

    useEffect(() => {
        if (!base) return;
        api.get(base)
            .then(apply)
            .catch((err) => message.error(errText(err)));
    }, [base, apply, message]);

    const call = async (key, fn, ok) => {
        setBusy(key);
        try {
            const next = await fn();
            if (next?.rows) apply(next);
            if (ok) message.success(typeof ok === 'function' ? ok(next) : ok);
            return next;
        } catch (err) {
            message.error(errText(err));
            return null;
        } finally {
            setBusy(null);
        }
    };

    const locked = data?.review.decision === 'Approved';
    const canEdit = can(MODULES.aiIla, 'edit') && claim?.status === 'Open' && !locked;

    const runAi = () => call('run', () => api.post(`${base}/run`), (n) => `AI found ${n.rows.length} damage(s)`).then(() => reloadClaim());

    const updateRow = (id, field, value) => {
        setData((d) => ({ ...d, rows: d.rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)) }));
        const send = () => api.patch(`${base}/items/${id}`, { [field]: value }).then(apply).catch((err) => {
            message.error(errText(err));
            api.get(base).then(apply);
        });
        if (field === 'cost') {
            clearTimeout(costTimers.current[id]);
            costTimers.current[id] = setTimeout(send, 600);
        } else send();
    };

    const selectedRows = () => data.rows.filter((r) => selected.includes(r.id));

    const onToolkit = (action) => {
        const rows = selectedRows();
        const one = () => {
            if (rows.length !== 1) {
                message.info('Select exactly one damage row (tick its box in the table)');
                return null;
            }
            return rows[0];
        };
        switch (action.key) {
            case 'add-damage':
                setEditor({ mode: 'add', init: { part: '', damageType: 'Dent', severity: 'Minor', action: 'Repair', cost: 0, documentId: activeImage ?? data.images[0]?.id } });
                break;
            case 'delete':
                if (!rows.length) return message.info('Select the damage rows to delete');
                modal.confirm({
                    title: `Delete ${rows.length} damage row(s)?`,
                    content: 'Deleted AI rows count as corrections for retraining.',
                    onOk: async () => {
                        for (const r of rows) await api.del(`${base}/items/${r.id}`);
                        apply(await api.get(base));
                        message.success('Deleted');
                    },
                });
                break;
            case 'edit-annotation': {
                const r = one();
                if (r) {
                    setEditor({ mode: 'annotation', row: r, init: { part: r.part } });
                }
                break;
            }
            case 'merge-damages':
                if (rows.length < 2) return message.info('Select two or more rows to merge');
                call('merge', () => api.post(`${base}/items/merge`, { ids: rows.map((r) => r.id) }), 'Damages merged');
                break;
            case 'repair-replace':
                if (!rows.length) return message.info('Select the rows to switch Repair / Replace');
                (async () => {
                    for (const r of rows) await api.patch(`${base}/items/${r.id}`, { action: r.action === 'Repair' ? 'Replace' : 'Repair' });
                    apply(await api.get(base));
                    message.success('Repair / Replace switched');
                })().catch((err) => message.error(errText(err)));
                break;
            case 'resize-box': {
                const r = one();
                if (r) {
                    if (!r.documentId) return message.info('This damage is not linked to a photo');
                    setEditor({ mode: 'box', row: r, init: r.box ?? { x: 10, y: 10, w: 30, h: 20 } });
                }
                break;
            }
            default:
                break;
        }
        return undefined;
    };

    const saveEditor = async () => {
        const v = await form.validateFields();
        const ok =
            editor.mode === 'add'
                ? await call('editor', () => api.post(`${base}/items`, { ...v, cost: Number(v.cost) || 0 }), 'Damage added')
                : editor.mode === 'annotation'
                  ? await call('editor', () => api.patch(`${base}/items/${editor.row.id}`, { part: v.part }), 'Annotation updated')
                  : await call('editor', () => api.patch(`${base}/items/${editor.row.id}`, { box: { x: v.x, y: v.y, w: v.w, h: v.h } }), 'Box resized');
        if (ok) setEditor(null);
    };

    const decide = (decision) =>
        modal.confirm({
            title: decision === 'Approved' ? 'Approve the AI assessment?' : 'Reject the AI assessment?',
            content:
                decision === 'Approved'
                    ? `The ${data.rows.length} reviewed rows become the claim's assessment and ${data.corrections} correction(s) go to AI retraining. Rows can no longer be changed.`
                    : 'The assessment stays open for rework.',
            onOk: async () => {
                const next = await call(decision, () => api.post(`${base}/decision`, { decision }), `AI assessment ${decision.toLowerCase()}`);
                if (next) {
                    await reloadClaim();
                    if (decision === 'Approved') navigate(ROUTES.handlerIla);
                }
            },
        });

    return (
        <ClaimShell title="AI ILA" subtitle="Assisted Assessment For Faster Claim Evaluation" stage="ai-ila">
            {!data ? (
                <Spin className="!py-10" />
            ) : (
                <>
                    {!data.ai.configured ? (
                        <p className="mb-0 rounded-lg bg-amber-50 px-4 py-2 text-[11.5px] text-amber-700">
                            AI service is not connected on the server -- add the damaged parts with <b>Add Damages</b> in the Reviewer Toolkit.
                        </p>
                    ) : data.ai.status === 'failed' ? (
                        <p className="mb-0 rounded-lg bg-red-50 px-4 py-2 text-[11.5px] text-red-600">Last AI run failed: {data.ai.error}</p>
                    ) : null}

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
                        <AiAnalysisCard
                            images={data.images}
                            rows={data.rows}
                            activeKey={activeImage}
                            ai={data.ai}
                            canRun={canEdit && data.ai.configured && data.images.length > 0}
                            running={busy === 'run'}
                            onRun={runAi}
                        />
                        <AiInsightsCard donuts={data.insights.donuts} rows={data.insights.rows} />
                    </div>

                    <SurveyThumbnails images={data.images} activeKey={activeImage} onSelect={setActiveImage} />

                    <DetectedDamageTable
                        rows={data.rows}
                        model={data.ai.model}
                        disabled={!canEdit}
                        selected={selected}
                        onSelect={setSelected}
                        onChange={updateRow}
                        onApproveAll={() => call('approve-all', () => api.post(`${base}/approve-all`), 'All detected damages approved')}
                        onExport={() => download(`${base}/export.csv`, `AI-ILA-${claim.claimNo}.csv`).catch((err) => message.error(errText(err)))}
                    />

                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                        <div className="w-full xl:w-[340px] xl:shrink-0">
                            <IlaSummaryCard
                                summary={data.summary}
                                generatedAt={data.review.reportGeneratedAt}
                                busy={busy}
                                onGenerate={() => call('report', () => api.post(`${base}/report`), `ILA report generated · ₹${formatINR(data.summary.total)}`)}
                                onDownload={async () => {
                                    setBusy('pdf');
                                    try {
                                        await download(`${base}/report.pdf`, `ILA-${claim.claimNo}.pdf`);
                                        message.success('Draft PDF downloaded');
                                    } catch (err) {
                                        message.error(errText(err));
                                    } finally {
                                        setBusy(null);
                                    }
                                }}
                            />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-4">
                            <ModelFeedbackLoop steps={data.feedback.steps} stats={data.feedback.stats} pipeline={data.feedback.pipeline} />
                            <ReviewerToolkit
                                note={note}
                                corrections={data.corrections}
                                saved={noteSaved}
                                disabled={!canEdit}
                                busy={busy}
                                decision={data.review.decision ? data.review : null}
                                onAction={onToolkit}
                                onNoteChange={(value) => {
                                    setNote(value);
                                    setNoteSaved(false);
                                }}
                                onSave={() => call('note', () => api.put(`${base}/note`, { note }), 'Review notes saved')}
                                onApprove={() => decide('Approved')}
                                onReject={() => decide('Rejected')}
                            />
                        </div>
                    </div>
                </>
            )}

            <Modal
                title={editor?.mode === 'add' ? 'Add Damage' : editor?.mode === 'annotation' ? 'Edit Annotation' : 'Resize Box (% of the photo)'}
                open={!!editor}
                onCancel={() => setEditor(null)}
                onOk={saveEditor}
                confirmLoading={busy === 'editor'}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" preserve={false} initialValues={editor?.init}>
                    {editor?.mode !== 'box' ? (
                        <Form.Item name="part" label="Vehicle Part" rules={[{ required: true, min: 2, message: 'Enter the part name' }]}>
                            <Input placeholder="Front Bumper" />
                        </Form.Item>
                    ) : null}
                    {editor?.mode === 'add' ? (
                        <>
                            <div className="grid grid-cols-2 gap-x-3">
                                <Form.Item name="damageType" label="Damage Type"><Select options={DAMAGE_TYPE_OPTIONS} /></Form.Item>
                                <Form.Item name="severity" label="Severity"><Select options={SEVERITY_OPTIONS} /></Form.Item>
                                <Form.Item name="action" label="Action"><Select options={ACTION_OPTIONS} /></Form.Item>
                                <Form.Item name="cost" label="Est. Cost (₹)" rules={[{ required: true }]}>
                                    <InputNumber min={0} className="!w-full" />
                                </Form.Item>
                            </div>
                            <Form.Item name="documentId" label="Seen On Photo">
                                <Select allowClear options={data?.images.map((i) => ({ label: i.name, value: i.id })) ?? []} placeholder="Not on a photo" />
                            </Form.Item>
                        </>
                    ) : null}
                    {editor?.mode === 'box' ? (
                        <div className="grid grid-cols-4 gap-x-3">
                            {['x', 'y', 'w', 'h'].map((k) => (
                                <Form.Item key={k} name={k} label={{ x: 'Left', y: 'Top', w: 'Width', h: 'Height' }[k]} rules={[{ required: true }]}>
                                    <InputNumber min={0} max={100} className="!w-full" />
                                </Form.Item>
                            ))}
                        </div>
                    ) : null}
                </Form>
            </Modal>
        </ClaimShell>
    );
}
