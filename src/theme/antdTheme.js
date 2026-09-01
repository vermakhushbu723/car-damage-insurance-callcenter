/**
 * Single source of truth for the Ant Design look & feel.
 * Keep colour/spacing decisions here instead of scattering them in components.
 */
export const brand = {
    header: '#83a2e3',
    primary: '#1450d8',
    primaryDark: '#0f3fb0',
    label: '#1668e3',
    heading: '#123fa8',
    navy: '#061635',
    field: '#f3f5f9',
    surface: '#f7f9fc',
};

const antdTheme = {
    token: {
        colorPrimary: brand.primary,
        colorLink: brand.primary,
        colorBorder: '#e6eaf2',
        borderRadius: 6,
        controlHeight: 32,
        controlHeightLG: 36,
        fontSize: 12.5,
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    },
    components: {
        Button: { fontWeight: 500, primaryShadow: 'none', defaultShadow: 'none' },
        Card: { borderRadiusLG: 12 },
        Table: {
            headerBg: '#ffffff',
            headerColor: '#0f172a',
            headerSplitColor: 'transparent',
            rowHoverBg: '#f7f9ff',
            cellPaddingBlock: 9,
            cellPaddingInline: 12,
        },
        Tabs: { itemSelectedColor: brand.primary, inkBarColor: brand.primary },
        Menu: { itemBorderRadius: 8 },
    },
};

export default antdTheme;
