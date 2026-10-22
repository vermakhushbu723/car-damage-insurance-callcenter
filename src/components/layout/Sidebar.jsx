import { useState } from 'react';
import { Tooltip } from 'antd';
import { CloseOutlined, DownOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

import { navForUser } from '../../constants/navigation.js';
import { useAppState } from '../../context/AppContext.jsx';
import cn from '../../utils/cn.js';

export const SIDEBAR_WIDTH = 208;
export const SIDEBAR_COLLAPSED_WIDTH = 60;

/** Which group should start open for the current path. */
const groupForPath = (items, pathname) =>
    items.filter((item) => item.children?.some((child) => pathname.startsWith(child.path))).map(
        (item) => item.key
    );

/**
 * Blue navigation rail. Open by default; the hamburger in the blue bar
 * collapses it to an icon-only rail and the layout remembers the choice.
 */
export default function Sidebar({ onNavigate, onClose, collapsed = false }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { can } = useAppState();
    const items = navForUser((module) => can(module));
    const [openKeys, setOpenKeys] = useState(() => {
        const active = groupForPath(items, location.pathname);
        return active.length ? active : ['my-claims'];
    });

    const matchesPath = (path) => {
        if (!path) return false;
        if (path === '/') return location.pathname === '/';
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const isActive = (item) =>
        item.children ? item.children.some((child) => matchesPath(child.path)) : matchesPath(item.path);

    const go = (path) => {
        if (!path) return;
        navigate(path);
        if (onNavigate) onNavigate();
    };

    const toggleGroup = (key) =>
        setOpenKeys((keys) => (keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key]));

    const handleItemClick = (item) => {
        if (!item.children) {
            go(item.path);
            return;
        }
        toggleGroup(item.key);
    };

    return (
        <aside
            style={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
            className="relative flex h-full shrink-0 flex-col bg-[#1a47c8] text-white transition-[width] duration-200"
        >

            {onClose ? (
                <div className="flex justify-end px-3 pt-3">
                    <button
                        type="button"
                        aria-label="Close menu"
                        onClick={onClose}
                        className="text-[11.5px] text-white/70 hover:text-white"
                    >
                        <CloseOutlined />
                    </button>
                </div>
            ) : null}

            <nav className={cn('flex-1 overflow-x-hidden overflow-y-auto py-2', collapsed ? 'px-2' : 'px-0')}>
                {items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item);
                    const expanded = openKeys.includes(item.key);

                    const button = (
                        <button
                            type="button"
                            onClick={() => handleItemClick(item)}
                            className={cn(
                                'flex w-full items-center text-left text-[11.5px] font-medium tracking-wide uppercase transition',
                                collapsed ? 'justify-center rounded-lg px-0 py-2.5' : 'gap-2.5 px-4 py-2.5',
                                active ? 'bg-[#3d6be0] text-white' : 'text-white/90 hover:bg-white/10'
                            )}
                        >
                            <Icon className="shrink-0 text-[13px]" />
                            {!collapsed ? (
                                <>
                                    <span className="flex-1 truncate">{item.label}</span>
                                    {item.children ? (
                                        <DownOutlined
                                            className={cn(
                                                'text-[9px] transition-transform',
                                                expanded ? 'rotate-180' : ''
                                            )}
                                        />
                                    ) : null}
                                </>
                            ) : null}
                        </button>
                    );

                    return (
                        <div key={item.key}>
                            {collapsed ? (
                                <Tooltip title={item.label} placement="right">
                                    {button}
                                </Tooltip>
                            ) : (
                                button
                            )}

                            {item.children && expanded && !collapsed ? (
                                <div className="pb-1">
                                    {item.children.map((child) => (
                                        <button
                                            key={child.key}
                                            type="button"
                                            onClick={() => go(child.path)}
                                            className={cn(
                                                'flex w-full items-center py-1.5 pr-3 pl-10 text-left text-[11px] transition',
                                                matchesPath(child.path)
                                                    ? 'bg-white/15 font-semibold text-white'
                                                    : 'text-white/85 hover:bg-white/10 hover:text-white'
                                            )}
                                        >
                                            {child.label}
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
