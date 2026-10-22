import { useState } from 'react';
import { Drawer } from 'antd';
import { Outlet } from 'react-router-dom';

import Sidebar, { SIDEBAR_WIDTH } from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import { useIsTablet } from '../../hooks/useMediaQuery.js';
import useLocalStorage from '../../hooks/useLocalStorage.js';

/**
 * App shell: the rail runs the full height on the left and the blue bar sits
 * beside it. The only open/close control is the hamburger in that bar.
 */
export default function AppLayout() {
    const isTablet = useIsTablet();
    const [drawerOpen, setDrawerOpen] = useState(false);
    // Open by default – the user's own choice is remembered for the next visit.
    const [collapsed, setCollapsed] = useLocalStorage('sidebar-collapsed', false);

    return (
        <div className="flex min-h-screen bg-[#f7f9fc]">
            {/* The rail is a flex sibling, so the page beside it reflows
                automatically when it is collapsed or expanded. */}
            {!isTablet ? (
                <div className="sticky top-0 h-screen shrink-0">
                    <Sidebar collapsed={collapsed} />
                </div>
            ) : null}

            <div className="flex min-w-0 flex-1 flex-col">
                <TopBar onMenuClick={() => (isTablet ? setDrawerOpen(true) : setCollapsed(!collapsed))} />

                <main className="min-w-0 flex-1 px-3 py-3 sm:px-4 sm:py-4">
                    <Outlet />
                </main>
            </div>

            <Drawer
                placement="left"
                size={SIDEBAR_WIDTH}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                closable={false}
                styles={{ body: { padding: 0, background: '#1a47c8' } }}
            >
                <Sidebar onClose={() => setDrawerOpen(false)} onNavigate={() => setDrawerOpen(false)} />
            </Drawer>
        </div>
    );
}
