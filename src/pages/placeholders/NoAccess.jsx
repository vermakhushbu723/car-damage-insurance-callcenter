import { LockOutlined } from '@ant-design/icons';

import { useAppState } from '../../context/AppContext.jsx';

/** Shown when the user's role (Admin > Roles & Permissions) cannot view this screen. */
export default function NoAccess({ title }) {
    const { user } = useAppState();
    return (
        <div className="flex flex-col gap-4">
            <h1 className="mb-0 text-[18px] leading-6 font-bold text-slate-900">{title}</h1>
            <section className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white px-6 py-20 text-center shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-[17px] text-amber-600">
                    <LockOutlined />
                </span>
                <p className="mt-2 mb-0 text-[12.5px] font-semibold text-slate-800">No access</p>
                <p className="mb-0 text-[11.5px] text-slate-500">
                    Your role ({user?.roleName ?? '—'}) cannot open {title}. Ask your admin to change it in Roles &amp; Permissions.
                </p>
            </section>
        </div>
    );
}
