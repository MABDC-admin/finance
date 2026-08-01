import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-6">
                <p className="ops-kicker">Secure access</p>
                <h1 className="mt-2 text-3xl font-black ops-title">
                    Enter the registry
                </h1>
                <p className="mt-2 text-sm font-medium ops-muted">
                    MABDC 2026-2027 registrar workspace.
                </p>
            </div>

            {status && (
                <div className="mb-4 rounded-md border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-sm font-medium text-emerald-800">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData(
                                    'remember',
                                    (e.target.checked || false) as false,
                                )
                            }
                        />
                        <span className="ms-2 text-sm ops-muted">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm font-semibold ops-muted underline hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <PrimaryButton className="ms-4 ops-button-primary" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200">
                    <p className="text-xs font-semibold ops-muted uppercase tracking-wider mb-4">Quick Login (Dev)</p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setData((prev) => ({
                                    ...prev,
                                    email: 'admin@mabdc.org',
                                    password: 'Denskie123'
                                }));
                            }}
                            className="px-3 py-1.5 text-xs font-bold rounded ops-button-secondary transition"
                        >
                            Admin
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setData((prev) => ({
                                    ...prev,
                                    email: 'registrar@mabdc.org',
                                    password: 'Denskie123'
                                }));
                            }}
                            className="px-3 py-1.5 text-xs font-bold rounded ops-button-secondary transition"
                        >
                            Registrar
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setData((prev) => ({
                                    ...prev,
                                    email: 'finance@mabdc.org',
                                    password: 'Denskie123'
                                }));
                            }}
                            className="px-3 py-1.5 text-xs font-bold rounded ops-button-secondary transition"
                        >
                            Finance
                        </button>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
