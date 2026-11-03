import { useState } from 'react';
import { App } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { Card, FieldLabel, NmButton, NmInput, NmTable, NmTitle, StatusPill } from '../../components/national/NmUi.jsx';
import { api } from '../../api/client.js';
import { errText } from '../../utils/format.js';
import { fmtDate, useOpenClaim } from './nmClaims.js';

const QUICK = [
    ['claimNo', 'Claim No.', 'Enter Claim No.'],
    ['notificationNo', 'Notification No.', 'Enter Notification No.'],
    ['branch', 'Branch Office', 'Select Branch Office'],
];
const ADVANCED = [
    ['policyNo', 'Policy No.', 'Enter Policy No.'],
    ['insuredName', 'Insured Name', 'Enter Insured Name'],
    ['mobile', 'Insured Mobile No.', 'Enter Mobile Number'],
    ['ibimaId', 'Unique IBima ID', 'Enter Customer ID'],
    ['chassisNo', 'Vehicle Chassis No.', 'Enter Chassis No.'],
    ['registrationNo', 'Vehicle Registration No.', 'Enter Registration No.'],
    ['engineNo', 'Vehicle Engine No.', 'Enter Engine No.'],
    ['csmId', 'CSM ID', 'Enter CSM ID'],
];

/**
 * Claim Search. GET /claims has one free-text `search`, so the first filled
 * field is what gets searched; any field the API can't match returns nothing.
 */
export default function NmSearchClaimsPage() {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const openClaim = useOpenClaim();
    const [values, setValues] = useState({});
    const [rows, setRows] = useState(null);
    const [loading, setLoading] = useState(false);

    const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));
    const clear = () => {
        setValues({});
        setRows(null);
    };

    const search = async () => {
        const term = Object.values(values).map((v) => v?.trim()).find(Boolean);
        if (!term) return message.warning('Enter at least one field to search.');
        setLoading(true);
        try {
            const d = await api.get(`/claims?search=${encodeURIComponent(term)}&pageSize=20`);
            setRows(d.rows);
        } catch (err) {
            message.error(errText(err));
        } finally {
            setLoading(false);
        }
        return undefined;
    };

    const field = ([key, label, placeholder]) => (
        <FieldLabel key={key} label={label}>
            <NmInput value={values[key] ?? ''} onChange={set(key)} placeholder={placeholder} />
        </FieldLabel>
    );

    return (
        <div>
            <NmTitle title="Claim Search" onBack={() => navigate(-1)} />
            <h2 className="mb-3 text-[20px] font-bold text-[#0b4fc9]">Quick Search</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{QUICK.map(field)}</div>
            <h2 className="mt-6 mb-3 text-[20px] font-bold text-[#0b4fc9]">Advance Search</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{ADVANCED.map(field)}</div>
            <div className="mt-5 flex justify-end gap-2">
                <NmButton className="w-36" onClick={clear}>
                    Clear
                </NmButton>
                <NmButton className="w-36" onClick={search} disabled={loading}>
                    {loading ? 'Searching…' : 'Search Claims'}
                </NmButton>
            </div>

            {rows ? (
                <Card className="mt-5 overflow-hidden">
                    <NmTable
                        blue
                        rows={rows}
                        empty="No claims match this search"
                        columns={[
                            { key: 'id', title: 'Claim ID', render: (r) => r.claimNo || r.id },
                            { key: 'policyNo', title: 'Policy No', render: (r) => r.policyNo || '—' },
                            { key: 'insuredName', title: 'Insured Name', render: (r) => r.insuredName || '—' },
                            { key: 'vehicleNo', title: 'Vehicle Number', render: (r) => r.vehicleNo || '—' },
                            { key: 'at', title: 'Intimated On', render: (r) => fmtDate(r.intimatedAt) },
                            { key: 'stage', title: 'Stage', render: (r) => <StatusPill value={r.stageLabel} tone="blue" className="whitespace-nowrap" /> },
                            {
                                key: 'view',
                                title: 'Action',
                                render: (r) => (
                                    <button type="button" onClick={() => openClaim(r)} aria-label={`View ${r.id}`} className="inline-flex items-center gap-1 font-medium text-[#0b4fc9]">
                                        View <EyeOutlined />
                                    </button>
                                ),
                            },
                        ]}
                    />
                </Card>
            ) : null}
        </div>
    );
}
