import { useState } from 'react';
import { App, Button } from 'antd';

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

export default function IntimationPage() {
    const { message } = App.useApp();
    const [values, setValues] = useState({});

    const handleChange = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));

    return (
        <ClaimShell
            title="Intimation"
            subtitle="Capture And Initiate The Claim Journey"
            stage="intimation"
            showIdentity={false}
            showMeta={false}
        >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                <div className="flex min-w-0 flex-1 flex-col gap-4">
                    <section className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-xl border border-slate-200 bg-white px-4 py-4 sm:grid-cols-3 xl:grid-cols-5">
                        {INTIMATION_META_FIELDS.map((field) => (
                            <DynamicField
                                key={field.name}
                                field={field}
                                value={values[field.name]}
                                values={values}
                                onChange={handleChange}
                            />
                        ))}
                    </section>

                    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
                        <div className="flex flex-col gap-4">
                            {INTIMATION_LEFT_SECTIONS.map((section) => (
                                <FormSection
                                    key={section.key}
                                    section={section}
                                    values={values}
                                    onChange={handleChange}
                                />
                            ))}
                        </div>

                        <div className="flex flex-col gap-4">
                            {INTIMATION_RIGHT_SECTIONS.map((section) => (
                                <FormSection
                                    key={section.key}
                                    section={section}
                                    values={values}
                                    onChange={handleChange}
                                />
                            ))}
                        </div>
                    </div>

                    <LinkSection values={values} onChange={handleChange} />

                    <div className="grid grid-cols-1 gap-4 pb-2 sm:grid-cols-2">
                        <Button
                            className="!h-9 !border-[#1450d8] !text-[#1450d8]"
                            onClick={() => message.success('Details saved as draft')}
                        >
                            Save Details
                        </Button>
                        <Button
                            type="primary"
                            className="!h-9"
                            onClick={() => message.success('Intimation submitted')}
                        >
                            Submit Details
                        </Button>
                    </div>
                </div>

                <div className="w-full xl:w-[240px] xl:shrink-0">
                    <DmsDocumentsPanel onSelect={(doc) => message.info(`Opening ${doc.label}`)} />
                </div>
            </div>
        </ClaimShell>
    );
}
