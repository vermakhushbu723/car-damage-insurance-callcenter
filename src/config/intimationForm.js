/**
 * The whole intimation form is described here as data.
 * `FormSection` + `DynamicField` render it, so adding a field never
 * means touching a component.
 *
 * field: { name, label, type, placeholder, options?, full?, rows?, disabled? }
 * type:  text | select | date | time | textarea | radio | checkbox | search | heading | static | spacer
 */

const opts = (...labels) => labels.map((label) => ({ label, value: label }));

export const YES_NO = opts('Yes', 'No');

const CITY_OPTIONS = opts('Thane', 'Mumbai', 'Noida', 'Delhi', 'Bengaluru');
const STATE_OPTIONS = opts('Maharashtra', 'Uttar Pradesh', 'Delhi', 'Karnataka', 'Gujarat');
const PINCODE_OPTIONS = opts('400607', '201301', '110001', '560001');
const COUNTRY_OPTIONS = opts('India');
const LANDMARK_OPTIONS = opts('Dmart', 'City Mall', 'Metro Station', 'Bus Depot');
const LOB_OPTIONS = opts('Motor', 'Fire', 'Marine', 'Cattle', 'Engg', 'MISC');

/** Compact strip above the form cards. */
export const INTIMATION_META_FIELDS = [
    { name: 'assistClaimId', label: 'Assist Claim ID', type: 'static', value: 'BIM-250501-1021' },
    { name: 'intimationDateTime', label: 'Intimation Date & Time', type: 'date', placeholder: '11 May 2025, 11:25 AM' },
    {
        name: 'intimationSource',
        label: 'Intimation Source',
        type: 'select',
        placeholder: 'Call Center/Direct/Chatbot',
        options: opts('Call Center', 'Direct', 'Chatbot', 'Website', 'App'),
    },
    {
        name: 'receivedBy',
        label: 'Received By',
        type: 'select',
        placeholder: 'Ravi Kumar',
        options: opts('Ravi Kumar', 'Rajesh Kumar', 'Suresh Sharma'),
    },
    {
        name: 'channelType',
        label: 'Channel Type',
        type: 'select',
        placeholder: 'Phone/Email',
        options: opts('Phone', 'Email', 'WhatsApp', 'SMS'),
    },
];

