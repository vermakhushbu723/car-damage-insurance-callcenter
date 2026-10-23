/** Claim Details screen – the editable claim record beside the document viewer. */

const opts = (...labels) => labels.map((label) => ({ label, value: label }));
const YES_NO = opts('Yes', 'No');

export const CLAIM_DETAIL_TABS = [
    { key: 'vehicle', label: 'Vehicle Details', icon: 'car' },
    { key: 'driver', label: 'Driver Details', icon: 'user' },
    { key: 'loss', label: 'Loss Details', icon: 'file' },
    { key: 'vahan', label: 'Vahan Data', icon: 'grid' },
    { key: 'ai', label: 'AI Assessment', icon: 'sparkle' },
];

const MAKE_OPTIONS = opts('Maruti Suzuki', 'Hyundai', 'Tata', 'Toyota', 'Mahindra', 'Honda', 'Kia');
const MODEL_OPTIONS = opts('Swift', 'Baleno', 'Verna', 'Camry', 'Nexon', 'City');
const BODY_TYPE_OPTIONS = opts('Hatch Back', 'Sedan', 'SUV', 'MUV', 'Pickup');
const INJURY_OPTIONS = opts('None', 'Minor', 'Major', 'Fatal');
const RELATION_OPTIONS = opts('Self', 'Relative', 'Paid Driver', 'Others');
const BLOOD_GROUPS = opts('A+Ve', 'A-Ve', 'B+Ve', 'B-Ve', 'O+Ve', 'O-Ve', 'AB+Ve', 'AB-Ve');

/**
 * Field config per tab – rendered by the shared DynamicField.
 * The AI Assessment tab has no fields: it shows the AI ILA findings.
 */
