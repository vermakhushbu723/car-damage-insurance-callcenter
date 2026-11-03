import { useState } from 'react';
import { App, Checkbox, DatePicker, Radio } from 'antd';
import { DesktopOutlined, MobileOutlined } from '@ant-design/icons';

import { FieldLabel, NmButton, NmInput, NmSelect, NmTitle } from '../../components/national/NmUi.jsx';
import cn from '../../utils/cn.js';

const REPAIRER_TYPES = ['Pvt Car', 'Commercial Vehicle', 'Two Wheeler', 'Misc-D'];
const STEPS = [
    ['details', 'Personal details'],
    ['implement', 'Implement'],
    ['access', 'Platform & App Access'],
    ['tax', 'Tax & Bank Details'],
    ['incharge', 'Primary Workshop In-Charge'],
];

const Section = ({ id, n, title, children }) => (
    <section id={id} className="mb-4 scroll-mt-20 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 flex items-center gap-2.5 text-[17px] font-semibold text-[#0b4fc9] uppercase">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0b4fc9] text-[12px] text-white">{n}</span>
            {title}
        </h2>
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">{children}</div>
    </section>
);

const Text = ({ label, placeholder }) => (
    <FieldLabel label={label}>
        <NmInput placeholder={placeholder} />
    </FieldLabel>
);
const Pick = ({ label, placeholder, options = [] }) => (
    <FieldLabel label={label}>
        <NmSelect placeholder={placeholder} options={options} />
    </FieldLabel>
);
const DateF = ({ label, placeholder = 'DD/MM/YYYY' }) => (
    <FieldLabel label={label}>
        <DatePicker className="w-full" format="DD/MM/YYYY" placeholder={placeholder} />
    </FieldLabel>
);
const Choice = ({ label, options }) => (
    <FieldLabel label={label}>
        <Checkbox.Group options={options} />
    </FieldLabel>
);
const YesNo = ({ label }) => (
    <FieldLabel label={label}>
        <Radio.Group options={['Yes', 'No']} />
    </FieldLabel>
);
const SubHead = ({ children }) => <h3 className="m-0 text-[15px] font-semibold text-[#0b4fc9] md:col-span-2">{children}</h3>;

