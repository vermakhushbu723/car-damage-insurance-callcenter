import { App, Upload } from 'antd';
import { CloudUploadOutlined, ReloadOutlined } from '@ant-design/icons';

import { DMS_DOCUMENTS, DOCUMENT_TONES, UPLOAD_HINT } from '../../config/dmsDocuments.js';
import { getIcon } from '../common/iconRegistry.jsx';
import cn from '../../utils/cn.js';

const { Dragger } = Upload;

/** Right-hand document rail on the intimation screen. */
export default function DmsDocumentsPanel({ documents = DMS_DOCUMENTS, onSelect }) {
    const { message } = App.useApp();

    return (
        <aside className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
            <header className="mb-3 flex items-center justify-between">
                <h2 className="text-[12.5px] font-bold text-slate-800">DMS Documents</h2>
                <button
                    type="button"
                    aria-label="Refresh documents"
                    onClick={() => message.success('Documents refreshed')}
                    className="text-slate-400 transition hover:text-[#1450d8]"
                >
                    <ReloadOutlined />
                </button>
            </header>

            <div className="grid grid-cols-3 gap-2.5">
                {documents.map((doc) => {
                    const Icon = getIcon(doc.icon);
                    return (
                        <button
                            key={doc.key}
                            type="button"
                            onClick={() => onSelect?.(doc)}
                            className={cn(
                                'flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border p-1.5 text-center transition hover:-translate-y-0.5 hover:shadow-sm',
                                DOCUMENT_TONES[doc.tone] || DOCUMENT_TONES.blue
                            )}
                        >
                            <Icon className="text-[14px]" />
                            <span className="text-[9px] leading-tight font-semibold">{doc.label}</span>
                        </button>
                    );
                })}
            </div>

            <Dragger
                multiple
                beforeUpload={() => false}
                onChange={(info) => message.info(`${info.fileList.length} file(s) ready to upload`)}
                className="!mt-3.5 !rounded-lg !border-dashed !border-[#b9cdf3] !bg-[#f4f8ff]"
            >
                <p className="!mb-1 text-[#1450d8]">
                    <CloudUploadOutlined className="text-lg" />
                </p>
                <p className="!mb-0.5 text-[11px] font-semibold text-[#1450d8]">{UPLOAD_HINT.title}</p>
                <p className="!mb-0 text-[9px] leading-tight text-slate-500">
                    {UPLOAD_HINT.subtitle}
                    <br />
                    {UPLOAD_HINT.support}
                </p>
            </Dragger>
        </aside>
    );
}
