/** ILA – Intelligent Liability Assessment screen. */

export const MATERIAL_OPTIONS = [
    { label: 'Metal', value: 'Metal' },
    { label: 'Plastic', value: 'Plastic' },
    { label: 'Glass Fiber', value: 'Glass Fiber' },
    { label: 'Rubber', value: 'Rubber' },
];

export const REPAIR_REPLACE_OPTIONS = [
    { label: 'Repair', value: 'Repair' },
    { label: 'Replace', value: 'Replace' },
];

export const ALLOWED_OPTIONS = [
    { label: 'Allowed', value: 'Allowed' },
    { label: 'Disallowed', value: 'Disallowed' },
];

export const PARTS_ASSESSMENT = [
    { key: '01', srNo: '01', part: 'Front Bumper', material: 'Plastic', action: 'Replace' },
    { key: '02', srNo: '02', part: 'Bracket', material: 'Metal', action: 'Repair' },
    { key: '03', srNo: '03', part: 'Upper Grill', material: 'Plastic', action: 'Replace' },
    { key: '04', srNo: '03', part: 'Front Left Fender', material: 'Metal', action: 'Repair' },
    { key: '05', srNo: '04', part: 'Headlamp LH', material: 'Plastic', action: 'Replace' },
    { key: '06', srNo: '05', part: 'Bonnet', material: 'Metal', action: 'Repair' },
    { key: '07', srNo: '06', part: 'Front Wind Shield', material: 'Plastic', action: 'Replace' },
    { key: '08', srNo: '07', part: 'Left ORVM', material: 'Metal', action: 'Repair' },
    { key: '09', srNo: '08', part: 'Right ORVM', material: 'Plastic', action: 'Replace' },
].map((row) => ({
    ...row,
    allowed: 'Allowed',
    remarks: '--',
    hsnCode: '8708',
    partPrice: '7,624',
    depreciation: '50%',
}));

export const TOTAL_PARTS_ALLOWED = '72,320';

export const PARTS_COMPUTATION = {
    columns: ['Particulars', 'Metel Parts', 'Plastic/Rubber Parts', 'Glass Fiber Parts', 'Total'],
    rows: [
        { key: 'gross', label: 'Gross Ammount', values: ['45,000', '35,000', '12,000', '92,000'] },
        { key: 'depreciation', label: 'Less Depreciation', values: ['-18,000', '-7,500', '00', '35,000'] },
        { key: 'net', label: 'Net Ammount', values: ['27,000', '17,500', '12,000', '56,500'] },
        { key: 'gst', label: 'GST @ 25%', values: ['7,560', '4,900', '3,360', '15,820'] },
        { key: 'total', label: 'Total Allowed Parts', values: ['34,560', '22,500', '15,360', '72,320'], bold: true },
    ],
};

export const LABOUR_COMPUTATION = {
    columns: ['Particulars', 'Amount'],
    rows: [
        { key: 'remove-refit', label: 'Remove & Refit Labour', values: ['12,000'] },
        { key: 'repair', label: 'Repair Labour', values: ['8,500'] },
        { key: 'paint', label: 'Paint Labour', values: ['15,000'] },
        { key: 'gross', label: 'Gross Labour', values: ['35,500'] },
        { key: 'gst', label: 'GST @ 18%', values: ['6,390'] },
        { key: 'total', label: 'Total Labour Allowed', values: ['41,890'], bold: true },
    ],
};

export const ADDITIONAL_CHARGES = {
    columns: ['Particulars', 'Amount'],
    rows: [
        { key: 'towing', label: 'Additional Charges (Towing Etc)', values: ['2000'] },
        { key: 'compulsory-excess', label: 'Compulsory Excess', values: ['-1,000'] },
        { key: 'voluntary-excess', label: 'Voluntry Excess', values: ['0'] },
        { key: 'salvage', label: 'Salvage Value', values: ['-5000'] },
        { key: 'other', label: 'Other Deducation', values: ['0'] },
        { key: 'total', label: 'Total Deductions', values: ['-6,000'], bold: true },
    ],
};

export const FINAL_ASSESSMENT = {
    columns: ['Particulars', 'Amount'],
    rows: [
        { key: 'parts', label: 'Total Allowed Parts', values: ['72,320'] },
        { key: 'labour', label: 'Toal Labour Allowed', values: ['41,890'] },
        { key: 'additional', label: 'Additional Charges', values: ['2000'] },
        { key: 'gross', label: 'Gross Liability', values: ['116,210'] },
        { key: 'deductions', label: 'Less:Total Deductions', values: ['-6,000'] },
        { key: 'net', label: 'Net Liability', values: ['110,210'], bold: true },
    ],
};
