import { Table } from 'antd';
import { DownloadOutlined, FileAddOutlined } from '@ant-design/icons';

import { STATUS_TONES } from '../../data/communicationData.js';
import cn from '../../utils/cn.js';

/** The blue header band is what sets this table apart from the other design. */
const header = (label) => <span className="text-[12px] font-bold text-white">{label}</span>;

function TypeCell({ row }) {
    const sent = row.direction === 'sent';
    return (
        <div className="flex min-w-[210px] items-start gap-3">
            <span
                className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[13px]',
                    sent ? 'bg-violet-100 text-violet-500' : 'bg-emerald-100 text-emerald-500'
                )}
            >
                <FileAddOutlined />
            </span>
            <span className="min-w-0">
                <span className="block text-[12px] font-bold text-slate-900">{row.type}</span>
                <span
                    className={cn(
                        'mt-1.5 inline-block rounded-md px-3 py-1 text-[11px] font-medium',
                        sent ? 'bg-violet-100 text-violet-600' : 'bg-emerald-100 text-emerald-600'
                    )}
                >
                    {row.tag}
                </span>
                {row.reference ? (
                    <span className="mt-1.5 block text-[10.5px] text-slate-500">{row.reference}</span>
                ) : null}
            </span>
        </div>
    );
}

function DescriptionCell({ row }) {
    return (
        <div className="min-w-[240px] max-w-[330px]">
            <p className="mb-0 text-[11px] leading-5 whitespace-pre-line text-slate-800">{row.description}</p>
            {row.subDescription ? (
                <p className="mt-1.5 mb-0 text-[11px] leading-5 text-slate-800">{row.subDescription}</p>
            ) : null}
            {row.bullets ? (
                <ul className="mt-1.5 mb-0 list-disc space-y-0.5 pl-4 text-[11px] leading-5 text-slate-700">
                    {row.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                    ))}
                </ul>
            ) : null}
            {row.attachment ? (
                <div className="mt-2.5 inline-flex items-center gap-2 rounded-lg bg-blue-100/70 px-2.5 py-2">
                    <FileAddOutlined className="text-[#1450d8]" />
                    <span className="min-w-0">
                        <span className="block text-[11px] font-semibold text-slate-800">
                            {row.attachment.name}
                        </span>
                        <span className="block text-[10px] text-slate-500">{row.attachment.size}</span>
                    </span>
                    <a
                        href={row.attachment.url ? `${row.attachment.url}&download=1` : undefined}
                        aria-label={`Download ${row.attachment.name}`}
                        className="ml-1 text-[11.5px] text-slate-700"
                    >
                        <DownloadOutlined />
                    </a>
                </div>
            ) : null}
        </div>
    );
}

/** Communication log with the periwinkle header band. */
export default function ClaimCommunicationTable({ rows }) {
    const columns = [
        {
            title: header('Date & Time'),
            key: 'dateTime',
            render: (_value, row) => (
                <div className="min-w-[100px]">
                    <span className="block text-[11.5px] font-bold text-slate-900">{row.dateTime.date}</span>
                    <span className="block text-[11px] text-slate-500">{row.dateTime.time}</span>
                </div>
            ),
        },
        { title: header('Type'), key: 'type', render: (_value, row) => <TypeCell row={row} /> },
        { title: header('Description'), key: 'description', render: (_value, row) => <DescriptionCell row={row} /> },
        {
            title: header('Sent By'),
            key: 'person',
            render: (_value, row) => (
                <div className="min-w-[110px]">
                    <span className="block text-[11.5px] font-bold text-slate-900">{row.person}</span>
                    <span className="block text-[11px] text-slate-600">{row.personMeta}</span>
                </div>
            ),
        },
        {
            title: header('Channel'),
            dataIndex: 'channel',
            key: 'channel',
            align: 'center',
            render: (value) => <span className="text-[11.5px] text-slate-800">{value}</span>,
        },
        {
            title: header('Status'),
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (value) => (
                <span className={cn('inline-flex rounded-full border px-5 py-1.5 text-[11.5px] font-semibold', STATUS_TONES[value] ?? STATUS_TONES.Pending)}>
                    {value}
                </span>
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
            className="[&_.ant-table-thead>tr>th]:!bg-[#a9bdea] [&_.ant-table-thead>tr>th]:!py-3"
        />
    );
}
