import { useEffect, useMemo, useRef, useState } from 'react';
import { App, Button, Spin } from 'antd';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
    INTIMATION_LEFT_SECTIONS,
    INTIMATION_META_FIELDS,
    INTIMATION_RIGHT_SECTIONS,
} from '../../config/intimationForm.js';
import ClaimShell from '../../components/claim/ClaimShell.jsx';
import FormSection from '../../components/intimation/FormSection.jsx';
import DynamicField from '../../components/intimation/DynamicField.jsx';
import LinkSection from '../../components/intimation/LinkSection.jsx';
import DmsDocumentsPanel from '../../components/intimation/DmsDocumentsPanel.jsx';
import { api } from '../../api/client.js';
import { useAppState } from '../../context/AppContext.jsx';
import { MODULES } from '../../constants/navigation.js';
import ROUTES from '../../constants/routes.js';
import { errText } from '../../utils/format.js';

/** name -> type of every field of the form config (dates / times travel as ISO strings). */
const FIELD_TYPES = Object.fromEntries(
    [...INTIMATION_META_FIELDS, ...INTIMATION_LEFT_SECTIONS, ...INTIMATION_RIGHT_SECTIONS]
        .flatMap((x) => (x.fields ? x.fields : [x]))
        .map((f) => [f.name, f.type])
);
const isMoment = (t) => t === 'date' || t === 'time';

const toForm = (intimation = {}) =>
    Object.fromEntries(Object.entries(intimation).map(([k, v]) => [k, isMoment(FIELD_TYPES[k]) && v ? dayjs(v) : v]));

