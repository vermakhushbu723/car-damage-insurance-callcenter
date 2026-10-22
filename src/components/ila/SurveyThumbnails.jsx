import { fileUrl } from '../../api/client.js';
import cn from '../../utils/cn.js';

/** Strip of the claim's vehicle photos (Documents DMS) under the analysis viewer; red dot = damage found. */
export default function SurveyThumbnails({ images = [], activeKey, onSelect }) {
    if (!images.length) return null;
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {images.map((image, i) => (
                <button
                    key={image.id}
                    type="button"
                    onClick={() => onSelect?.(image.id)}
                    className={cn(
                        'relative overflow-hidden rounded-lg border-2 transition',
                        image.id === (activeKey ?? images[0]?.id) ? 'border-[#1450d8]' : 'border-slate-200 hover:border-slate-300'
                    )}
                >
                    <img src={fileUrl(image.url)} alt={image.name} className="h-[100px] w-full bg-slate-900 object-cover" />
                    {image.flagged ? <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" /> : null}
                    <span className="block truncate bg-slate-900/85 px-1.5 py-1 text-[9px] font-medium text-white">
                        IMG_{String(i + 1).padStart(3, '0')} - {image.name}
                    </span>
                </button>
            ))}
        </div>
    );
}
