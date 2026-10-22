import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Button, Input } from 'antd';
import { LockOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';

import loginImage from '../../assets/images/loginHero.jpg';
import ibimaLogo from '../../assets/images/ibimaLogo.svg';
import { changePassword, getUser, login, logout } from '../../auth/session.js';
import ROUTES from '../../constants/routes.js';

// Same look as the Admin portal's sign-in. Accounts are created there
// (Admin > Create Users); a temp password must be changed on first sign-in.

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
const generateCaptcha = (length = 5) =>
    Array.from({ length }, () => CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]).join('');

const HERO_RATIO = 876 / 1117;
const INPUT_STYLE = { height: 34, border: '1px solid #e2e8f0' };

function Label({ children, extra }) {
    return (
        <div className="mb-1 flex items-center justify-between">
            <label className="text-[12px] font-semibold text-slate-900">
                {children} <span className="text-red-500">*</span>
            </label>
            {extra}
        </div>
    );
}

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { message } = App.useApp();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [captcha, setCaptcha] = useState(() => generateCaptcha());
    const [captchaInput, setCaptchaInput] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    // Step 2 after a temp-password sign-in.
    const [mustChange, setMustChange] = useState(() => !!getUser()?.mustChangePassword);
    const [newPassword, setNewPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    const target = location.state?.from ?? ROUTES.dashboard;

    useEffect(() => {
        const u = getUser();
        if (u && !u.mustChangePassword) navigate(target, { replace: true });
        else if (new URLSearchParams(location.search).get('expired')) setError('Your session has ended. Please sign in again.');
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const refreshCaptcha = () => {
        setCaptcha(generateCaptcha());
        setCaptchaInput('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!identifier.trim()) return setError('Please enter your User ID or email address.');
        if (!password) return setError('Please enter your password.');
        if (captchaInput.trim() !== captcha) {
            setError('Captcha does not match (it is case-sensitive).');
            refreshCaptcha();
            return undefined;
        }
        setError('');
        setLoading(true);
        try {
            const user = await login(identifier, password);
            if (user.mustChangePassword) {
                setMustChange(true);
                return undefined;
            }
            message.success(`Welcome, ${user.name}`);
            navigate(target, { replace: true });
        } catch (err) {
            setError(err.message);
            refreshCaptcha();
            setPassword('');
        } finally {
            setLoading(false);
        }
        return undefined;
    };

    const handleChange = async (event) => {
        event.preventDefault();
        if (newPassword !== confirm) return setError('The two new passwords do not match.');
        setError('');
        setLoading(true);
        try {
            await changePassword(password, newPassword);
            message.success('Password changed');
            navigate(target, { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
        return undefined;
    };

    return (
        <div className="flex h-screen overflow-hidden bg-white">
            <div className="relative hidden overflow-hidden bg-white lg:block lg:w-1/2" style={{ containerType: 'size' }}>
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2"
                    style={{ width: `max(100cqw, calc(100cqh * ${HERO_RATIO}))`, aspectRatio: HERO_RATIO }}
                >
                    <img src={loginImage} alt="Smarter Claims. Stronger Protection." className="absolute inset-0 h-full w-full" />
                </div>
            </div>

            <div className="flex w-full items-center justify-center overflow-y-auto px-5 py-4 lg:w-1/2">
                <div className="w-full max-w-[380px]">
                    <div className="mb-4 flex justify-center">
                        <img src={ibimaLogo} alt="IBima Assist" style={{ height: 44 }} />
                    </div>

                    {!mustChange ? (
                        <>
                            <h1 className="m-0 text-lg font-bold text-slate-900">Welcome back</h1>
                            <p className="mt-0.5 mb-3 text-[12px] text-slate-900">
                                Sign in to the Claim Management portal with the account your admin created.
                            </p>

                            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2.5">
                                <div>
                                    <Label>User ID / Email Address</Label>
                                    <Input
                                        prefix={<UserOutlined className="text-slate-400" />}
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        placeholder="Enter User ID or Email"
                                        autoComplete="username"
                                        variant="filled"
                                        style={INPUT_STYLE}
                                    />
                                </div>
                                <div>
                                    <Label
                                        extra={
                                            <button
                                                type="button"
                                                className="text-xs text-slate-400"
                                                onClick={() => message.info('Ask your admin to reset it (Admin > Password Reset).')}
                                            >
                                                Forgot password?
                                            </button>
                                        }
                                    >
                                        Password
                                    </Label>
                                    <Input.Password
                                        prefix={<LockOutlined className="text-slate-400" />}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter Password"
                                        autoComplete="current-password"
                                        variant="filled"
                                        style={INPUT_STYLE}
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <span
                                        className="text-[12px] text-slate-900 select-none"
                                        style={{ letterSpacing: '0.55em', fontFamily: 'monospace' }}
                                        data-testid="captcha"
                                    >
                                        {captcha}
                                    </span>
                                    <button type="button" onClick={refreshCaptcha} aria-label="Refresh captcha" className="text-[#1450d8]">
                                        <ReloadOutlined />
                                    </button>
                                </div>
                                <Input
                                    value={captchaInput}
                                    onChange={(e) => setCaptchaInput(e.target.value)}
                                    aria-label="Captcha"
                                    placeholder="Enter the captcha"
                                    variant="filled"
                                    style={INPUT_STYLE}
                                />

                                {error ? <p role="alert" className="m-0 text-xs text-red-500">{error}</p> : null}

                                <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 34, fontWeight: 600 }}>
                                    Sign In
                                </Button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h1 className="m-0 text-lg font-bold text-slate-900">Set a new password</h1>
                            <p className="mt-0.5 mb-3 text-[12px] text-slate-900">
                                You signed in with a temporary password. Choose your own to continue (8+ characters, letters and numbers).
                            </p>
                            <form onSubmit={handleChange} noValidate className="flex flex-col gap-2.5">
                                {!password ? (
                                    <div>
                                        <Label>Current (temporary) password</Label>
                                        <Input.Password value={password} onChange={(e) => setPassword(e.target.value)} variant="filled" style={INPUT_STYLE} />
                                    </div>
                                ) : null}
                                <div>
                                    <Label>New password</Label>
                                    <Input.Password
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        autoComplete="new-password"
                                        variant="filled"
                                        style={INPUT_STYLE}
                                    />
                                </div>
                                <div>
                                    <Label>Confirm new password</Label>
                                    <Input.Password
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        autoComplete="new-password"
                                        variant="filled"
                                        style={INPUT_STYLE}
                                    />
                                </div>
                                {error ? <p role="alert" className="m-0 text-xs text-red-500">{error}</p> : null}
                                <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 34, fontWeight: 600 }}>
                                    Save &amp; Continue
                                </Button>
                                <Button
                                    type="link"
                                    onClick={() => {
                                        logout();
                                        setMustChange(false);
                                        setPassword('');
                                    }}
                                >
                                    Sign in as someone else
                                </Button>
                            </form>
                        </>
                    )}

                    <div className="mt-4 text-[10px] leading-snug text-slate-900">
                        <p className="m-0">Powered By Vroomsync Expertise Private Limited. All Rights Reserved 2025.</p>
                        <p className="m-0">Insurance is the subject matter of solicitation.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
