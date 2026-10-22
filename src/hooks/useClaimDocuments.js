import { useCallback, useEffect, useState } from 'react';
import { App } from 'antd';

import { api, uploadFile } from '../api/client.js';
import { errText } from '../utils/format.js';

const MAX_MB = 10;
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

/**
 * Documents DMS of one claim: { types, files, pending } from the API plus
 * upload(type, file). Used by the DMS screen, the DMS side panel and the
 * claim-details viewer.
 */
export default function useClaimDocuments(claimId) {
    const { message } = App.useApp();
    const [state, setState] = useState(null);
    const [uploading, setUploading] = useState(0);

    const reload = useCallback(async () => {
        if (!claimId) {
            setState(null);
            return;
        }
        try {
            setState(await api.get(`/claims/${encodeURIComponent(claimId)}/documents`));
        } catch (err) {
            if (err.status !== 403) message.error(errText(err));
            setState({ types: [], files: [], pending: [], denied: err.status === 403 });
        }
    }, [claimId, message]);

    useEffect(() => {
        reload();
    }, [reload]);

    /** Uploads one file; `id` lets the caller upload before a claim exists (it passes the new id). */
    const upload = useCallback(
        async (type, file, id = claimId) => {
            if (!ACCEPT.includes(file.type)) {
                message.error(`${file.name}: only JPG, PNG, WEBP or PDF.`);
                return null;
            }
            if (file.size > MAX_MB * 1024 * 1024) {
                message.error(`${file.name}: larger than ${MAX_MB} MB.`);
                return null;
            }
            setUploading((n) => n + 1);
            try {
                const res = await uploadFile(`/claims/${encodeURIComponent(id)}/documents/${type}`, file);
                setState({ types: res.types, files: res.files, pending: res.pending });
                message.success(`${file.name} uploaded`);
                return res.document;
            } catch (err) {
                message.error(`${file.name}: ${errText(err)}`);
                return null;
            } finally {
                setUploading((n) => n - 1);
            }
        },
        [claimId, message]
    );

    return { state, reload, upload, uploading: uploading > 0 };
}

/** Opens the browser's file picker; resolves with the chosen files. */
export function pickFiles({ multiple = false, accept = ACCEPT.join(',') } = {}) {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.multiple = multiple;
        input.onchange = () => resolve([...(input.files ?? [])]);
        input.click();
    });
}
