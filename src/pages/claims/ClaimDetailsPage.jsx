import { useState } from 'react';
import { App, Button, Switch } from 'antd';
import { CarOutlined, CloseOutlined, LeftOutlined, RightOutlined, SaveOutlined } from '@ant-design/icons';

import { CLAIM_DETAIL_SECTIONS, CLAIM_DETAIL_TABS } from '../../data/claimDetailsData.js';
import ClaimShell from '../../components/claim/ClaimShell.jsx';
import DocumentViewer from '../../components/claim/DocumentViewer.jsx';
import DynamicField from '../../components/intimation/DynamicField.jsx';
import DmsDocumentsPanel from '../../components/intimation/DmsDocumentsPanel.jsx';
import cn from '../../utils/cn.js';

export default function ClaimDetailsPage() {
    const { message } = App.useApp();
    const [tab, setTab] = useState('vehicle');
    const [editMode, setEditMode] = useState(true);
    const [values, setValues] = useState({});

    const section = CLAIM_DETAIL_SECTIONS[tab];
    const tabIndex = CLAIM_DETAIL_TABS.findIndex((item) => item.key === tab);

    const step = (delta) => {
        const next = CLAIM_DETAIL_TABS[tabIndex + delta];
        if (next) setTab(next.key);
    };

    const handleChange = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));

    return (
        <ClaimShell
            title="Claim Details"
            subtitle="Access Complete Claim Information And Activity"
            stage="claim-details"
        >
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[330px_minmax(0,1fr)_260px]">
                <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                    <header className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="mb-0 text-[14px] font-bold text-slate-900">Claim Details</h3>
                        <span className="flex items-center gap-2 text-[11.5px] font-semibold text-slate-800">
                            Edit Mode
                            <Switch size="small" checked={editMode} onChange={setEditMode} />
                        </span>
                    </header>

                    <div className="mb-3 flex justify-center gap-3">
                        <Button
                            icon={<LeftOutlined />}
                            disabled={tabIndex === 0}
                            onClick={() => step(-1)}
                            className="!text-[#1450d8]"
                        >
                            Previous
                        </Button>
                        <Button
                            type="primary"
                            disabled={tabIndex === CLAIM_DETAIL_TABS.length - 1}
                            onClick={() => step(1)}
                        >
                            Next <RightOutlined />
                        </Button>
                    </div>

                    <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200 pb-1">
                        {CLAIM_DETAIL_TABS.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => setTab(item.key)}
                                className={cn(
                                    'flex shrink-0 items-center gap-1.5 px-2 pb-1.5 text-[10px] font-medium transition',
                                    item.key === tab
                                        ? 'border-b-2 border-[#1450d8] text-[#1450d8]'
                                        : 'text-slate-500 hover:text-slate-800'
                                )}
                            >
                                <CarOutlined className="text-[10.5px]" />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="mb-3 flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1450d8] text-[9.5px] font-bold text-white">
                            {section.step}
                        </span>
                        <h4 className="mb-0 text-[12px] font-bold text-slate-900">{section.title}</h4>
                    </div>

                    <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                        {section.fields.map((field) => (
                            <div key={field.name} className={field.full ? 'sm:col-span-2' : ''}>
                                <DynamicField
                                    field={{ ...field, disabled: !editMode }}
                                    value={values[field.name]}
                                    onChange={handleChange}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={() => message.success('Draft saved')}
                        >
                            Save Drift
                        </Button>
                        <Button
                            icon={<CloseOutlined />}
                            onClick={() => setValues({})}
                            className="!text-[#1450d8]"
                        >
                            Clear
                        </Button>
                    </div>
                </section>

                <DocumentViewer />

                <DmsDocumentsPanel onSelect={(doc) => message.info(`Opening ${doc.label}`)} />
            </div>
        </ClaimShell>
    );
}