export const INTIMATION_LEFT_SECTIONS = [
    {
        key: 'caller',
        title: 'Caller Details',
        fields: [
            { name: 'callerName', label: 'Caller Name', type: 'text', placeholder: 'Amit Verma' },
            { name: 'callerContact', label: 'Contact Number', type: 'text', placeholder: '+91 1234567890' },
            {
                name: 'relationshipWithInsured',
                label: 'Relationship With Insured',
                type: 'select',
                placeholder: 'Self/Agent/Driver/Workshop /Others',
                options: opts('Self', 'Agent', 'Driver', 'Workshop', 'Others'),
            },
            {
                name: 'vehicleLocation',
                label: 'Vehicle Location',
                type: 'select',
                placeholder: 'Workshop/Spot/At Home',
                options: opts('Workshop', 'Spot', 'At Home'),
            },
        ],
    },
    {
        key: 'insurer-policy',
        title: 'Insurer & Policy Details',
        fields: [
            {
                name: 'insurerName',
                label: 'Insurer Name',
                type: 'select',
                placeholder: 'Demo Insurance Co',
                options: opts('Demo Insurance Co', 'ICICI Lombard', 'HDFC Ergo', 'Bajaj Allianz'),
            },
            { name: 'insurerCode', label: 'Insurer Code', type: 'text', placeholder: 'DEMO123' },
            { name: 'policyNumber', label: 'Policy Number', type: 'text', placeholder: '1234567891012' },
            {
                name: 'policyType',
                label: 'Policy Type',
                type: 'select',
                placeholder: 'Comprehensive/Stand Alone OD/TP Only',
                options: opts('Comprehensive', 'Stand Alone OD', 'TP Only'),
            },
            { name: 'policyStartDate', label: 'Policy Start Date', type: 'date', placeholder: '15 March 2025' },
            { name: 'policyEndDate', label: 'Policy End Date', type: 'date', placeholder: '14 Mar 2026' },
            {
                name: 'policyIssueBranch',
                label: 'Policy Issue Branch',
                type: 'select',
                placeholder: 'Noida, UP Branch',
                options: opts('Noida, UP Branch', 'Delhi HUb', 'Mumbai Branch'),
            },
            {
                name: 'claimReportedBranch',
                label: 'Claim Reported Branch',
                type: 'select',
                placeholder: 'Delhi HUb',
                options: opts('Delhi HUb', 'Noida, UP Branch', 'Mumbai Branch'),
            },
            { name: 'insurerClaimNumber', label: 'Insurer Claim Number', type: 'text', placeholder: '1234567890' },
            {
                name: 'lineOfBusiness',
                label: 'Line Of Business',
                type: 'select',
                placeholder: 'Motor/Fire/Marine/Cattle/Engg/MISC',
                options: LOB_OPTIONS,
            },
            {
                name: 'lineOfBusinessSecondary',
                label: 'Line Of Business',
                type: 'select',
                placeholder: 'Motor/Fire/Marine/Cattle/Engg/MISC',
                options: LOB_OPTIONS,
            },
            {
                name: 'product',
                label: 'Product',
                type: 'select',
                placeholder: 'Private Car/Two Wheeler/ CV',
                options: opts('Private Car', 'Two Wheeler', 'CV'),
            },
        ],
    },
    {
        key: 'vehicle',
        title: 'Vehicle Details',
        fields: [
            {
                name: 'registrationNumber',
                label: 'Registration Number',
                type: 'select',
                placeholder: 'MH 01 J 1895',
                options: opts('MH 01 J 1895', 'MH 12 X 1234', 'DL 01 AB 1234'),
            },
            { name: 'registrationDate', label: 'Registration Date', type: 'date', placeholder: '15 March 2025' },
            {
                name: 'make',
                label: 'Make',
                type: 'select',
                placeholder: 'Hyundai',
                options: opts('Hyundai', 'Maruti Suzuki', 'Tata', 'Toyota'),
            },
            {
                name: 'model',
                label: 'Model',
                type: 'select',
                placeholder: 'Verna',
                options: opts('Verna', 'Swift', 'Baleno', 'Camry'),
            },
            { name: 'variant', label: 'Variant', type: 'text', placeholder: 'ZDI' },
            {
                name: 'fuelType',
                label: 'Fuel Type',
                type: 'select',
                placeholder: 'Petrol/Diesel/CNG/Electric',
                options: opts('Petrol', 'Diesel', 'CNG', 'Electric'),
            },
            { name: 'engineNo', label: 'Engine No', type: 'text', placeholder: '78GLA25897GH' },
            { name: 'chassisNumber', label: 'Chassis Number', type: 'text', placeholder: '78GLA25897GH' },
            { name: 'colour', label: 'Colour', type: 'text', placeholder: 'Pearl Arctic White' },
            { name: 'manufacturingYear', label: 'Manufacturing Year', type: 'date', placeholder: '2026' },
        ],
    },
    {
        key: 'accident-loss',
        title: 'Accident/Loss',
        fields: [
            { name: 'dateOfIncident', label: 'Date Of Incident', type: 'date', placeholder: '11 May 2025' },
            { name: 'timeOfIncident', label: 'Time Of Incident', type: 'time', placeholder: '10:45 AM' },
            { name: 'placeOfIncident', label: 'Place Of Incident', type: 'heading', full: true },
            { name: 'incidentArea', label: 'Area', type: 'text', placeholder: 'Kolshet Road' },
            {
                name: 'incidentLandmark',
                label: 'Nearest Landmark',
                type: 'select',
                placeholder: 'Dmart',
                options: LANDMARK_OPTIONS,
            },
            { name: 'incidentCity', label: 'City', type: 'select', placeholder: 'Thane', options: CITY_OPTIONS },
            {
                name: 'incidentState',
                label: 'State',
                type: 'select',
                placeholder: 'Maharashtra',
                options: STATE_OPTIONS,
            },
            {
                name: 'incidentPincode',
                label: 'Pincode',
                type: 'select',
                placeholder: '400607',
                options: PINCODE_OPTIONS,
            },
            {
                name: 'incidentCountry',
                label: 'Country',
                type: 'select',
                placeholder: 'India',
                options: COUNTRY_OPTIONS,
            },
            {
                name: 'servicingOffice',
                label: 'Servicing Office',
                type: 'select',
                placeholder: 'Motor/Fire/Marine/Cattle/Engg/MISC',
                options: LOB_OPTIONS,
            },
            {
                name: 'natureOfLoss',
                label: 'Nature Of Loss',
                type: 'select',
                placeholder: 'Motor/Fire/Marine/Cattle/Engg/MISC',
                options: LOB_OPTIONS,
            },
            {
                name: 'briefDescription',
                label: 'Breif Description',
                type: 'textarea',
                placeholder: 'Vehicle Hit By Another Vehicle',
                rows: 3,
                full: true,
            },
        ],
    },
];

