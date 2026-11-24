import { AutoComplete, Checkbox, DatePicker, Input, Radio, Select, TimePicker } from 'antd';
import { FileTextOutlined, SearchOutlined } from '@ant-design/icons';

import { fileUrl } from '../../api/client.js';
import { fileSize } from '../../utils/format.js';
import { INDIA_STATES, citiesOf, PIN_RE, pinInput } from '../../data/indiaLocations.js';

const STATE_OPTIONS = INDIA_STATES.map((s) => ({ label: s, value: s }));

const { TextArea } = Input;

/** Blue field caption shared by every control. */
function FieldLabel({ children }) {
    if (!children) return null;
    return <label className="mb-1.5 block text-[11px] font-medium text-[#1668e3]">{children}</label>;
}

/**
 * Placeholder that tells what to enter ("Enter Insured Name", "Select Make", "Select Date").
 * Config placeholders are kept only when they are instructions, never demo values.
 */
const INSTRUCTION = /^(enter|select|search|type|click|choose|upload|add|dd|hh)/i;
export function placeholderFor(field) {
    if (field.placeholder && INSTRUCTION.test(field.placeholder)) return field.placeholder;
    const label = String(field.label || field.name || '').replace(/\s*\*\s*$/, '').trim();
    if (['select', 'state', 'tags'].includes(field.type)) return label ? `Select ${label}` : 'Select';
    if (field.type === 'date') return 'Select Date';
    if (field.type === 'time') return 'Select Time';
    if (field.type === 'search') return label ? `Search ${label}` : 'Search';
    return label ? `Enter ${label}` : 'Enter';
}

/**
 * Renders one entry of a form config.
 * Controlled through `value` / `onChange` so the page owns all form state.
 */
export default function DynamicField({ field, value, onChange, values, documents }) {
    if (field.type === 'spacer') return <div aria-hidden className="hidden md:block" />;

    if (field.type === 'heading') {
        return <h4 className="mt-1 mb-0 text-[11.5px] font-semibold text-[#1668e3]">{field.label}</h4>;
    }

    if (field.type === 'static') {
        return (
            <div>
                <FieldLabel>{field.label}</FieldLabel>
                <p className="mb-0 text-[12px] font-bold text-slate-900">{field.value}</p>
            </div>
        );
    }

    const handle = (next) => onChange?.(field.name, next);
    const common = {
        placeholder: placeholderFor(field),
        disabled: field.disabled,
        size: 'middle',
        className: 'w-full',
    };

    const control = (() => {
        switch (field.type) {
            case 'state':
                return (
                    <Select
                        {...common}
                        value={value || undefined}
                        options={STATE_OPTIONS}
                        onChange={handle}
                        allowClear
                        showSearch={{ optionFilterProp: 'label' }}
                        placeholder={placeholderFor(field)}
                    />
                );
            case 'city': {
                // That state's cities; a city not in the list can still be typed.
                const state = values?.[field.stateField];
                const typed = String(value ?? '').toLowerCase();
                const list = citiesOf(state).filter((c) => !typed || c.toLowerCase().includes(typed)).map((c) => ({ value: c }));
                return (
                    <AutoComplete
                        {...common}
                        value={value || undefined}
                        options={list}
                        onChange={handle}
                        allowClear
                        placeholder={state ? placeholderFor({ ...field, type: 'select' }) : 'Select State first'}
                    />
                );
            }
            case 'pincode': {
                const bad = value && !PIN_RE.test(value);
                return (
                    <>
                        <Input
                            {...common}
                            value={value || ''}
                            inputMode="numeric"
                            maxLength={6}
                            status={bad ? 'error' : undefined}
                            placeholder={INSTRUCTION.test(field.placeholder || '') ? field.placeholder : 'Enter 6-digit Pincode'}
                            onChange={(event) => handle(pinInput(event.target.value))}
                        />
                        {bad ? <span className="mt-0.5 block text-[10.5px] text-red-500">Enter a valid 6-digit pincode</span> : null}
                    </>
                );
            }
            case 'select':
                return (
                    <Select
                        {...common}
                        value={value || undefined}
                        options={field.options}
                        onChange={handle}
                        allowClear
                    />
                );
            case 'date':
                return <DatePicker {...common} value={value || null} format="DD MMM YYYY" onChange={handle} />;
            case 'time':
                return <TimePicker {...common} value={value || null} format="hh:mm A" use12Hours onChange={handle} />;
            case 'textarea':
                return (
                    <TextArea
                        placeholder={placeholderFor(field)}
                        rows={field.rows || 4}
                        value={value || ''}
                        onChange={(event) => handle(event.target.value)}
                        className="!bg-[#f3f5f9]"
                        style={field.rowSpan ? { height: '100%', minHeight: 120 } : undefined}
                    />
                );
            case 'tags':
                return (
                    <Select
                        {...common}
                        mode="tags"
                        value={Array.isArray(value) ? value : value ? [value] : []}
                        onChange={handle}
                        open={false}
                        suffixIcon={null}
                        tokenSeparators={[',']}
                    />
                );
            case 'document': {
                const doc = documents?.[field.docType];
                return doc ? (
                    <a
                        href={fileUrl(doc.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-fit items-center gap-2 rounded-md bg-[#f3f5f9] px-3 py-2 text-[11px] text-slate-800 hover:text-[#1450d8]"
                    >
                        <FileTextOutlined />
                        <span>
                            <span className="block font-medium">{doc.name}</span>
                            <span className="block text-[10px] text-slate-500">{fileSize(doc.size)}</span>
                        </span>
                    </a>
                ) : (
                    <span className="block rounded-md bg-[#f3f5f9] px-3 py-2 text-[11px] text-slate-500">Not uploaded (Documents DMS &gt; Estimate)</span>
                );
            }
            case 'search':
                return (
                    <Input
                        {...common}
                        value={value || ''}
                        suffix={<SearchOutlined className="text-slate-400" />}
                        onChange={(event) => handle(event.target.value)}
                    />
                );
            case 'radio':
                return (
                    <Radio.Group
                        value={value}
                        disabled={field.disabled}
                        onChange={(event) => handle(event.target.value)}
                        className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2"
                    >
                        {field.options.map((option) => (
                            <Radio key={option.value} value={option.value} className="!mr-0 text-[11.5px]">
                                {option.label}
                            </Radio>
                        ))}
                    </Radio.Group>
                );
            case 'checkbox':
                return (
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                        <Checkbox.Group
                            value={value || []}
                            onChange={handle}
                            className="flex flex-wrap gap-x-5 gap-y-2"
                        >
                            {field.options.map((option) => (
                                <Checkbox key={option.value} value={option.value} className="!ml-0 text-[11.5px]">
                                    {option.label}
                                </Checkbox>
                            ))}
                        </Checkbox.Group>
                        {field.extraInput ? (
                            <Input
                                placeholder={placeholderFor(field.extraInput)}
                                value={values?.[field.extraInput.name] || ''}
                                onChange={(event) => onChange?.(field.extraInput.name, event.target.value)}
                                className="w-[120px]"
                            />
                        ) : null}
                    </div>
                );
            default:
                return (
                    <Input {...common} value={value || ''} onChange={(event) => handle(event.target.value)} />
                );
        }
    })();

    return (
        <div className={field.rowSpan ? 'flex h-full flex-col' : ''}>
            <FieldLabel>{field.label}</FieldLabel>
            <div className={field.rowSpan ? 'flex-1' : ''}>{control}</div>
        </div>
    );
}