const toApi = (values) =>
    Object.fromEntries(
        Object.entries(values)
            .filter(([, v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length))
            .map(([k, v]) => [k, dayjs.isDayjs(v) ? v.toISOString() : v])
    );

export default function IntimationPage() {
    const { message, modal } = App.useApp();
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const { user, can, claimId, claim, selectClaim, setClaim } = useAppState();

    // "?new=1" (Intimate New Claim) starts a blank form; the first save makes it a claim.
    const newParam = params.get('new') === '1';
    const [isNew, setIsNew] = useState(newParam);
    const loadedFor = useRef(null);
    useEffect(() => {
        if (newParam) {
            setIsNew(true);
            loadedFor.current = null;
        }
    }, [newParam]);
    const editing = isNew ? null : claim;
    const [values, setValues] = useState({});
    const [link, setLink] = useState({});
    const [nextId, setNextId] = useState(null);
    const [busy, setBusy] = useState(null);

    // Load the form of the claim being edited (or start blank).
    useEffect(() => {
        if (isNew || !claimId) {
            setValues({ intimationSource: 'Call Center', receivedBy: user?.name, intimationDateTime: dayjs() });
            setLink({});
            api.get('/claims/next-id').then(setNextId).catch(() => setNextId(null));
        }
    }, [isNew, claimId, user?.name]);

    // Load a claim's form once per claim -- never over what is being typed.
    useEffect(() => {
        if (!isNew && claim && loadedFor.current !== claim.id) {
            loadedFor.current = claim.id;
            setValues(toForm(claim.intimation));
            setLink(claim.link ?? {});
        }
    }, [isNew, claim?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const metaFields = useMemo(
        () =>
            INTIMATION_META_FIELDS.map((f) => {
                if (f.name === 'assistClaimId') return { ...f, value: editing?.id ?? nextId?.id ?? '—' };
                if (f.name === 'receivedBy') {
                    const names = [...new Set([user?.name, values.receivedBy].filter(Boolean))];
                    return { ...f, options: names.map((n) => ({ label: n, value: n })) };
                }
                return f;
            }),
        [editing?.id, nextId, user?.name, values.receivedBy]
    );

    const handleChange = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));
    const handleLinkChange = (name, value) => setLink((prev) => ({ ...prev, [name]: value }));

    const linkSettings = () => ({
        vehicleAtWorkshop: link.vehicleAtWorkshop ?? [],
        letterDispatch: link.letterDispatch ?? [],
        dispatchType: link.dispatchType ?? [],
        recipients: link.recipients ?? [],
        sendVia: link.sendVia ?? [],
        mobile: link.mobile ?? '',
        email: link.email ?? '',
        autoReminder: !!link.autoReminder,
    });

    /** Creates the draft (first time) or saves it; returns the claim. */
    const save = async () => {
        const body = { intimation: toApi(values), link: linkSettings() };
        const saved = editing ? await api.patch(`/claims/${editing.id}`, body) : await api.post('/claims', body);
        loadedFor.current = saved.id; // the form already shows what was saved
        selectClaim(saved.id, saved);
        if (isNew) {
            setIsNew(false);
            setParams({}, { replace: true });
        }
        return saved;
    };

    const run = async (key, fn) => {
        setBusy(key);
        try {
            await fn();
        } catch (err) {
            const missing = err.data?.missing;
            if (missing?.length) {
                modal.warning({ title: 'Fill the required fields', content: missing.join(', ') });
            } else message.error(errText(err));
        } finally {
            setBusy(null);
        }
    };

    const onSave = () =>
        run('save', async () => {
            const saved = await save();
            message.success(saved.status === 'Draft' ? `Saved as draft · ${saved.id}` : 'Intimation updated');
        });

    const onSubmit = () =>
        run('submit', async () => {
            if (editing && editing.status !== 'Draft') {
                await save();
                message.success('Intimation updated');
                return;
            }
            const draft = await save();
            const done = await api.post(`/claims/${draft.id}/submit`, { intimation: toApi(values) });
            setClaim(done);
            modal.success({
                title: `Claim ${done.claimNo} registered`,
                content: done.handlerName
                    ? `Allocated to ${done.handlerName} by the Admin allocation rule.`
                    : done.sync?.pushedToAdmin
                      ? 'No handler had capacity -- it is waiting in Pending Allocation.'
                      : `Saved. The Admin portal will receive it as soon as it is reachable (${done.sync?.error ?? 'queued'}).`,
            });
        });

    const onSendLink = () =>
        run('link', async () => {
            const saved = editing ?? (await save());
            const res = await api.post(`/claims/${saved.id}/survey-link`, linkSettings());
            setLink(res.link);
            setClaim(res.claim);
            const s = res.link.dispatch.status;
            if (s === 'Sent') message.success('Survey link sent');
            else if (s === 'Pending') message.warning('Link logged, but no message gateway is configured -- it was not delivered.');
            else message.error(`Sending failed: ${res.link.dispatch.results.map((r) => r.error).filter(Boolean)[0] ?? ''}`);
        });

    const onGenerateLink = () =>
        run('generate-link', async () => {
            const saved = editing ?? (await save());
            const res = await api.post(`/claims/${saved.id}/survey-link/generate`, linkSettings());
            setLink(res.link);
            setClaim(res.claim);
            message.success('Survey link generated');
        });

    const onAutoReminder = (checked) => {
        handleLinkChange('autoReminder', checked);
        if (editing) api.patch(`/claims/${editing.id}`, { link: { autoReminder: checked } }).catch((err) => message.error(errText(err)));
    };

    const canEdit = editing ? can(MODULES.intimation, 'edit') : can(MODULES.intimation, 'create');
    const loadingClaim = !isNew && claimId && !claim;

    return (
        <ClaimShell
            title="Intimation"
            subtitle={editing ? `${editing.claimNo} · ${editing.status === 'Draft' ? 'Draft' : editing.stageLabel}` : 'Capture And Initiate The Claim Journey'}
            stage="intimation"
            showIdentity={false}
            showMeta={false}
            requireClaim={false}
            useActiveClaim={!isNew}
            onNext={() => (editing && editing.status !== 'Draft' ? navigate(ROUTES.handlerAllocation) : message.info('Submit the intimation first'))}
        >
            {loadingClaim ? (
                <Spin className="!py-10" />
            ) : (
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                    <div className="flex min-w-0 flex-1 flex-col gap-4">
                        <section className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-xl border border-slate-200 bg-white px-4 py-4 sm:grid-cols-3 xl:grid-cols-5">
                            {metaFields.map((field) => (
                                <DynamicField key={field.name} field={field} value={values[field.name]} values={values} onChange={handleChange} />
                            ))}
                        </section>

                        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
                            <div className="flex flex-col gap-4">
                                {INTIMATION_LEFT_SECTIONS.map((section) => (
                                    <FormSection key={section.key} section={section} values={values} onChange={handleChange} />
                                ))}
                            </div>
                            <div className="flex flex-col gap-4">
                                {INTIMATION_RIGHT_SECTIONS.map((section) => (
                                    <FormSection key={section.key} section={section} values={values} onChange={handleChange} />
                                ))}
                            </div>
                        </div>

                        <LinkSection
                            link={link}
                            onChange={handleLinkChange}
                            onGenerateId={onSave}
                            generatingId={busy === 'save'}
                            onGenerateLink={onGenerateLink}
                            generatingLink={busy === 'generate-link'}
                            onSend={onSendLink}
                            sending={busy === 'link'}
                            onAutoReminder={onAutoReminder}
                            assistId={editing?.id}
                        />

                        <div className="grid grid-cols-1 gap-4 pb-2 sm:grid-cols-2">
                            <Button className="!h-9 !border-[#1450d8] !text-[#1450d8]" loading={busy === 'save'} disabled={!canEdit} onClick={onSave}>
                                Save Details
                            </Button>
                            <Button type="primary" className="!h-9" loading={busy === 'submit'} disabled={!canEdit} onClick={onSubmit}>
                                {editing && editing.status !== 'Draft' ? 'Update Details' : 'Submit Details'}
                            </Button>
                        </div>
                    </div>

                    <div className="w-full xl:w-[240px] xl:shrink-0">
                        <DmsDocumentsPanel
                            claimId={editing?.id ?? null}
                            onSelect={() => navigate(ROUTES.documentsDms)}
                            ensureClaim={async () => (editing ?? (await save())).id}
                        />
                    </div>
                </div>
            )}
        </ClaimShell>
    );
}
