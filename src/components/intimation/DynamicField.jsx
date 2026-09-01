import { Checkbox, DatePicker, Input, Radio, Select, TimePicker } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { TextArea } = Input;

/** Blue field caption shared by every control. */
function FieldLabel({ children }) {
    if (!children) return null;
    return <label className="mb-1.5 block text-[11px] font-medium text-[#1668e3]">{children}</label>;
}

/**
 * Renders one entry of a form config.
 * Controlled through `value` / `onChange` so the page owns all form state.
 */
export default function DynamicField({ field, value, onChange, values }) {
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
        placeholder: field.placeholder,
        disabled: field.disabled,
        size: 'middle',
        className: 'w-full',
    };

    const control = (() => {
        switch (field.type) {
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
                        placeholder={field.placeholder}
                        rows={field.rows || 4}
                        value={value || ''}
                        onChange={(event) => handle(event.target.value)}
                        className="!bg-[#f3f5f9]"
                        style={field.rowSpan ? { height: '100%', minHeight: 120 } : undefined}
                    />
                );
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
                                placeholder={field.extraInput.placeholder}
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
