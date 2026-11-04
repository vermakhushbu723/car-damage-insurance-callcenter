import { useState } from 'react';
import { App, Avatar, Dropdown, Form, Input, Modal, Tooltip } from 'antd';
import { CloseOutlined, DownOutlined, UserOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

import { changePassword, logout, switchRole } from '../../auth/session.js';
import { NM_NAV, landingForUser } from '../../constants/nationalManager.js';
import ROUTES from '../../constants/routes.js';
import { useAppState } from '../../context/AppContext.jsx';
import { errText, fmtDateTime } from '../../utils/format.js';
import cn from '../../utils/cn.js';

export const NM_SIDEBAR_WIDTH = 232;
export const NM_SIDEBAR_COLLAPSED_WIDTH = 60;

/** Change Password dialog of the profile menu; uses the portal's real endpoint. */
function ChangePasswordModal({ open, onClose }) {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [busy, setBusy] = useState(false);

    const submit = async ({ currentPassword, newPassword }) => {
        setBusy(true);
        try {
            await changePassword(currentPassword, newPassword);
            message.success('Password changed');
            form.resetFields();
            onClose();
        } catch (err) {
            message.error(errText(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Modal open={open} title="Change Password" okText="Change Password" confirmLoading={busy} onOk={() => form.submit()} onCancel={onClose} destroyOnHidden>
            <Form form={form} layout="vertical" onFinish={submit} preserve={false}>
                <Form.Item name="currentPassword" label="Current Password" rules={[{ required: true, message: 'Enter your current password' }]}>
                    <Input.Password autoComplete="current-password" />
                </Form.Item>
                <Form.Item name="newPassword" label="New Password" rules={[{ required: true, message: 'Enter a new password' }]}>
                    <Input.Password autoComplete="new-password" />
                </Form.Item>
            </Form>
        </Modal>
    );
}

/** Rail of the National Manager: sections, then the profile card with its menu. */
export default function NmSidebar({ collapsed = false, onNavigate, onClose }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { message, modal } = App.useApp();
    const { user } = useAppState();
    const [passwordOpen, setPasswordOpen] = useState(false);
    const roles = user?.roles ?? [];

    const go = (path) => {
        navigate(path);
        onNavigate?.();
    };
    const isActive = (path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));

    const changeRole = async (roleKey) => {
        if (roleKey === user.roleKey) return;
        try {
            const next = await switchRole(roleKey);
            message.success(`Switched to ${next.roleName}`);
            navigate(landingForUser(next), { replace: true });
        } catch (err) {
            message.error(errText(err));
        }
    };

    const menu = {
        items: [
            { key: 'profile', label: 'My Profile' },
            { key: 'password', label: 'Change Password' },
            ...(roles.length > 1
                ? [{ key: 'switch', label: 'Switch Role', children: roles.map((r) => ({ key: `role:${r.roleKey}`, label: r.roleName })) }]
                : [{ key: 'switch', label: 'Switch Role', disabled: true }]),
            { key: 'last', label: 'Last Login' },
            { key: 'logout', label: 'Log Out' },
        ],
        onClick: ({ key }) => {
            if (key.startsWith('role:')) return changeRole(key.slice(5));
            if (key === 'profile') return go(ROUTES.myAccount);
            if (key === 'password') return setPasswordOpen(true);
            if (key === 'last') {
                return modal.info({ title: 'Last Login', content: user?.lastLogin ? fmtDateTime(user.lastLogin) : 'Not available', okText: 'Close' });
            }
            logout();
            return navigate('/login', { replace: true });
        },
    };

    return (
        <aside
            style={{ width: collapsed ? NM_SIDEBAR_COLLAPSED_WIDTH : NM_SIDEBAR_WIDTH }}
            className="flex h-full shrink-0 flex-col bg-[#0b4fc9] text-white transition-[width] duration-200"
        >
            {onClose ? (
                <div className="flex justify-end px-3 pt-3">
                    <button type="button" aria-label="Close menu" onClick={onClose} className="text-white/80 hover:text-white">
                        <CloseOutlined />
                    </button>
                </div>
            ) : null}

            {!collapsed ? (
                <div className="flex justify-end px-3 pt-3 pb-1">
                    <button
                        type="button"
                        onClick={() => go(ROUTES.intimation)}
                        className="rounded-md border border-white/70 px-2 py-1 text-[10.5px] font-medium whitespace-nowrap hover:bg-white/10"
                    >
                        + Add More
                    </button>
                </div>
            ) : null}

            <nav className={cn('flex-1 overflow-x-hidden overflow-y-auto pb-2', collapsed && 'px-2 pt-2')} aria-label="National Manager">
                {NM_NAV.map((group) => (
                    <div key={group.section}>
                        {!collapsed ? <p className="m-0 px-3 pt-3 pb-1 text-[10.5px] font-semibold tracking-wide text-white/90">{group.section}</p> : null}
                        {group.items.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            const btn = (
                                <button
                                    key={item.key}
                                    type="button"
                                    aria-current={active ? 'page' : undefined}
                                    onClick={() => go(item.path)}
                                    className={cn(
                                        'flex w-full items-center text-left text-[13px] font-medium transition',
                                        collapsed ? 'justify-center rounded-lg py-2.5' : 'gap-3 rounded-r-lg border-l-[3px] py-2 pr-3 pl-5',
                                        active ? 'border-white bg-[#3f74dc]' : 'border-transparent hover:bg-white/10'
                                    )}
                                >
                                    <Icon className="text-[15px]" />
                                    {!collapsed ? <span className="truncate">{item.label}</span> : null}
                                </button>
                            );
                            return collapsed ? (
                                <Tooltip key={item.key} title={item.label} placement="right">
                                    {btn}
                                </Tooltip>
                            ) : (
                                btn
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div className="p-2">
                <Dropdown menu={menu} trigger={['click']} placement="topLeft">
                    <button type="button" aria-label="Profile menu" className="flex w-full items-center gap-2 rounded-lg border border-white/30 bg-white/15 px-2 py-1.5 text-left hover:bg-white/20">
                        <Avatar size={30} icon={<UserOutlined />} className="shrink-0 !bg-white/85 !text-[#0b4fc9]" />
                        {!collapsed ? (
                            <>
                                <span className="min-w-0 flex-1 leading-tight">
                                    <span className="block truncate text-[12.5px] font-semibold">{user?.name ?? 'User'}</span>
                                    <span className="block truncate text-[9.5px] text-white/85">{user?.email ?? user?.userId ?? ''}</span>
                                </span>
                                <DownOutlined className="text-[9px]" />
                            </>
                        ) : null}
                    </button>
                </Dropdown>
            </div>

            <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
        </aside>
    );
}
