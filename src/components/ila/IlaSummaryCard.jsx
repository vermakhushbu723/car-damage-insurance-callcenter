import { Button } from 'antd';
import { CheckCircleOutlined, DownloadOutlined, FileTextOutlined, WarningOutlined } from '@ant-design/icons';

import { formatINR } from '../../data/ilaData.js';
import cn from '../../utils/cn.js';

/** Blue estimate card with the cost breakdown and the two AI verdicts. */
export default function IlaSummaryCard({ summary, generatedAt, busy, onGenerate, onDownload }) {
    if (!summary) return null;
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="bg-linear-to-b from-[#1450d8] to-[#0d3aa6] px-5 py-5 text-white">
                <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="mb-0 text-[13.5px] font-bold tracking-wide uppercase">Initial Loss Assessment</h3>
                    <span className="shrink-0 rounded-full border border-white/40 px-3 py-1 text-[10.5px] font-medium">
                        {summary.badge}
                    </span>
                </div>
                <p className="mb-1 text-[11px] text-white/75">AI ILA Estimate</p>
                <p className="mb-1 text-[20px] leading-7 font-bold">₹{formatINR(summary.total)}</p>
                <p className="mb-0 text-[11.5px] font-medium text-white/90">{summary.vehicle}</p>
                <p className="mb-0 text-[10.5px] text-white/70">{summary.meta}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 py-4">
                {summary.costs.map((cost) => (
                    <div key={cost.key} className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-600">{cost.label}</span>
                        <span className="text-[11.5px] font-semibold text-slate-900">₹ {formatINR(cost.value)}</span>
                    </div>
                ))}
            </div>

            <div className="space-y-2.5 px-5 pb-4">
                <div className={cn('rounded-lg px-3.5 py-3', summary.recommendation.ok ? 'bg-emerald-50' : 'bg-amber-50')}>
                    <p className={cn('mb-0.5 flex items-center gap-2 text-[11.5px] font-bold', summary.recommendation.ok ? 'text-emerald-600' : 'text-amber-600')}>
                        <CheckCircleOutlined /> {summary.recommendation.title}
                    </p>
                    <p className="mb-0 text-[11px] text-slate-600">{summary.recommendation.detail}</p>
                </div>

                <div className="rounded-lg bg-slate-100 px-3.5 py-3">
                    <p className="mb-0.5 flex items-center gap-2 text-[11.5px] font-bold text-slate-800">
                        <WarningOutlined /> {summary.fraud.title}
                    </p>
                    <p className="mb-0 text-[11px] text-slate-600">{summary.fraud.detail}</p>
                </div>
            </div>

            <div className="flex flex-col gap-2.5 px-5 pb-5">
                <Button type="primary" icon={<FileTextOutlined />} loading={busy === 'report'} onClick={onGenerate}>
                    {generatedAt ? 'Regenerate ILA Report' : 'Generate ILA Report'}
                </Button>
                <Button icon={<DownloadOutlined />} loading={busy === 'pdf'} onClick={onDownload} className="!text-[#1450d8]">
                    Download Draft (PDF)
                </Button>
            </div>
        </section>
    );
}
