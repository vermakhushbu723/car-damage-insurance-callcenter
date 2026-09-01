import { useState } from 'react';
import { Table } from 'antd';
import { DownloadOutlined, DownOutlined, FileTextOutlined, RollbackOutlined } from '@ant-design/icons';

import { STATUS_TONES } from '../../data/communicationData.js';
import cn from '../../utils/cn.js';

const header = (label) => <span className="text-[11.5px] font-semibold text-slate-900">{label}</span>;

function TypeCell({ row }) {
    const sent = row.direction === 'sent';
    return (
        <div className="flex min-w-[190px] gap-2.5">
            <span
                className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[12px]',
                    sent ? 'bg-violet-50 text-violet-600' : 'bg-emerald-50 text-emerald-600'
                )}
            >
                {sent ? <FileTextOutlined /> : <RollbackOutlined />}
            </span>
            <span className="min-w-0">
                <span className="block text-[11.5px] font-semibold text-slate-900">{row.type}</span>
                <span
                    className={cn(
                        'mt-1 inline-block rounded-md px-2 py-0.5 text-[10.5px] font-medium',
                        sent ? 'bg-violet-50 text-violet-600' : 'bg-emerald-50 text-emerald-600'
                    )}
                >
                    {row.tag}
                </span>
                {row.reference ? (
                    <span className="mt-1 block text-[10.5px] text-slate-400">{row.reference}</span>
                ) : null}
            </span>
        </div>
    );
}

function DescriptionCell({ row }) {
    return (
        <div className="min-w-[240px] max-w-[340px]">
            <p className="mb-0 text-[11px] leading-5 whitespace-pre-line text-slate-700">{row.description}</p>
            {row.subDescription ? (
                <p className="mt-1 mb-0 text-[11px] leading-5 text-slate-700">{row.subDescription}</p>
            ) : null}
            {row.bullets ? (
                <ul className="mt-1 mb-0 list-disc space-y-0.5 pl-4 text-[11px] text-slate-600">
                    {row.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                    ))}
                </ul>
            ) : null}
            {row.attachment ? (
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                    <FileTextOutlined className="text-[#1450d8]" />
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] font-medium text-slate-800">
                            {row.attachment.name}
                        </span>
                        <span className="block text-[10px] text-slate-500">{row.attachment.size}</span>
                    </span>
                    <button
                        type="button"
                        aria-label={`Download ${row.attachment.name}`}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1450d8] text-[10.5px] text-white"
                    >
                        <DownloadOutlined />
                    </button>
                </div>
            ) : null}
        </div>
    );
}

/** Chronological log table with expandable rows. */
export default function CommunicationTable({ rows }) {
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);

    const toggle = (key) =>
        setExpandedRowKeys((keys) => (keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key]));

    const columns = [
        {
            title: header('#'),
            key: 'index',
            width: 48,
            render: (_value, _row, index) => <span className="text-[11px] text-slate-500">{index + 1}</span>,
        },
        {
            title: header('Date & Time'),
            key: 'dateTime',
            render: (_value, row) => (
                <div className="min-w-[100px]">
                    <span className="block text-[11px] font-medium text-slate-800">{row.dateTime.date}</span>
                    <span className="block text-[10.5px] text-slate-500">{row.dateTime.time}</span>
                </div>
            ),
        },
        { title: header('Type'), key: 'type', render: (_value, row) => <TypeCell row={row} /> },
        {
            title: header('Description'),
            key: 'description',
            render: (_value, row) => <DescriptionCell row={row} />,
        },
        {
            title: header('Sent By / Received From'),
            key: 'person',
            render: (_value, row) => (
                <div className="min-w-[120px]">
                    <span className="block text-[11px] font-medium text-slate-800">{row.person}</span>
                    <span className="block text-[10.5px] text-slate-500">{row.personMeta}</span>
                </div>
            ),
        },
        {
            title: header('Channel'),
            dataIndex: 'channel',
            key: 'channel',
            render: (value) => <span className="text-[11px] text-slate-700">{value}</span>,
        },
        {
            title: header('Status'),
            dataIndex: 'status',
            key: 'status',
            render: (value) => (
                <span
                    className={cn(
                        'inline-flex rounded-md border px-2.5 py-1 text-[10.5px] font-semibold',
                        STATUS_TONES[value] || STATUS_TONES.Pending
                    )}
                >
                    {value}
                </span>
            ),
        },
        {
            title: header('Action'),
            key: 'action',
            width: 72,
            align: 'center',
            render: (_value, row) => (
                <button
                    type="button"
                    aria-label="Toggle details"
                    onClick={() => toggle(row.key)}
                    className="flex h-7 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-[#1450d8] hover:text-[#1450d8]"
                >
                    <DownOutlined
                        className={cn(
                            'text-[9.5px] transition-transform',
                            expandedRowKeys.includes(row.key) && 'rotate-180'
                        )}
                    />
                </button>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={rows}
            rowKey="key"
            pagination={false}
            scroll={{ x: 'max-content' }}
            expandable={{
                showExpandColumn: false,
                expandedRowKeys,
                expandedRowRender: (row) => (
                    <div className="grid grid-cols-1 gap-3 rounded-lg bg-slate-50 px-4 py-3 text-[11px] text-slate-600 sm:grid-cols-3">
                        <div>
                            <span className="block text-[10.5px] text-slate-400">Reference</span>
                            {row.reference || '—'}
                        </div>
                        <div>
                            <span className="block text-[10.5px] text-slate-400">Channel</span>
                            {row.channel}
                        </div>
                        <div>
                            <span className="block text-[10.5px] text-slate-400">Status</span>
                            {row.status}
                        </div>
                    </div>
                ),
            }}
        />
    );
}
