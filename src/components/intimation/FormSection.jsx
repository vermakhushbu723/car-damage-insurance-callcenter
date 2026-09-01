import DynamicField from './DynamicField.jsx';
import cn from '../../utils/cn.js';

/** Renders one config section as a responsive field grid. */
export default function FormSection({ section, values, onChange }) {
    const columns = section.columns || 2;

    return (
        <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
            <h3 className="mb-3 text-[13.5px] font-bold text-[#1450d8]">{section.title}</h3>

            <div
                className={cn(
                    'grid grid-cols-1 gap-x-5 gap-y-3.5',
                    columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
                )}
            >
                {section.fields.map((field, index) => (
                    <div
                        key={field.name || `spacer-${index}`}
                        className={cn(
                            field.full && (columns === 3 ? 'sm:col-span-3' : 'sm:col-span-2'),
                            field.rowSpan && 'sm:row-span-2'
                        )}
                    >
                        <DynamicField
                            field={field}
                            value={values[field.name]}
                            values={values}
                            onChange={onChange}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
