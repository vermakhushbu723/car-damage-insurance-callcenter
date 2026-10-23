import { useEffect, useState } from 'react';
import { App, Button, Empty, Spin } from 'antd';
import {
    AuditOutlined,
    CarOutlined,
    CloseOutlined,
    DownloadOutlined,
    EyeOutlined,
    FileDoneOutlined,
    FileSearchOutlined,
    FileTextOutlined,
    FormOutlined,
    LeftOutlined,
    RightOutlined,
    SafetyOutlined,
    SaveOutlined,
    SearchOutlined,
    ToolOutlined,
    TruckOutlined,
    UserOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { CLAIM_INFO_SECTIONS, CLAIM_INFO_TABS } from '../../data/claimInfoData.js';
import DynamicField from '../intimation/DynamicField.jsx';
import { api, fileUrl } from '../../api/client.js';
import { errText, fileSize, fmtDateTime } from '../../utils/format.js';
import cn from '../../utils/cn.js';

const TAB_ICONS = {
    file: FileTextOutlined,
    spot: FormOutlined,
    final: FileSearchOutlined,
    alert: WarningOutlined,
    tool: ToolOutlined,
    search: SearchOutlined,
    user: UserOutlined,
    truck: TruckOutlined,
    car: CarOutlined,
    shield: SafetyOutlined,
    provision: AuditOutlined,
    doc: FileDoneOutlined,
};

const DATE_FIELDS = new Set(
    Object.values(CLAIM_INFO_SECTIONS)
        .flatMap((s) => s.fields)
        .filter((f) => f.type === 'date')
        .map((f) => f.name)
);
const toForm = (v = {}) => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, DATE_FIELDS.has(k) && x && dayjs(x).isValid() ? dayjs(x) : x]));
const toApi = (v) => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dayjs.isDayjs(x) ? x.toISOString() : x]));

/**
 * Claim Information: the full claim record in 12 tabs (claim, spot / final
 * survey, loss, workshop, investigation, driver, commercial vehicle, vehicle,
 * insured, claim provision, document action). First filled from what the
 * portal already knows; "Save Drift" stores it (PUT /claims/:id/info).
 */
export default function ClaimInfoSection({ claimId, canEdit, files = [] }) {
    const { message } = App.useApp();
    const [tab, setTab] = useState('claim');
    const [values, setValues] = useState(null);
    const [savedAt, setSavedAt] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!claimId) return;
        api.get(`/claims/${claimId}/info`)
            .then((d) => {
                setValues(toForm(d.values));
                setSavedAt(d.savedAt ? `${fmtDateTime(d.savedAt)} by ${d.savedBy}` : null);
            })
            .catch((err) => {
                setValues({});
                message.error(errText(err));
            });
    }, [claimId, message]);

    const section = CLAIM_INFO_SECTIONS[tab];
    const index = CLAIM_INFO_TABS.findIndex((x) => x.key === tab);
    const step = (delta) => {
        const next = CLAIM_INFO_TABS[index + delta];
        if (next) setTab(next.key);
    };

    const save = async () => {
        setSaving(true);
        try {
            const d = await api.put(`/claims/${claimId}/info`, { values: toApi(values) });
            setValues(toForm(d.values));
            setSavedAt(`${fmtDateTime(d.savedAt)} by ${d.savedBy}`);
            message.success('Claim information saved');
        } catch (err) {
            message.error(errText(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2 py-2">
                {CLAIM_INFO_TABS.map((item) => {
                    const Icon = TAB_ICONS[item.icon] ?? FileTextOutlined;
                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setTab(item.key)}
                            className={cn(
                                'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-[10.5px] font-medium transition',
                                item.key === tab ? 'bg-[#1450d8] text-white' : 'text-slate-700 hover:bg-slate-100'
                            )}
                        >
                            <Icon className="text-[13px]" />
                            {item.label}
                        </button>
                    );
                })}
            </div>

            <div className="bg-[#f3f5f9] px-4 py-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1450d8] text-[9.5px] font-bold text-white">{section.step}</span>
                        <h4 className="mb-0 text-[12.5px] font-bold text-[#1450d8]">{section.title}</h4>
                    </div>
                    <div className="flex gap-2">
                        <Button size="small" icon={<LeftOutlined />} disabled={index === 0} onClick={() => step(-1)} className="!text-[#1450d8]">
                            Previous
                        </Button>
                        <Button size="small" type="primary" disabled={index === CLAIM_INFO_TABS.length - 1} onClick={() => step(1)}>
                            Next <RightOutlined />
                        </Button>
                    </div>
                </div>

                {values === null ? (
                    <Spin />
                ) : tab === 'documents' ? (
                    files.length ? (
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                            {files.map((f) => (
                                <div key={f.id} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2">
                                    <FileTextOutlined className="text-[#1450d8]" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-[11.5px] font-semibold text-slate-800">{f.typeLabel} · {f.name}</span>
                                        <span className="block text-[10px] text-slate-500">
                                            {fileSize(f.size)} · {f.uploadedBy} · {fmtDateTime(f.uploadedAt)}
                                        </span>
                                    </span>
                                    <a href={fileUrl(f.url)} target="_blank" rel="noreferrer" aria-label="View" className="text-slate-500 hover:text-[#1450d8]">
                                        <EyeOutlined />
                                    </a>
                                    <a href={`${fileUrl(f.url)}&download=1`} aria-label="Download" className="text-slate-500 hover:text-[#1450d8]">
                                        <DownloadOutlined />
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty description="No documents uploaded yet (Documents DMS)." />
                    )
                ) : (
                    <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
                        {section.fields.map((field) => (
                            <DynamicField
                                key={field.name}
                                field={{ ...field, disabled: !canEdit }}
                                value={values[field.name]}
                                onChange={(name, v) => setValues((prev) => ({ ...prev, [name]: v }))}
                            />
                        ))}
                    </div>
                )}

                {tab !== 'documents' ? (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <Button type="primary" icon={<SaveOutlined />} loading={saving} disabled={!canEdit} onClick={save}>
                            Save Drift
                        </Button>
                        <Button
                            icon={<CloseOutlined />}
                            disabled={!canEdit}
                            className="!text-[#1450d8]"
                            onClick={() => setValues((prev) => ({ ...prev, ...Object.fromEntries(section.fields.map((f) => [f.name, undefined])) }))}
                        >
                            Clear
                        </Button>
                        <span className="text-[10.5px] text-slate-500">{savedAt ? `Saved ${savedAt}` : 'Prefilled from the claim -- not saved yet'}</span>
                    </div>
                ) : null}
            </div>
        </section>
    );
}
