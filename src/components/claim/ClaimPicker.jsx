import { useEffect, useState } from 'react';
import { Select } from 'antd';

import { api } from '../../api/client.js';
import { useAppState } from '../../context/AppContext.jsx';

/**
 * Switch the active claim from any claim screen. Claims waiting at this
 * screen's step (`stage`) are listed first ("Pending here").
 */
export default function ClaimPicker({ stage, className = 'w-[280px]' }) {
    const { claimId, selectClaim } = useAppState();
    const [rows, setRows] = useState([]);

    useEffect(() => {
        api.get('/claims?pageSize=100')
            .then((d) => setRows(d.rows))
            .catch(() => setRows([]));
    }, [claimId]);

    const label = (r) => `${r.claimNo} · ${r.insuredName ?? '—'} · ${r.status === 'Draft' ? 'Draft' : r.stageLabel}`;
    const here = rows.filter((r) => stage && r.stage === stage && r.status !== 'Draft');
    const rest = rows.filter((r) => !here.includes(r));
    const options = [
        ...(here.length ? [{ label: `Pending here (${here.length})`, options: here.map((r) => ({ label: label(r), value: r.id })) }] : []),
        { label: here.length ? 'Other claims' : 'Claims', options: rest.map((r) => ({ label: label(r), value: r.id })) },
    ];

    return (
        <Select
            showSearch
            className={className}
            placeholder="Select a claim"
            value={rows.some((r) => r.id === claimId) ? claimId : undefined}
            options={options}
            optionFilterProp="label"
            popupMatchSelectWidth={false}
            onChange={(id) => selectClaim(id)}
        />
    );
}