export const CLAIM_DETAIL_SECTIONS = {
    vehicle: {
        step: 1,
        title: 'Vehicle Details',
        fields: [
            { name: 'vehicleRegNo', label: 'Vehicle Reg No', type: 'text', placeholder: 'MH 12 AB 1234' },
            { name: 'make', label: 'Make', type: 'select', placeholder: 'Maruti Suzuki', options: MAKE_OPTIONS },
            { name: 'model', label: 'Model', type: 'select', placeholder: 'Swift', options: MODEL_OPTIONS },
            { name: 'variant', label: 'Variant', type: 'text', placeholder: 'ZXI+' },
            { name: 'yearOfManufacture', label: 'Year Of Manufacture', type: 'text', placeholder: '2019' },
            { name: 'fuelType', label: 'Fule Type', type: 'text', placeholder: 'Petrol' },
            { name: 'engineNumber', label: 'Engine Number', type: 'text', placeholder: 'K12M1234567890' },
            { name: 'chassisNumber', label: 'Chassis Number', type: 'text', placeholder: 'MU4979268WQDD97497DFA' },
            { name: 'odometer', label: 'Oddometer Reading (Km)', type: 'text', placeholder: '45,000' },
            { name: 'bodyType', label: 'Body Type', type: 'select', placeholder: 'Hatch Back', options: BODY_TYPE_OPTIONS },
            { name: 'colour', label: 'Colour', type: 'text', placeholder: 'Pearl White' },
            { name: 'vehicleAge', label: 'Vehicle Age', type: 'text', placeholder: '6 Years' },
        ],
    },
    driver: {
        step: 2,
        title: 'Driver Details',
        fields: [
            { name: 'driverName', label: 'Driver Name', type: 'text', placeholder: 'Amit Kumar' },
            { name: 'driverContact', label: 'Driver Contact Number', type: 'text', placeholder: '+91 1234567890' },
            { name: 'driverLicenseNumber', label: 'Driver License Number', type: 'text', placeholder: 'MH 12 1234567890PUN' },
            { name: 'dlValidUpto', label: 'DL Valid Upto', type: 'date', placeholder: '14 Aug 2028' },
            { name: 'dlClass', label: 'DLClass/Type (Form Vahan)', type: 'text', placeholder: 'LMV' },
            { name: 'dlIssuingState', label: 'DL Issuing State', type: 'text', placeholder: 'Maharastra' },
            { name: 'driverInjuryState', label: 'Driver Injury State', type: 'select', placeholder: 'Minor', options: INJURY_OPTIONS },
            { name: 'driverRelationship', label: 'Relationship To Insured', type: 'select', placeholder: 'Self', options: RELATION_OPTIONS },
            { name: 'additionalDriver', label: 'Additional Driver Information (Optional)', type: 'heading', full: true },
            { name: 'emergencyContactName', label: 'Emergency Contact Name', type: 'text', placeholder: 'Amit Kumar' },
            { name: 'emergencyContactNumber', label: 'Emergency Contact Number', type: 'text', placeholder: '+91 1234567890' },
            { name: 'bloodGroup', label: 'Blood Group', type: 'select', placeholder: 'O+Ve', options: BLOOD_GROUPS },
            { name: 'drivingExperience', label: 'Driving Exprience (Years)', type: 'text', placeholder: '8 Years' },
            { name: 'primaryDriver', label: 'Primary Driver', type: 'radio', options: YES_NO },
            { name: 'driverInfluence', label: 'Was Driver Influence', type: 'radio', options: YES_NO },
        ],
    },
    loss: {
        step: 3,
        title: 'Loss Details',
        fields: [
            { name: 'typeOfLoss', label: 'Type Of Loss', type: 'select', placeholder: 'Own Damage( OD )', options: opts('Own Damage( OD )', 'Third Party', 'Theft', 'Fire', 'Natural Calamity') },
            { name: 'causeOfAccident', label: 'Cause Of Accident', type: 'text', placeholder: 'Collision' },
            { name: 'partsDamage', label: 'Parts Damage', type: 'tags', placeholder: 'Type a part and press Enter', full: true },
            { name: 'airBagDeployed', label: 'Air Bag Deployed', type: 'text', placeholder: 'Driver Air Bag' },
            { name: 'vehicleCondition', label: 'Vehicle Condition', type: 'select', placeholder: 'Repairable', options: opts('Repairable', 'Total Loss', 'Constructive Total Loss') },
            { name: 'estimatedRepairCost', label: 'Estimated Repair Cost', type: 'text', placeholder: '78,500' },
            { name: 'lossRelationship', label: 'Relationship To Insured', type: 'select', placeholder: 'Self', options: RELATION_OPTIONS },
            { name: 'lossBloodGroup', label: 'Blood Group', type: 'select', placeholder: 'O+Ve', options: BLOOD_GROUPS },
            { name: 'lossDescription', label: 'Loss Description', type: 'textarea', placeholder: 'Vehicle Met With An Accident ...', rows: 4 },
            { name: 'workshopEstimateReceived', label: 'Workshop Estimated Received', type: 'radio', options: YES_NO },
            { name: 'workshopEstimateDocument', label: 'Workshop Estimate Document', type: 'document', docType: 'estimate' },
        ],
    },
    vahan: {
        step: 4,
        title: 'Vahan Data',
        fields: [
            { name: 'rcOwnerName', label: 'RC Owner Name', type: 'text', placeholder: 'Rakesh Kumar Sharma' },
            { name: 'rcRegistrationDate', label: 'RC Registration Date', type: 'date', placeholder: '14 Feb 2019' },
            { name: 'rcValidUpto', label: 'Valid Upto', type: 'date', placeholder: '13 Feb 2029' },
            { name: 'vahanVehicleClass', label: 'Vehicle Class', type: 'text', placeholder: 'Motor Car' },
            { name: 'vahanEngineNumber', label: 'Engine Number', type: 'text', placeholder: 'K12MAN1234567890' },
            { name: 'vahanChassisNumber', label: 'Chassis Number', type: 'text', placeholder: 'K12MAN1234567890' },
            { name: 'dlHolderName', label: 'DL Holder Name', type: 'text', placeholder: 'Rakesh Sharma' },
            { name: 'vahanDlValidUpto', label: 'DL Valid Upto', type: 'date', placeholder: '20 June 2030' },
            { name: 'dlVehicleClass', label: 'Vehicle Class', type: 'text', placeholder: 'LMV' },
            { name: 'issuingRto', label: 'Issuing RTO', type: 'text', placeholder: 'RTO Lakhnow (UP 32)' },
        ],
    },
    ai: { step: 5, title: 'AI Assessment', fields: [] },
};
