import { Avatar, Tooltip } from 'antd';
import { LogoutOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons';
import { NavLink, useNavigate } from 'react-router-dom';

import { TOP_NAV_ITEMS } from '../../constants/navigation.js';
import { logout } from '../../auth/session.js';
import { useAppState } from '../../context/AppContext.jsx';
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

/** Blue application bar that sits above the rail. */
export default function TopBar({ onMenuClick }) {
    const navigate = useNavigate();
    const { user } = useAppState();

    const signOut = () => {
        logout();
        navigate('/login', { replace: true });
    };

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
                    <Logo />
                </button>

                <nav className="ml-auto hidden items-center gap-2 lg:flex">
                    {TOP_NAV_ITEMS.map((item) => (
                        <NavPill key={item.key} item={item} />
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-2 lg:ml-4">
                    <button
                        type="button"
                        aria-label="Logout"
                        title="Logout"
                        onClick={signOut}
                        className="hidden h-8 w-8 items-center justify-center rounded-full bg-white/85 text-[#1450d8] transition hover:bg-white sm:flex"
                    >
                        <LogoutOutlined />
                    </button>
                    <Tooltip title={user ? `${user.roleName}${user.agentCode ? ` · ${user.agentCode}` : ''} · ${user.userId}` : ''}>
                        <div className="flex items-center gap-2 text-white">
                            <Avatar size={28} icon={<UserOutlined />} className="bg-white/85 !text-[#1450d8]" />
                            <span className="hidden pr-2 text-[12.5px] font-semibold whitespace-nowrap sm:inline">
                                {user?.name ?? 'User'}
                            </span>
                        </div>
                    </Tooltip>
                </div>
            </div>
        </header>
    );
}
