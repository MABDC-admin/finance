import React, { ReactNode } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

interface FinanceLayoutProps {
    header?: ReactNode;
    children: ReactNode;
}

// ─── Finance sub-navigation items ────────────────────────────────────────────
function useFinanceNavItems() {
    return [
        {
            label: 'Overview Dashboard',
            href: route('finance.index'),
            active: route().current('finance.index'),
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
        },
        {
            label: 'Learner Accounts',
            href: route('learner-accounts.index'),
            active: route().current('learner-accounts.*'),
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
        {
            label: 'Fee Structures',
            href: route('finance.fees.index'),
            active: route().current('finance.fees.*') || route().current('finance.fees'),
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            label: 'Batch Assessment',
            href: route('finance.settings'),
            active: route().current('finance.settings'),
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
        },
        {
            label: 'Reports',
            href: route('finance.reports.index'),
            active: route().current('finance.reports.*') || route().current('finance.reports.index'),
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
        },
        {
            label: 'Audit Trail',
            href: route('audit-trail.index'),
            active: route().current('audit-trail.*') || route().current('audit-trail'),
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            moduleKey: 'audit_trail',
        },
    ];
}

export default function FinanceLayout({ header, children }: FinanceLayoutProps) {
    const auth = usePage().props.auth;
    const user = auth.user;
    const modulePermissions: any = auth.modulePermissions ?? {};

    const navItems = useFinanceNavItems().filter(item => {
        if (item.moduleKey) {
            return modulePermissions[item.moduleKey] ?? false;
        }
        return true;
    });

    const financeSidebar = (
        <aside className="ops-sidebar hidden sticky top-0 h-screen overflow-y-auto bg-[#005f3d] px-4 py-6 text-emerald-100 shadow-2xl lg:block no-scrollbar">
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-3 px-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 shadow-premium backdrop-blur-md">
                    <ApplicationLogo className="h-10 w-10 fill-current text-white drop-shadow-md" />
                </div>
                <div className="tracking-tight text-white">
                    <p className="text-sm font-black leading-tight">M.A BRAIN</p>
                    <p className="text-sm font-black leading-tight">DEVELOPMENT CENTER</p>
                    <p className="text-sm font-black leading-tight">OR MABDC</p>
                </div>
            </Link>

            {/* Navigation label header */}
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mt-12 mb-3 px-4">
                Finance Portal
            </p>

            {/* Nav Items */}
            <nav className="mt-12 space-y-2">
                {/* Module navigation links */}
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={[
                            'flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left text-sm font-bold transition duration-300',
                            item.active
                                ? 'bg-white/15 text-white shadow-glow ring-1 ring-white/20'
                                : 'text-emerald-100/70 hover:bg-white/5 hover:text-white',
                        ].join(' ')}
                    >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                            {item.icon}
                        </span>
                        <span className="min-w-0 flex-1 truncate leading-tight">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Profile Information & Logout */}
            <div className="mt-12 mb-6">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur-xl transition hover:bg-white/[0.06] mb-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
                        Current access
                    </p>
                    <p className="mt-2 text-lg font-black text-white drop-shadow-sm truncate">{user.name}</p>
                    <p className="mt-1 text-xs font-bold text-emerald-200/80 uppercase tracking-widest">
                        {user.role}
                    </p>
                </div>

                <div>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-sm font-bold text-red-200 hover:bg-red-500/20 hover:text-red-100 transition duration-300"
                    >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l5-5-5-5" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12H9" />
                            </svg>
                        </span>
                        <span className="min-w-0 flex-1 truncate">Logout</span>
                    </Link>
                </div>
            </div>
        </aside>
    );

    return (
        <AuthenticatedLayout header={header} sidebar={financeSidebar}>
            {children}
        </AuthenticatedLayout>
    );
}
