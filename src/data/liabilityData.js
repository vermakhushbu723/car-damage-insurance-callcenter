/** ILA – Intelligent Liability Assessment screen (parts + computations come from GET /claims/:id/liability). */

/** Depreciation on replaced parts (IRDAI): metal by vehicle age, plastic / rubber 50%, fibre glass 30%, glass nil. */
export const MATERIAL_OPTIONS = [
    { label: 'Metal', value: 'Metal' },
    { label: 'Plastic', value: 'Plastic' },
    { label: 'Rubber', value: 'Rubber' },
    { label: 'Fibre Glass', value: 'Fibre Glass' },
    { label: 'Glass', value: 'Glass' },
];

/** IMT 23 not opted: 50% deduction on the part (and its paint). */
export const IMT23_OPTIONS = [
    { label: 'No', value: false },
    { label: 'Yes', value: true },
];

export const REPAIR_REPLACE_OPTIONS = [
    { label: 'Repair', value: 'Repair' },
    { label: 'Replace', value: 'Replace' },
];

export const ALLOWED_OPTIONS = [
    { label: 'Allowed', value: 'Allowed' },
    { label: 'Disallowed', value: 'Disallowed' },
];
