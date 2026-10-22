import dayjs from 'dayjs';

/** "01 May 2025" */
export const fmtDate = (iso) => (iso ? dayjs(iso).format('DD MMM YYYY') : '—');
/** "01 May 2025, 10:45 AM" */
export const fmtDateTime = (iso) => (iso ? dayjs(iso).format('DD MMM YYYY, hh:mm A') : '—');
/** "01 May, 10:45 AM" */
export const fmtShort = (iso) => (iso ? dayjs(iso).format('DD MMM, hh:mm A') : '');
/** Indian grouping, no decimals. */
export const formatINR = (value) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(Number(value) || 0));
/** Indian grouping, 2 decimals. */
export const money = (value) => (Number(value) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** "1.2 MB" */
export const fileSize = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round((bytes || 0) / 1024))} KB`);
/** Message of an API error for a toast. */
export const errText = (err) => err?.message || 'Something went wrong.';
