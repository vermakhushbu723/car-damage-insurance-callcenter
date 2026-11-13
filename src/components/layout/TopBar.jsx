import { App, Avatar, Dropdown, Tooltip } from 'antd';
import { BellOutlined, CheckOutlined, DownOutlined, FilterOutlined, LogoutOutlined, MenuOutlined, SwapOutlined, UserOutlined } from '@ant-design/icons';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import { TOP_NAV_ITEMS } from '../../constants/navigation.js';
import { logout, switchRole } from '../../auth/session.js';
import { useAppState } from '../../context/AppContext.jsx';
import { isApprover, isClaimHandler, isNationalManager, landingForUser } from '../../constants/nationalManager.js';
import ROUTES from '../../constants/routes.js';
import { goToRole, loginUrl } from '../../portal.js';
import Logo from '../common/Logo.jsx';

function NavPill({ item }) {
    const Icon = item.icon;
    return (
        <NavLink
            to={item.path}
            className="flex items-center gap-2 rounded-full px-1 py-1 text-white transition hover:bg-white/15"
        >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-[#1450d8]">
                <Icon className="text-[12.5px]" />
            </span>
            <span className="pr-2 text-[12.5px] font-semibold whitespace-nowrap">{item.label}</span>
        </NavLink>
    );
}

/**
 * Profile menu (next to the bell): name + active role, the user's roles to switch
 * to (a user created with several roles), My Account and Log Out.
 */
function profileMenuOf(user, roles, { onRole, onAccount, onLogout }) {
    const roleItems = roles.length > 1
        ? [{
            type: 'group',
            label: 'Switch Role',
            children: roles.map((r) => ({
                key: `role:${r.roleKey}`,
                label: r.roleName,
                icon: r.roleKey === user?.roleKey ? <CheckOutlined className="text-[#1450d8]" /> : <SwapOutlined className="opacity-40" />,
            })),
        }]
        : [{ key: 'role-only', disabled: true, label: `Role: ${user?.roleName ?? '—'}` }];
    return {
        selectable: true,
        selectedKeys: user ? [`role:${user.roleKey}`] : [],
        items: [
            {
                key: 'who',
                disabled: true,
                label: (
                    <div className="py-0.5 leading-tight">
                        <div className="text-[13px] font-semibold text-slate-800">{user?.name ?? 'User'}</div>
                        <div className="text-[11px] text-slate-500">{user?.roleName}{user?.userId ? ` · ${user.userId}` : ''}</div>
                    </div>
                ),
            },
            { type: 'divider' },
            ...roleItems,
            { type: 'divider' },
            { key: 'account', icon: <UserOutlined />, label: 'My Account' },
            { key: 'logout', icon: <LogoutOutlined />, label: 'Log Out', danger: true },
        ],
        onClick: ({ key }) => {
            if (key.startsWith('role:')) return onRole(key.slice(5));
            if (key === 'account') return onAccount();
            if (key === 'logout') return onLogout();
            return undefined;
        },
    };
}

/** Blue application bar that sits above the rail. */
export default function TopBar({ onMenuClick }) {
    const navigate = useNavigate();
    const { user } = useAppState();
    const { message } = App.useApp();
    const roles = user?.roles ?? [];

    /** Works in another role: new session, then that role's dashboard. */
    const changeRole = async (key) => {
        if (key === user.roleKey) return;
        try {
            const next = await switchRole(key);
            message.success(`Switched to ${next.roleName}`);
            goToRole(navigate, { role: next.roleKey, id: next.id }, landingForUser(next));
        } catch (err) {
            message.error(err.message);
        }
    };

    const signOut = () => {
        logout();
        window.location.assign(loginUrl());
    };

    const { pathname } = useLocation();
    const profileMenu = profileMenuOf(user, roles, { onRole: changeRole, onAccount: () => navigate(ROUTES.myAccount), onLogout: signOut });

    // Claim Handler and SCM / RCM dashboards (Figma): title + filter, bell and profile only.
    const dashboardTitle = isClaimHandler(user) ? 'Claim Handler Dashboard (Processing)' : isApprover(user) ? 'SCM / RCM & Approver Dashboards' : null;
    if (dashboardTitle && pathname === ROUTES.dashboard) {
        const round = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/85 text-slate-700 transition hover:bg-white';
        return (
            <header className="sticky top-0 z-40 bg-[#83a2e3]">
                <div className="flex h-[64px] items-center gap-3 px-3 sm:px-5">
                    <button type="button" aria-label="Toggle menu" onClick={onMenuClick} className={round}>
                        <MenuOutlined />
                    </button>
                    <h1 className="m-0 min-w-0 flex-1 truncate text-[16px] font-semibold text-white sm:text-[18px]">{dashboardTitle}</h1>
                    <button type="button" aria-label="Quick filters" onClick={() => navigate('?quickFilters=1')} className={round}>
                        <FilterOutlined />
                    </button>
                    <Tooltip title="Notifications are not connected yet">
                        <button type="button" aria-label="Notifications" className={round}>
                            <BellOutlined />
                        </button>
                    </Tooltip>
                    <Dropdown menu={profileMenu} trigger={['click']} placement="bottomRight">
                        <button type="button" aria-label="Profile menu" title={user ? `${user.name} · ${user.roleName}` : 'Profile'} className={round}>
                            <UserOutlined />
                        </button>
                    </Dropdown>
                </div>
            </header>
        );
    }

    return (
        <header className="sticky top-0 z-40 bg-[#83a2e3]">
            <div className="flex h-[54px] items-center gap-3 px-3 sm:px-5">
                <button
                    type="button"
                    aria-label="Toggle menu"
                    onClick={onMenuClick}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/85 text-[#1450d8] transition hover:bg-white"
                >
                    <MenuOutlined />
                </button>

                <button type="button" onClick={() => navigate('/')} className="shrink-0 cursor-pointer">
                    <Logo subtitle={isNationalManager(user) ? user.roleName : undefined} />
                </button>

                <nav className="ml-auto hidden items-center gap-2 lg:flex">
                    {TOP_NAV_ITEMS.map((item) => (
                        <NavPill key={item.key} item={item} />
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-2 lg:ml-4">
                    <Tooltip title="Notifications are not connected yet">
                        <button
                            type="button"
                            aria-label="Notifications"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-[#1450d8] transition hover:bg-white"
                        >
                            <BellOutlined />
                        </button>
                    </Tooltip>
                    <Dropdown menu={profileMenu} trigger={['click']} placement="bottomRight">
                        <button
                            type="button"
                            aria-label="Profile menu"
                            className="flex items-center gap-2 rounded-full py-0.5 pr-2 pl-0.5 text-white transition hover:bg-white/15"
                        >
                            <Avatar size={28} icon={<UserOutlined />} className="bg-white/85 !text-[#1450d8]" />
                            <span className="hidden text-left leading-tight sm:block">
                                <span className="block text-[12.5px] font-semibold whitespace-nowrap">{user?.name ?? 'User'}</span>
                                <span className="block text-[10.5px] whitespace-nowrap text-white/85">{user?.roleName}</span>
                            </span>
                            <DownOutlined className="text-[9px]" />
                        </button>
                    </Dropdown>
                </div>
            </div>
        </header>
    );
}
