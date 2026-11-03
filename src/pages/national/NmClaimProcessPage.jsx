import { useEffect, useState } from 'react';
import { App } from 'antd';

import Pager from '../../components/common/Pager.jsx';
import { NmTable, NmTitle, StatusPill } from '../../components/national/NmUi.jsx';
import { NM_PROCESS_TABS } from '../../constants/nationalManager.js';
import { api } from '../../api/client.js';
import { errText } from '../../utils/format.js';
import cn from '../../utils/cn.js';
import { tatSince, useOpenClaim } from './nmClaims.js';

const PAGE_SIZE = 8;
const countOf = (counts, tab) => tab.stages.reduce((n, s) => n + (counts?.[s] ?? 0), 0);

/** Claim Process: one tile per Service Provider stage, live counts and claims. */
export default function NmClaimProcessPage() {
    const { message } = App.useApp();
    const openClaim = useOpenClaim();
    const [active, setActive] = useState(NM_PROCESS_TABS[0].key);
    const [counts, setCounts] = useState(null);
    const [page, setPage] = useState(1);
    const [list, setList] = useState(null);
    const tab = NM_PROCESS_TABS.find((t) => t.key === active);

    useEffect(() => {
        const stages = NM_PROCESS_TABS.flatMap((t) => t.stages);
        Promise.all(stages.map((s) => api.get(`/claims?stage=${s}&status=Open&pageSize=1`).then((d) => [s, d.total])))
            .then((entries) => setCounts(Object.fromEntries(entries)))
            .catch((err) => message.error(errText(err)));
    }, [message]);

    useEffect(() => {
        let stale = false;
        setList(null);
        // A tile can span two backend stages (Claim Details), so fetch each and merge.
        Promise.all(tab.stages.map((s) => api.get(`/claims?stage=${s}&status=Open&page=${page}&pageSize=${PAGE_SIZE}`)))
            .then((res) => {
                if (stale) return;
                setList({
                    rows: res.flatMap((d) => d.rows),
                    totalPages: Math.max(...res.map((d) => d.totalPages)),
                });
            })
            .catch((err) => !stale && message.error(errText(err)));
        return () => {
            stale = true;
        };
    }, [tab, page, message]);

    const columns = [
        { key: 'id', title: 'Claim ID', render: (r) => r.claimNo || r.id },
        { key: 'insuredName', title: 'Insured Name', render: (r) => r.insuredName || '—' },
        { key: 'vehicleNo', title: 'Vehicle Number', render: (r) => r.vehicleNo || '—' },
        { key: 'location', title: 'Location', render: (r) => r.location || '—' },
        { key: 'stage', title: 'Stage', render: () => <StatusPill value={tab.label} tone="blue" className="whitespace-nowrap" /> },
        { key: 'pendingFor', title: 'Pending For', render: () => tab.pendingFor },
        { key: 'tat', title: 'TAT', render: (r) => tatSince(r.intimatedAt) },
        { key: 'priority', title: 'Priorty', render: (r) => <StatusPill value={r.priority || 'Low'} /> },
        {
            key: 'view',
            title: 'Status',
            render: (r) => (
                <button type="button" onClick={() => openClaim(r)} className="rounded-md bg-slate-100 px-5 py-1.5 font-medium text-slate-900 hover:bg-slate-200">
                    View
                </button>
            ),
        },
    ];

    return (
        <div>
            <NmTitle title="Claim Process" />
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
                {NM_PROCESS_TABS.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        aria-pressed={active === t.key}
                        onClick={() => {
                            setActive(t.key);
                            setPage(1);
                        }}
                        className={cn(
                            'flex min-h-[70px] items-center gap-2.5 rounded-md border bg-white p-2.5 text-left transition',
                            active === t.key ? 'border-[#0b4fc9] border-b-4' : 'border-slate-200 hover:border-[#0b4fc9]'
                        )}
                    >
                        <span className="h-9 w-9 shrink-0 rounded-full" style={{ background: t.color }} />
                        <span className="min-w-0">
                            <span className="block text-[12.5px] leading-tight font-medium text-slate-900">{t.label}</span>
                            <span className="block text-[15px] font-bold text-slate-900">{counts ? String(countOf(counts, t)).padStart(2, '0') : '—'}</span>
                        </span>
                    </button>
                ))}
            </div>

            <h2 className="mt-5 mb-3 text-[18px] font-bold text-[#0b4fc9]">{tab.label}</h2>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-[#f4f4f6]">
                <NmTable blue columns={columns} rows={list?.rows ?? []} empty={list ? `No claims in ${tab.label}` : 'Loading…'} minWidth={960} />
                <Pager current={page} total={list?.totalPages ?? 1} onChange={setPage} />
            </div>
        </div>
    );
}
