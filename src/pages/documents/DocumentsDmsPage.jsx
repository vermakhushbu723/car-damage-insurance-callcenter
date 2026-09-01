import { useState } from 'react';
import { App, Button, Upload } from 'antd';
import {
    ArrowLeftOutlined,
    BookOutlined,
    CheckCircleOutlined,
    CloudUploadOutlined,
    DownloadOutlined,
    ExperimentOutlined,
    FileTextOutlined,
    InfoCircleOutlined,
    LoadingOutlined,
    SyncOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { DMS_CLAIM_BAR, DMS_TABS, DOCUMENT_TYPES, UPLOADED_FILES } from '../../data/documentsData.js';
import { getIcon } from '../../components/common/iconRegistry.jsx';
import ROUTES from '../../constants/routes.js';
import cn from '../../utils/cn.js';

const { Dragger } = Upload;

const TAB_ICONS = {
    file: FileTextOutlined,
    book: BookOutlined,
    experiment: ExperimentOutlined,
    info: InfoCircleOutlined,
};

export default function DocumentsDmsPage() {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const [tab, setTab] = useState('documents');
    const [documents, setDocuments] = useState(DOCUMENT_TYPES.map((doc) => ({ ...doc })));
    const [files, setFiles] = useState(UPLOADED_FILES.map((file) => ({ ...file })));

    const markUploaded = (key) => {
        setDocuments((list) =>
            list.map((doc) => (doc.key === key ? { ...doc, status: 'uploaded' } : doc))
        );
        message.success('Document uploaded');
    };

    const pendingCount = documents.filter((doc) => doc.status === 'pending').length;

    return (
        <div className="flex flex-col gap-4">
            <section className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-slate-50 px-5 py-4">
                <button
                    type="button"
                    onClick={() => navigate(ROUTES.claimDetails)}
                    className="flex items-center gap-2 text-[13px] font-semibold text-slate-800 hover:text-[#1450d8]"
                >
                    <ArrowLeftOutlined /> Back
                </button>
                {DMS_CLAIM_BAR.map((item) => (
                    <span
                        key={item.key}
                        className="border-l border-slate-300 pl-6 text-[13px] font-semibold text-slate-800"
                    >
                        {item.label ? `${item.label}: ` : ''}
                        {item.value}
                    </span>
                ))}
            </section>

            <section className="flex flex-wrap gap-8 rounded-xl bg-slate-50 px-5 py-4">
                {DMS_TABS.map((item) => {
                    const Icon = TAB_ICONS[item.icon] || FileTextOutlined;
                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setTab(item.key)}
                            className={cn(
                                'flex items-center gap-2 text-[13.5px] font-semibold transition',
                                item.key === tab ? 'text-[#1450d8]' : 'text-slate-700 hover:text-[#1450d8]'
                            )}
                        >
                            <Icon /> {item.label}
                        </button>
                    );
                })}
            </section>

            {tab === 'documents' ? (
                <>
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
                        <div>
                            <h2 className="mb-1 text-[14.5px] font-bold text-[#1450d8]">Upload Documents</h2>
                            <p className="mb-3 text-[12.5px] font-semibold text-slate-800">
                                Upload Requerd Documents For This Claim
                            </p>

                            <Dragger
                                multiple
                                beforeUpload={(file) => {
                                    setFiles((list) => [
                                        ...list,
                                        {
                                            key: `${file.name}-${Date.now()}`,
                                            name: file.name,
                                            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                                            progress: 100,
                                        },
                                    ]);
                                    return false;
                                }}
                                showUploadList={false}
                                className="!rounded-lg !border-slate-200 !bg-white !py-16"
                            >
                                <p className="!mb-2 text-[20px] text-slate-700">
                                    <CloudUploadOutlined />
                                </p>
                                <p className="!mb-1 text-[11.5px] text-slate-600">Drag &amp; Drop Files Here</p>
                                <p className="!mb-3 text-[11.5px] text-slate-600">Or</p>
                                <span className="inline-flex rounded-md bg-[#c6d5f5] px-4 py-1.5 text-[11.5px] font-semibold text-[#1450d8]">
                                    Browse Files
                                </span>
                            </Dragger>
                        </div>

                        <div>
                            <h2 className="mb-3 text-[14.5px] font-bold text-[#1450d8]">Document Type</h2>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {documents.map((doc) => {
                                    const Icon = getIcon(doc.icon);
                                    return (
                                        <div
                                            key={doc.key}
                                            className="rounded-xl border border-slate-200 bg-white px-4 py-4"
                                        >
                                            <div className="mb-3 flex items-center gap-3">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#dce6fb] text-[13px] text-[#1450d8]">
                                                    <Icon />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block text-[12px] font-bold text-[#1450d8]">
                                                        {doc.code}
                                                    </span>
                                                    <span className="block text-[11.5px] text-slate-700">
                                                        {doc.label}
                                                    </span>
                                                </span>
                                            </div>

                                            {doc.status !== 'none' ? (
                                                <span
                                                    className={cn(
                                                        'mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold',
                                                        doc.status === 'uploaded'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-orange-100 text-orange-600'
                                                    )}
                                                >
                                                    {doc.status === 'uploaded' ? (
                                                        <CheckCircleOutlined />
                                                    ) : (
                                                        <LoadingOutlined />
                                                    )}
                                                    {doc.status === 'uploaded' ? 'Uploaded' : 'Pending'}
                                                </span>
                                            ) : null}

                                            {doc.status === 'uploaded' ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => message.success(`${doc.code} downloaded`)}
                                                        className="flex items-center justify-center gap-1.5 rounded-md bg-[#c6d5f5] py-2 text-[11.5px] font-medium text-[#1450d8]"
                                                    >
                                                        <DownloadOutlined /> Download
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => message.info(`Replace ${doc.code}`)}
                                                        className="flex items-center justify-center gap-1.5 rounded-md bg-[#c6d5f5] py-2 text-[11.5px] font-medium text-[#1450d8]"
                                                    >
                                                        <SyncOutlined /> Replace
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => markUploaded(doc.key)}
                                                    className="flex w-full items-center justify-center gap-1.5 rounded-md bg-[#c6d5f5] py-2 text-[11.5px] font-medium text-[#1450d8]"
                                                >
                                                    <UploadOutlined /> Upload
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="mb-3 text-[14.5px] font-bold text-[#1450d8]">
                            Uploaded Files ({files.length})
                        </h2>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {files.map((file) => (
                                <div key={file.key} className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                                    <p className="mb-0.5 text-[14px] font-bold text-[#1450d8]">{file.name}</p>
                                    <p className="mb-4 text-[11.5px] font-semibold text-slate-700">{file.size}</p>
                                    <div className="flex items-center gap-3">
                                        <span className="h-2 flex-1 rounded-full bg-slate-200">
                                            <span
                                                style={{ width: `${file.progress}%` }}
                                                className="block h-2 rounded-full bg-emerald-500"
                                            />
                                        </span>
                                        <span className="text-[11.5px] font-semibold text-slate-700">
                                            {file.progress}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-3">
                        <Button onClick={() => message.info('Upload cancelled')}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            onClick={() =>
                                pendingCount
                                    ? message.warning(`${pendingCount} document(s) still pending`)
                                    : message.success('Documents uploaded and processing')
                            }
                        >
                            Upload &amp; Processes
                        </Button>
                    </div>
                </>
            ) : (
                <section className="rounded-xl border border-slate-200 bg-white px-6 py-20 text-center">
                    <p className="mb-1 text-[13px] font-semibold text-slate-800">
                        {DMS_TABS.find((item) => item.key === tab)?.label}
                    </p>
                    <p className="mb-0 text-[11.5px] text-slate-500">Screen design pending.</p>
                </section>
            )}
        </div>
    );
}
