import {
    ArrowDownOutlined,
    ArrowUpOutlined,
    CheckCircleFilled,
    EditOutlined,
    RightOutlined,
} from '@ant-design/icons';

import { FEEDBACK_STATS, FEEDBACK_STEPS, PIPELINE_STATUS } from '../../data/ilaData.js';
import cn from '../../utils/cn.js';

const STEP_STYLES = {
    done: 'border-slate-200 bg-white',
    active: 'border-[#1450d8] bg-blue-50/60',
    pending: 'border-slate-200 bg-slate-50',
};

/** Six-stage retraining pipeline plus its weekly numbers. */
export default function ModelFeedbackLoop({ steps = FEEDBACK_STEPS, stats = FEEDBACK_STATS }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-4">
            <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="mb-0.5 text-[10.5px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                        Continuous Learning
                    </p>
                    <h3 className="mb-0.5 text-[14px] font-bold text-slate-900">Model Feedback Loop</h3>
                    <p className="mb-0 text-[11px] text-slate-500">
                        Every Csm Correction Is Feedback To Retraining Pipeline
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 text-[10.5px] text-emerald-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" /> {PIPELINE_STATUS.label}
                    </span>
                    <span className="rounded-md border border-slate-200 px-2 py-0.5 text-[10.5px] text-slate-500">
                        {PIPELINE_STATUS.version}
                    </span>
                </div>
            </header>

            <div className="flex gap-1.5 overflow-x-auto pb-2">
                {steps.map((step, index) => (
                    <div key={step.key} className="flex items-center gap-1.5">
                        <div
                            className={cn(
                                'w-[140px] shrink-0 rounded-lg border px-3 py-2.5',
                                STEP_STYLES[step.state]
                            )}
                        >
                            <div className="mb-1.5 flex items-center gap-2">
                                <span
                                    className={cn(
                                        'flex h-5 w-5 items-center justify-center rounded-full text-[9.5px] text-white',
                                        step.state === 'done'
                                            ? 'bg-emerald-500'
                                            : step.state === 'active'
                                              ? 'bg-[#1450d8]'
                                              : 'bg-slate-300'
                                    )}
                                >
                                    {step.state === 'done' ? (
                                        <CheckCircleFilled />
                                    ) : step.state === 'active' ? (
                                        <EditOutlined />
                                    ) : null}
                                </span>
                                <span className="text-[9.5px] font-semibold tracking-wider text-slate-500 uppercase">
                                    {step.step}
                                </span>
                            </div>
                            <span className="block text-[11.5px] font-semibold text-slate-900">{step.title}</span>
                            <span className="block text-[10px] text-slate-500">{step.detail}</span>
                        </div>
                        {index < steps.length - 1 ? (
                            <RightOutlined className="shrink-0 text-[9.5px] text-slate-300" />
                        ) : null}
                    </div>
                ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-4 border-t border-slate-100 pt-3 xl:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.key}>
                        <span className="block text-[9.5px] font-semibold tracking-wider text-slate-500 uppercase">
                            {stat.label}
                        </span>
                        <span className="flex items-baseline gap-2">
                            <span className="text-[15.5px] leading-6 font-bold text-slate-900">{stat.value}</span>
                            <span
                                className={cn(
                                    'flex items-center gap-0.5 text-[10.5px] font-semibold',
                                    stat.direction === 'down' ? 'text-emerald-600' : 'text-emerald-600'
                                )}
                            >
                                {stat.direction === 'down' ? (
                                    <ArrowDownOutlined className="text-[9px]" />
                                ) : (
                                    <ArrowUpOutlined className="text-[9px]" />
                                )}
                                {stat.delta}
                            </span>
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}
