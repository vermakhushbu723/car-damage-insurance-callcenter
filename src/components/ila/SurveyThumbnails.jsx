import { SURVEY_IMAGES } from '../../data/ilaData.js';
import SurveyPhoto from './SurveyPhoto.jsx';
import cn from '../../utils/cn.js';

/** Full-width strip of survey photographs under the analysis viewer. */
export default function SurveyThumbnails({ images = SURVEY_IMAGES, activeKey, onSelect }) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {images.slice(0, 5).map((image) => (
                <button
                    key={image.key}
                    type="button"
                    onClick={() => onSelect?.(image.key)}
                    className={cn(
                        'relative overflow-hidden rounded-lg border-2 transition',
                        image.key === activeKey
                            ? 'border-[#1450d8]'
                            : 'border-slate-200 hover:border-slate-300'
                    )}
                >
                    <SurveyPhoto className="h-[100px] w-full" />
                    {image.flagged ? (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                    ) : null}
                    <span className="block bg-slate-900/85 px-1.5 py-1 text-[9px] font-medium text-white">
                        {image.label}
                    </span>
                </button>
            ))}
        </div>
    );
}