/** Register Workshop (Figma frame 2002:34802, titled SURVEYOR there). */
export default function NmWorkshopPage() {
    const { message } = App.useApp();
    const [platform, setPlatform] = useState('Mobile');
    const [step, setStep] = useState('details');

    const jump = (id) => {
        setStep(id);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div>
            <NmTitle title="Register Workshop" sample />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[170px_minmax(0,1fr)]">
                <nav className="top-20 self-start lg:sticky" aria-label="Form sections">
                    <ol className="m-0 flex list-none flex-wrap gap-3 p-0 lg:flex-col">
                        {STEPS.map(([id, label], i) => (
                            <li key={id}>
                                <button type="button" onClick={() => jump(id)} className={cn('flex items-center gap-2 text-left text-[11.5px]', step === id ? 'font-semibold text-[#0b4fc9]' : 'text-slate-400')}>
                                    <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10.5px]', step === id ? 'bg-[#0b4fc9] text-white' : 'bg-slate-200 text-slate-500')}>{i + 1}</span>
                                    {label}
                                </button>
                            </li>
                        ))}
                    </ol>
                </nav>

                <form
                    className="min-w-0"
                    onSubmit={(e) => {
                        e.preventDefault();
                        message.info('Not connected to the backend yet: the workshop was not created.');
                    }}
                >
                    <Section id="details" n={1} title="Workshop Details">
                        <Text label="Workshop ID" placeholder="Enter workshop ID" />
                        <Choice label="Workshop Type" options={['Preferred', 'Cashless', 'Non Cashless']} />
                        <Text label="Workshop/Garage Name" placeholder="Enter Workshop Name" />
                        <FieldLabel label="Workshop ID Type">
                            <Radio.Group options={['Parent', 'Child']} />
                        </FieldLabel>
                        <Text label="Workshop Address" placeholder="Enter workshop address" />
                        <Text label="Area" placeholder="Enter area" />
                        <Text label="City" placeholder="Enter city" />
                        <Text label="District" placeholder="Enter district" />
                        <Pick label="State" placeholder="Select State" />
                        <Text label="PIN" placeholder="6 Digit Code" />
                        <Pick label="Country" placeholder="Select Country" options={['India']} />
                        <Pick label="Type of Repairer" placeholder="Pvt Car, Commercial Vehicle, Two Wheeler, Misc-D" options={REPAIRER_TYPES} />
                        <Pick label="Category" placeholder="Select category" />
                        <Text label="Owner/Proprietor Name" placeholder="Enter Owner/Proprietor Name" />
                        <Text label="Mobile Number" placeholder="Enter 10 digit mobile number" />
                        <Text label="Primary Contact Name" placeholder="Enter Primary Contact Name" />
                        <Text label="Alternate Mobile No." placeholder="Enter 10 digit mobile number" />
                        <Text label="Email" placeholder="Enter Email address" />
                    </Section>

                    <Section id="implement" n={2} title="Implement">
                        <Text label="Empanelled" placeholder="Eg. MS_1234567890" />
                        <Text label="Empanelment code (per insurer)" placeholder="Alpha Numeric Code" />
                        <DateF label="Empanelment valid upto" placeholder="DD-MM-YYYY" />
                    </Section>

                    <Section id="access" n={3} title="Platform & App Access">
                        <div>
                            <div className="flex gap-2" role="radiogroup" aria-label="Platform">
                                {[['Mobile', <MobileOutlined key="m" />], ['Web', <DesktopOutlined key="w" />], ['Both', <span key="b"><MobileOutlined /> <DesktopOutlined /></span>]].map(([p, icon]) => (
                                    <button
                                        key={p}
                                        type="button"
                                        role="radio"
                                        aria-checked={platform === p}
                                        onClick={() => setPlatform(p)}
                                        className={cn('grid h-16 w-20 place-items-center rounded-md border text-[18px] text-[#0b4fc9]', platform === p ? 'border-[#0b4fc9] bg-blue-50' : 'border-slate-200 bg-slate-50')}
                                    >
                                        {icon}
                                        <span className="text-[10.5px] text-slate-800">{p}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Choice label="App Permission" options={['Pre Inspection Photocapture', 'Vehicle Condition Form', 'Claim Status View']} />
                        <Text label="User ID" placeholder="Generated User ID" />
                        <Text label="Password" placeholder="Auto/Admin" />
                    </Section>

                    <Section id="tax" n={4} title="Tax & Bank Details">
                        <SubHead>Tax Details</SubHead>
                        <Text label="PAN No." placeholder="Enter PAN No." />
                        <Text label="Mobile Number" placeholder="Enter Mobile Number" />
                        <FieldLabel label="PAN Adhaar Sending">
                            <Radio.Group options={['Operative PAN', 'In Operative PAN', 'Non Individual PAN']} />
                        </FieldLabel>
                        <Pick label="GST Category" placeholder="Enter GST Category" />
                        <Pick label="Turnover" placeholder="Select Turnover" />
                        <FieldLabel label="GST Applicability">
                            <Checkbox aria-label="GST Applicability" />
                        </FieldLabel>
                        <YesNo label="MSME Registered" />
                        <YesNo label="E-Invoicing Applicable" />
                        <SubHead>Bank Details</SubHead>
                        <Text label="Bank Payee" placeholder="Enter Payee Name" />
                        <Text label="IFSC Code" placeholder="Enter IFSC Code" />
                        <Text label="Bank Name" placeholder="Enter Bank Name" />
                        <Text label="Bank Branch" placeholder="Enter Bank Branch" />
                        <Text label="MICR Code" placeholder="Enter MICR Code" />
                        <Text label="Bank Account" placeholder="Enter Bank Account Number" />
                        <Pick label="Account Type" placeholder="Select Account Type" options={['Savings', 'Current']} />
                        <SubHead>Penny Drop</SubHead>
                        <Text label="Beneficiary Name as per Service" placeholder="Enter Beneficiary name as per service" />
                        <Text label="Message" placeholder="Enter Message" />
                        <Text label="Remarks" placeholder="Enter Remarks" />
                        <YesNo label="Penny Drop Status" />
                    </Section>

                    <Section id="incharge" n={5} title="Primary Workshop In-Charge">
                        <Text label="In-charge Name" placeholder="Enter in-charge name" />
                        <Text label="Mobile Number" placeholder="Enter Mobile Number" />
                        <Text label="Designation" placeholder="Enter Designation" />
                        <Text label="Email ID" placeholder="Enter Email ID" />
                        <Text label="User ID" placeholder="Generated User ID" />
                        <Text label="Temp PIN/Password" placeholder="****************" />
                        <Pick label="CSO" placeholder="Select CSO" />
                        <DateF label="Date of Sign In of MOU" />
                        <DateF label="MOU End Date" />
                        <Pick label="Status" placeholder="Select Status" options={['Active', 'Pending', 'Suspended']} />
                    </Section>

                    <div className="flex justify-end gap-2 py-2">
                        <NmButton type="submit" className="w-40">
                            Create ID
                        </NmButton>
                        <NmButton type="submit" className="w-40">
                            Modify ID
                        </NmButton>
                        <NmButton type="reset" variant="outline" className="w-40">
                            Cancel
                        </NmButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
