/** Claim Details screen – the editable claim record beside the document viewer. */

export const CLAIM_DETAIL_TABS = [
    { key: 'vehicle', label: 'Vehicle Details', icon: 'car' },
    { key: 'insured', label: 'Insured Details', icon: 'user' },
    { key: 'loss', label: 'Loss Details', icon: 'file' },
    { key: 'vahan', label: 'Vahan Data', icon: 'grid' },
];

const MAKE_OPTIONS = [
    { label: 'Maruti Suzuki', value: 'maruti-suzuki' },
    { label: 'Hyundai', value: 'hyundai' },
    { label: 'Tata', value: 'tata' },
    { label: 'Toyota', value: 'toyota' },
];

const MODEL_OPTIONS = [
    { label: 'Shift', value: 'shift' },
    { label: 'Swift', value: 'swift' },
    { label: 'Baleno', value: 'baleno' },
];

const BODY_TYPE_OPTIONS = [
    { label: 'Hatch Back', value: 'hatchback' },
    { label: 'Sedan', value: 'sedan' },
    { label: 'SUV', value: 'suv' },
];

/** Field config per tab – rendered by the shared DynamicField. */
export const CLAIM_DETAIL_SECTIONS = {
    vehicle: {
        step: 1,
        title: 'Vehicle Details',
        fields: [
            { name: 'vehicleRegNo', label: 'Vehicle Reg No', type: 'text', placeholder: 'MH 12 AB 1234' },
            { name: 'make', label: 'Make', type: 'select', placeholder: 'Maruti Suzuki', options: MAKE_OPTIONS },
            { name: 'model', label: 'Model', type: 'select', placeholder: 'Shift', options: MODEL_OPTIONS },
            { name: 'variant', label: 'Variant', type: 'text', placeholder: 'ZXI+' },
            { name: 'yearOfManufacture', label: 'Year Of Manufacture', type: 'text', placeholder: '2019' },
            { name: 'fuelType', label: 'Fule Type', type: 'text', placeholder: 'Petrol' },
            { name: 'engineNumber', label: 'Engine Number', type: 'text', placeholder: 'K12M1234567890' },
            { name: 'chassisNumber', label: 'Chassis Number', type: 'text', placeholder: 'MU4979268WQDD97497DFA' },
            { name: 'odometer', label: 'Oddometer Reading (Km)', type: 'text', placeholder: '45,000' },
            {
                name: 'bodyType',
                label: 'Body Type',
                type: 'select',
                placeholder: 'Hatch Back',
                options: BODY_TYPE_OPTIONS,
            },
            { name: 'colour', label: 'Colour', type: 'text', placeholder: 'Pearl White' },
            { name: 'vehicleAge', label: 'Vehicle Age', type: 'text', placeholder: '6 Years' },
        ],
    },
    insured: {
        step: 2,
        title: 'Insured Details',
        fields: [
            { name: 'insuredName', label: 'Insured Name', type: 'text', placeholder: 'Amit Verma' },
            { name: 'contactNumber', label: 'Contact Number', type: 'text', placeholder: '+91 1234567890' },
            { name: 'emailId', label: 'Email ID', type: 'text', placeholder: 'Amitverma07@Gmail.Com' },
            { name: 'address', label: 'Address', type: 'textarea', placeholder: 'Full Address', rows: 3, full: true },
        ],
    },
    loss: {
        step: 3,
        title: 'Loss Details',
        fields: [
            { name: 'dateOfIncident', label: 'Date Of Incident', type: 'date', placeholder: '11 May 2025' },
            { name: 'timeOfIncident', label: 'Time Of Incident', type: 'time', placeholder: '10:45 AM' },
            { name: 'lossLocation', label: 'Place Of Incident', type: 'text', placeholder: 'Kolshet Road' },
            { name: 'natureOfLoss', label: 'Nature Of Loss', type: 'text', placeholder: 'Accidental Damage' },
            {
                name: 'description',
                label: 'Breif Description',
                type: 'textarea',
                placeholder: 'Vehicle Hit By Another Vehicle',
                rows: 3,
                full: true,
            },
        ],
    },
    vahan: {
        step: 4,
        title: 'Vahan Data',
        fields: [
            { name: 'vahanRegNo', label: 'Registration No', type: 'text', placeholder: 'UP14AB1234' },
            { name: 'vahanRegDate', label: 'Registration Date', type: 'text', placeholder: '15-06-2022' },
            { name: 'vahanOwner', label: 'Owner Name', type: 'text', placeholder: 'Rohit Kumar' },
            { name: 'vahanFitness', label: 'Fitness Upto', type: 'text', placeholder: '14-06-2027' },
            { name: 'vahanTax', label: 'Tax Upto', type: 'text', placeholder: '14-06-2026' },
            { name: 'vahanInsurance', label: 'Ins. Upto', type: 'text', placeholder: '14-06-2026' },
        ],
    },
};
