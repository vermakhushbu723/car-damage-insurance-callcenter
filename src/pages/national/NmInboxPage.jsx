import { useEffect, useState } from 'react';
import { App } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

import Pager from '../../components/common/Pager.jsx';
import { Card, NmTable, NmTitle, StatusPill } from '../../components/national/NmUi.jsx';
import { api } from '../../api/client.js';
import { INBOX_TILES } from '../../data/nationalManagerData.js';
import { errText } from '../../utils/format.js';
import { fmtDate, useOpenClaim } from './nmClaims.js';

/** Inbox: the stage tiles from Figma over the claims allocated to this user (GET /claims?mine=1). */
export default function NmInboxPage() {
    const { message } = App.useApp();
    const openClaim = useOpenClaim();
    const [page, setPage] = useState(1);
    const [data, setData] = useState(null);

    useEffect(() => {
        api.get(`/claims?mine=1&page=${page}&pageSize=8`)
            .then(setData)
            .catch((err) => message.error(errText(err)));
    }, [page, message]);

    return (
        <div>
            <NmTitle title="Inbox" />
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
                {INBOX_TILES.map((t) => (
                    <div key={t.label} className="flex items-center gap-3 rounded-md border border-slate-200 bg-[#f5f5f5] p-3.5">
                        <span className="h-11 w-11 shrink-0 rounded-full border" style={{ borderColor: t.color, background: `${t.color}33` }} />
                        <span>
                            <span className="block text-[12.5px] font-semibold" style={{ color: t.color }}>
                                {t.label}
                            </span>
                            <span className="block text-[15px] font-bold text-slate-800">{t.value}</span>
                        </span>
                    </div>
                ))}
            </div>
            <p className="mt-1.5 text-[10.5px] text-amber-700">Tiles: sample data</p>

            <Card title="Claims Needing My Action" className="mt-3 overflow-hidden">
                <NmTable
                    blue
                    rows={data?.rows ?? []}
                    empty={data ? 'Nothing is waiting for you' : 'Loading…'}
                    columns={[
                        { key: 'id', title: 'Claim ID', render: (r) => r.claimNo || r.id },
                        { key: 'policyNo', title: 'Policy No', render: (r) => r.policyNo || '—' },
                        { key: 'insuredName', title: 'Insured Name', render: (r) => r.insuredName || '—' },
                        { key: 'vehicleNo', title: 'Vehicle Number', render: (r) => r.vehicleNo || '—' },
                        { key: 'at', title: 'Intimated On', render: (r) => fmtDate(r.intimatedAt) },
                        { key: 'stage', title: 'Stage', render: (r) => <StatusPill value={r.stageLabel} tone="blue" className="whitespace-nowrap" /> },
                        { key: 'priority', title: 'Priority', render: (r) => <StatusPill value={r.priority || 'Low'} /> },
                        {
                            key: 'view',
                            title: 'Action',
                            render: (r) => (
                                <button type="button" onClick={() => openClaim(r)} className="inline-flex items-center gap-1 font-medium text-[#0b4fc9]">
                                    View <EyeOutlined />
                                </button>
                            ),
                        },
                    ]}
                />
                <Pager current={data?.page ?? 1} total={data?.totalPages ?? 1} onChange={setPage} />
            </Card>
        </div>
    );
}
