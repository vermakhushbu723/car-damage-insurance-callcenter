import { App, Button } from 'antd';
import {
    AlertOutlined,
    AppstoreOutlined,
    AuditOutlined,
    CheckOutlined,
    ClockCircleOutlined,
    CopyOutlined,
    CreditCardOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    LinkOutlined,
    SafetyOutlined,
    SearchOutlined,
    ShopOutlined,
    ThunderboltOutlined,
    UserOutlined,
    WalletOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import {
    CLAIM_ACTION_BUTTONS,
    CLAIM_IDENTITY,
    CLAIM_META,
    CLAIM_STAGES,
    META_TONES,
} from '../../data/claimWorkflowData.js';
import ROUTES from '../../constants/routes.js';
import cn from '../../utils/cn.js';

const META_ICONS = {
    clock: ClockCircleOutlined,
    file: FileTextOutlined,
    shop: ShopOutlined,
    pin: EnvironmentOutlined,
    alert: AlertOutlined,
    rupee: DollarOutlined,
};

const STAGE_ICONS = {
    check: CheckOutlined,
    user: UserOutlined,
    search: SearchOutlined,
    file: FileTextOutlined,
    sparkle: ThunderboltOutlined,
    shield: SafetyOutlined,
    wallet: WalletOutlined,
    card: CreditCardOutlined,
};

const ACTION_ICONS = {
    link: LinkOutlined,
    grid: AppstoreOutlined,
    file: FileTextOutlined,
    audit: AuditOutlined,
};

function ClaimIdentityRow() {
    const { message } = App.useApp();

    return (
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 xl:grid-cols-7">
            {CLAIM_IDENTITY.map((field) => (
                <div key={field.key}>
                    <span className="mb-1 block text-[11.5px] font-bold text-[#1450d8]">{field.label}</span>
                    <span className="flex items-center gap-2">
                        <span
                            className={cn(
                                'text-[13.5px] font-bold',
                                field.muted ? 'text-slate-400' : 'text-slate-900'
                            )}
                        >
                            {field.value}
                        </span>
                        {field.copy ? (
                            <CopyOutlined
                                onClick={() => {
                                    navigator.clipboard?.writeText(field.value);
                                    message.success('Copied');
                                }}
                                className="cursor-pointer text-[11.5px] text-slate-400 hover:text-[#1450d8]"
                            />
                        ) : null}
                    </span>
                </div>
            ))}
        </div>
    );
}

function ClaimMetaBar() {
    return (
        <section className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 sm:grid-cols-2 xl:grid-cols-6">
            {CLAIM_META.map((item) => {
                const Icon = META_ICONS[item.icon] || FileTextOutlined;
                return (
                    <div key={item.key} className="flex items-start gap-3">
                        <span
                            className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12.5px]',
                                META_TONES[item.tone]
                            )}
                        >
                            <Icon />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-[11.5px] font-bold text-[#1450d8]">{item.label}</span>
                            <span
                                className={cn(
                                    'block text-[13.5px] leading-6 font-bold',
                                    item.valueTone || 'text-slate-900'
                                )}
                            >
                                {item.value}
                            </span>
                            {item.note ? (
                                <span className="block text-[10.5px] text-slate-500">{item.note}</span>
                            ) : null}
                        </span>
                    </div>
                );
            })}
        </section>
    );
}

function ClaimStageTracker({ stage }) {
    const currentIndex = CLAIM_STAGES.findIndex((item) => item.key === stage);

    return (
        <section className="grid grid-cols-2 gap-x-3 gap-y-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:grid-cols-4 xl:grid-cols-8">
            {CLAIM_STAGES.map((item, index) => {
                const done = currentIndex >= 0 && index <= currentIndex;
                const Icon = done ? CheckOutlined : STAGE_ICONS[item.icon] || FileTextOutlined;

                return (
                    <div key={item.key} className="flex min-w-0 items-center gap-2">
                        <span
                            className={cn(
                                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10.5px]',
                                done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                            )}
                        >
                            <Icon />
                        </span>
                        <span className="min-w-0">
                            <span
                                className={cn(
                                    'block truncate text-[10.5px] font-semibold',
                                    done ? 'text-slate-800' : 'text-slate-400'
                                )}
                            >
                                {item.label}
                            </span>
                            {done ? (
                                <span className="block text-[10px] text-slate-500">{item.time}</span>
                            ) : null}
                        </span>
                    </div>
                );
            })}
        </section>
    );
}

function ClaimActionBar() {
    const navigate = useNavigate();
    const { message } = App.useApp();

    const handle = (action) => {
        if (action.key === 'communication-history') navigate(ROUTES.communicationHistory);
        else message.info(action.label);
    };

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {CLAIM_ACTION_BUTTONS.map((action) => {
                const Icon = ACTION_ICONS[action.icon] || LinkOutlined;
                return (
                    <button
                        key={action.key}
                        type="button"
                        onClick={() => handle(action)}
                        className={cn(
                            'flex items-center justify-center gap-2 rounded-lg py-2.5 text-[12px] font-semibold text-white transition',
                            action.className
                        )}
                    >
                        {action.label} <Icon />
                    </button>
                );
            })}
        </div>
    );
}

/**
 * Common frame for every claim-processing screen:
 * title + claim identity + meta bar + stage tracker + action bar.
 */
export default function ClaimShell({
    title,
    subtitle,
    stage,
    showIdentity = true,
    showMeta = true,
    onNext,
    children,
}) {
    const navigate = useNavigate();
    const { message } = App.useApp();

    return (
        <div className="flex flex-col gap-4">
            <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="mb-0.5 text-[20px] leading-7 font-bold text-[#1450d8]">{title}</h1>
                    {subtitle ? (
                        <p className="mb-0 text-[13.5px] font-bold text-slate-900">{subtitle}</p>
                    ) : null}
                </div>
                <div className="flex shrink-0 gap-3">
                    <Button onClick={() => navigate(ROUTES.allClaims)}>
                        Back To Claim
                    </Button>
                    <Button
                        type="primary"
                        className="!px-8"
                        onClick={onNext || (() => message.info('Next step'))}
                    >
                        Next
                    </Button>
                </div>
            </header>

            {showIdentity ? <ClaimIdentityRow /> : null}
            {showMeta ? <ClaimMetaBar /> : null}
            <ClaimStageTracker stage={stage} />
            <ClaimActionBar />

            {children}
        </div>
    );
}