export const INTIMATION_RIGHT_SECTIONS = [
    {
        key: 'insured',
        title: 'Insured Details',
        fields: [
            { name: 'insuredName', label: 'Insured Name', type: 'text', placeholder: 'Amit Verma' },
            { name: 'insuredContact', label: 'Contact Number', type: 'text', placeholder: '+91 1234567890' },
            { name: 'insuredEmail', label: 'Email ID', type: 'text', placeholder: 'Amitverma07@Gmail.Com' },
            { name: 'insuredAddress', label: 'Address', type: 'textarea', placeholder: 'Full Address', rows: 3 },
            {
                name: 'communicationPreference',
                label: 'Communication Preference',
                type: 'checkbox',
                options: opts('SMS', 'Email', 'WhatsApp'),
                full: true,
            },
        ],
    },
    {
        key: 'driver',
        title: 'Driver Details',
        fields: [
            { name: 'driverInjured', label: 'Driver Injured?', type: 'checkbox', options: YES_NO, full: true },
            { name: 'driverName', label: 'Driver Name', type: 'text', placeholder: 'Demo Insurance Co' },
            {
                name: 'drivingLicenseNumber',
                label: 'Driving License Number',
                type: 'text',
                placeholder: 'MH 12 78GLA25897GH',
            },
            { name: 'driverDob', label: 'Date Of Birth', type: 'text', placeholder: 'Drivermailid@Gmail.Com' },
            {
                name: 'licenseIssueDate',
                label: 'Issue Date',
                type: 'select',
                placeholder: 'Self/Relative/Paid Driver/Others',
                options: opts('Self', 'Relative', 'Paid Driver', 'Others'),
            },
            {
                name: 'validClass',
                label: 'Valid Class',
                type: 'checkbox',
                options: opts('MCWG', 'MCWOG', 'LMV', 'TRANS', 'Others'),
                extraInput: { name: 'validClassOther', placeholder: 'Tractor' },
                full: true,
            },
            {
                name: 'validFrom',
                label: 'Valid From',
                type: 'select',
                placeholder: 'Self/Relative/Paid Driver/Others',
                options: opts('Self', 'Relative', 'Paid Driver', 'Others'),
            },
            {
                name: 'validUpto',
                label: 'Valid Upto',
                type: 'select',
                placeholder: 'None/Minor/Major/Fatal',
                options: opts('None', 'Minor', 'Major', 'Fatal'),
            },
        ],
    },
    {
        key: 'workshop',
        title: 'Workshop Details',
        fields: [
            { name: 'isVehicleAtWorkshop', label: 'Is The Vehicle At Workshop?', type: 'checkbox', options: YES_NO },
            { name: 'towingRequired', label: 'Towing Required?', type: 'checkbox', options: YES_NO },
            { name: 'workshopName', label: 'Workshop Name', type: 'text', placeholder: 'XYZ Motors' },
            {
                name: 'workshopContactNumber',
                label: 'Workshop Contact Number',
                type: 'text',
                placeholder: '+91 1234567890',
            },
            {
                name: 'workshopAddress',
                label: 'Workshop Address',
                type: 'text',
                placeholder: 'B-99,Sector-63, Noida UP- 201301',
            },
            { name: 'contactPersonName', label: 'Contact Person Name', type: 'text', placeholder: 'Raju' },
            { name: 'workshopArea', label: 'Area', type: 'text', placeholder: 'Kolshet Road' },
            {
                name: 'workshopLandmark',
                label: 'Nearest Landmark',
                type: 'select',
                placeholder: 'Dmart',
                options: LANDMARK_OPTIONS,
            },
            { name: 'workshopCity', label: 'City', type: 'select', placeholder: 'Thane', options: CITY_OPTIONS },
            {
                name: 'workshopState',
                label: 'State',
                type: 'select',
                placeholder: 'Maharashtra',
                options: STATE_OPTIONS,
            },
            {
                name: 'workshopPincode',
                label: 'Pincode',
                type: 'select',
                placeholder: '400607',
                options: PINCODE_OPTIONS,
            },
            {
                name: 'workshopCountry',
                label: 'Country',
                type: 'select',
                placeholder: 'India',
                options: COUNTRY_OPTIONS,
            },
        ],
    },
    {
        key: 'fir-injury',
        title: 'FIR & Injury Details',
        columns: 3,
        fields: [
            { name: 'anyInjury', label: 'Any Injury?', type: 'checkbox', options: YES_NO },
            { name: 'anyFatality', label: 'Any Fatality?', type: 'checkbox', options: YES_NO },
            { name: 'thirdPartyInvolved', label: '3rd Party Involved', type: 'checkbox', options: YES_NO },
            { name: 'personsInjured', label: 'No Of Persons Injured', type: 'text', placeholder: '01' },
            { name: 'injuryDetails', label: 'Injury Details', type: 'text', placeholder: 'Minor' },
            { name: 'policeReport', label: 'Police Report', type: 'checkbox', options: YES_NO },
            { name: 'personsDeceased', label: 'No Of Personas Deceased', type: 'text', placeholder: '0' },
            { name: 'policeStation', label: 'Police Station', type: 'text', placeholder: 'Police Station Name' },
            { name: 'firNo', label: 'FIR No', type: 'text', placeholder: 'CLM-250501-1021' },
            {
                name: 'firRemarks',
                label: 'Remarks (If Any)',
                type: 'textarea',
                placeholder: 'Customer Requested For Early Claim Settlement',
                rows: 4,
                full: true,
            },
        ],
    },
];

export default INTIMATION_LEFT_SECTIONS;
