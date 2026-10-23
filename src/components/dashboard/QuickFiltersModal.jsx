import { useEffect, useState } from 'react';
import { Button, DatePicker, Modal, Select } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

function Label({ children }) {
    return <span className="mb-1.5 block text-[12px] font-semibold text-slate-900">{children}</span>;
}

/**
 * "Quick Filters" popup of the dashboards. `value` = { from, to, source,
 * priority, location, insurer } (strings; from/to = YYYY-MM-DD); `options`
 * comes from GET /dashboard (filterOptions).
 */
export default function QuickFiltersModal({ open, value, options, onApply, onClose }) {
    const [draft, setDraft] = useState(value);
    useEffect(() => {
        if (open) setDraft(value);
    }, [open, value]);

    const all = (label, list = []) => [{ label: `All ${label}`, value: '' }, ...list.map((v) => ({ label: v, value: v }))];
    const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v || '' }));

    return (
        <Modal open={open} onCancel={onClose} footer={null} width={720} title={<span className="text-[15px] font-bold">Quick Filters</span>} destroyOnHidden>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 pt-2 sm:grid-cols-2">
                <div>
                    <Label>Date Range</Label>
                    <RangePicker
                        className="w-full"
                        format="DD MMM YYYY"
                        value={draft.from && draft.to ? [dayjs(draft.from), dayjs(draft.to)] : null}
                        onChange={(r) => setDraft((d) => ({ ...d, from: r ? r[0].format('YYYY-MM-DD') : '', to: r ? r[1].format('YYYY-MM-DD') : '' }))}
                    />
                </div>
                <div>
                    <Label>Source</Label>
                    <Select className="w-full" value={draft.source || ''} options={all('Sources', options?.sources)} onChange={set('source')} />
                </div>
                <div>
                    <Label>Priorty</Label>
                    <Select className="w-full" value={draft.priority || ''} options={all('Priorty', options?.priorities)} onChange={set('priority')} />
                </div>
                <div>
                    <Label>Location</Label>
                    <Select className="w-full" value={draft.location || ''} options={all('Location', options?.locations)} onChange={set('location')} showSearch />
                </div>
                <div>
                    <Label>Insurers</Label>
                    <Select className="w-full" value={draft.insurer || ''} options={all('Insurers', options?.insurers)} onChange={set('insurer')} showSearch />
                </div>
            </div>
            <div className="mt-5 flex gap-3">
                <Button onClick={() => onApply({ from: '', to: '', source: '', priority: '', location: '', insurer: '' })}>Clear</Button>
                <Button type="primary" block icon={<FilterOutlined />} onClick={() => onApply(draft)}>
                    Apply Filters
                </Button>
            </div>
        </Modal>
    );
}

export const EMPTY_FILTERS = { from: '', to: '', source: '', priority: '', location: '', insurer: '' };

/** Query-string pairs of the active filters. */
export const filterParams = (f) => Object.fromEntries(Object.entries(f).filter(([, v]) => v));
