import DynamicField from './DynamicField.jsx';
import cn from '../../utils/cn.js';

/** Grid per `section.columns`, and the class a `full` field spans with. */
const GRID = {
    2: { cols: 'sm:grid-cols-2', full: 'sm:col-span-2' },
    3: { cols: 'sm:grid-cols-3', full: 'sm:col-span-3' },
    6: { cols: 'sm:grid-cols-6', full: 'sm:col-span-6' },
};
/** `field.span` (columns of a 6-column section). */
const SPAN = { 2: 'sm:col-span-2', 3: 'sm:col-span-3' };

/** Renders one config section as a responsive field grid. */
export default function FormSection({ section, values, onChange }) {
    const grid = GRID[section.columns] || GRID[2];

    return (
        <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
            <h3 className="mb-3 text-[13.5px] font-bold text-[#1450d8]">{section.title}</h3>

            <div className={cn('grid grid-cols-1 gap-x-5 gap-y-3.5', grid.cols)}>
                {section.fields.map((field, index) => (
                    <div
                        key={field.name || `spacer-${index}`}
                        className={cn(field.full ? grid.full : SPAN[field.span], field.rowSpan && 'sm:row-span-2')}
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
