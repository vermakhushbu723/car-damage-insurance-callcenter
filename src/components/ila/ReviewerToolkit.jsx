import { Button, Input } from 'antd';
import {
    DeleteOutlined,
    DislikeOutlined,
    EditOutlined,
    ExpandOutlined,
    LikeOutlined,
    MergeCellsOutlined,
    PlusCircleOutlined,
    SwapOutlined,
} from '@ant-design/icons';

import { TOOLKIT_ACTIONS } from '../../data/ilaData.js';

const { TextArea } = Input;

const ICONS = {
    plus: PlusCircleOutlined,
    delete: DeleteOutlined,
    edit: EditOutlined,
    merge: MergeCellsOutlined,
    swap: SwapOutlined,
    expand: ExpandOutlined,
};

/** CSM tools plus the review note that is fed back to retraining. */
export default function ReviewerToolkit({
    actions = TOOLKIT_ACTIONS,
    note,
    corrections,
    saved,
    onAction,
    onNoteChange,
    onSave,
    onApprove,
    onReject,
}) {
    return (
        <section className="grid grid-cols-1 gap-5 rounded-xl border border-slate-200 bg-white px-5 py-4 xl:grid-cols-2">
            <div>
                <p className="mb-0.5 text-[10.5px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                    CSM Review
                </p>
                <h3 className="mb-0.5 text-[14px] font-bold text-slate-900">Reviewer Toolkit</h3>
                <p className="mb-3 text-[11px] text-slate-500">Corrections Train The Model</p>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {actions.map((action) => {
                        const Icon = ICONS[action.icon] || EditOutlined;
                        return (
                            <button
                                key={action.key}
                                type="button"
                                onClick={() => onAction?.(action)}
                                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-[11.5px] text-slate-700 transition hover:border-[#1450d8] hover:text-[#1450d8]"
                            >
                                <Icon className="text-[12px]" />
                                {action.label}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <Button
                        icon={<LikeOutlined />}
                        onClick={onApprove}
                        className="!border-emerald-500 !bg-emerald-500 !text-white hover:!bg-emerald-600"
                    >
                        Approve AI
                    </Button>
                    <Button
                        icon={<DislikeOutlined />}
                        onClick={onReject}
                        className="!border-red-500 !bg-red-500 !text-white hover:!bg-red-600"
                    >
                        Reject Ai
                    </Button>
                </div>
            </div>

            <div className="flex flex-col">
                <p className="mb-2 text-[10.5px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                    Review Notes
                </p>
                <TextArea
                    value={note}
                    onChange={(event) => onNoteChange(event.target.value)}
                    rows={8}
                    className="!bg-white"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <span className="h-2 w-2 rounded-full bg-[#1450d8]" />
                        <span className="font-semibold">{corrections} corrections</span> will be sent to AI retraining
                    </span>
                    <Button type="primary" onClick={onSave} disabled={saved}>
                        {saved ? 'Saved' : 'Save'}
                    </Button>
                </div>
            </div>
        </section>
    );
}
