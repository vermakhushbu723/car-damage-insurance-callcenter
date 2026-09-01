import { useMemo, useState } from 'react';
import { App } from 'antd';

import {
    DEFAULT_REVIEW_NOTE,
    DETECTED_PARTS,
    FEEDBACK_STEPS,
    SURVEY_IMAGES,
    formatINR,
} from '../../data/ilaData.js';
import ClaimShell from '../../components/claim/ClaimShell.jsx';
import AiAnalysisCard from '../../components/ila/AiAnalysisCard.jsx';
import SurveyThumbnails from '../../components/ila/SurveyThumbnails.jsx';
import AiInsightsCard from '../../components/ila/AiInsightsCard.jsx';
import DetectedDamageTable from '../../components/ila/DetectedDamageTable.jsx';
import IlaSummaryCard from '../../components/ila/IlaSummaryCard.jsx';
import ModelFeedbackLoop from '../../components/ila/ModelFeedbackLoop.jsx';
import ReviewerToolkit from '../../components/ila/ReviewerToolkit.jsx';

/** Fields a CSM can change – used to count corrections for the retraining loop. */
const TRACKED_FIELDS = ['damageType', 'severity', 'action', 'cost', 'status'];

export default function AiIlaPage() {
    const { message } = App.useApp();

    const [rows, setRows] = useState(() => DETECTED_PARTS.map((row) => ({ ...row })));
    const [activeImage, setActiveImage] = useState(SURVEY_IMAGES[0].key);
    const [note, setNote] = useState(DEFAULT_REVIEW_NOTE);
    const [noteSaved, setNoteSaved] = useState(true);

    const updateRow = (key, field, value) =>
        setRows((list) => list.map((row) => (row.key === key ? { ...row, [field]: value } : row)));

    /** A row counts once, however many of its fields the reviewer touched. */
    const corrections = useMemo(() => {
        const original = new Map(DETECTED_PARTS.map((row) => [row.key, row]));
        return rows.filter((row) => {
            const base = original.get(row.key);
            return base && TRACKED_FIELDS.some((field) => base[field] !== row[field]);
        }).length;
    }, [rows]);

    // The pipeline card reflects the live correction count.
    const feedbackSteps = useMemo(
        () =>
            FEEDBACK_STEPS.map((step) =>
                step.key === 'csm-review'
                    ? { ...step, detail: `${corrections} correction${corrections === 1 ? '' : 's'}` }
                    : step
            ),
        [corrections]
    );

    const totalEstimate = rows.reduce((sum, row) => sum + (row.cost || 0), 0);

    const approveAll = () => {
        setRows((list) => list.map((row) => ({ ...row, status: 'Approval' })));
        message.success('All detected damages approved');
    };

    const exportCsv = () => {
        const head = ['Vehicle Part', 'Damage Type', 'Severity', 'Action', 'Est. Cost', 'AI Confidence', 'Status'];
        const body = rows.map((row) =>
            [row.part, row.damageType, row.severity, row.action, row.cost, `${row.confidence}%`, row.status].join(',')
        );
        message.success(`CSV ready · ${body.length} rows`);
        return [head.join(','), ...body].join('\n');
    };

    return (
        <ClaimShell title="AI ILA" subtitle="Assisted Assessment For Faster Claim Evaluation" stage="ai-ila">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
                <AiAnalysisCard activeKey={activeImage} />
                <AiInsightsCard />
            </div>

            <SurveyThumbnails activeKey={activeImage} onSelect={setActiveImage} />

            <DetectedDamageTable
                rows={rows}
                onChange={updateRow}
                onApproveAll={approveAll}
                onExport={exportCsv}
            />

            <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                <div className="w-full xl:w-[340px] xl:shrink-0">
                    <IlaSummaryCard
                        onGenerate={() => message.success(`ILA report generated · ₹${formatINR(totalEstimate)}`)}
                        onDownload={() => message.success('Draft PDF downloaded')}
                    />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-4">
                    <ModelFeedbackLoop steps={feedbackSteps} />
                    <ReviewerToolkit
                        note={note}
                        corrections={corrections}
                        saved={noteSaved}
                        onAction={(action) => message.info(action.label)}
                        onNoteChange={(value) => {
                            setNote(value);
                            setNoteSaved(false);
                        }}
                        onSave={() => {
                            setNoteSaved(true);
                            message.success('Review notes saved');
                        }}
                        onApprove={() => message.success('AI assessment approved')}
                        onReject={() => message.warning('AI assessment rejected')}
                    />
                </div>
            </div>
        </ClaimShell>
    );
}
