import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage, router } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

type NavItem = {
    moduleKey: string;
    label: string;
    href: string;
    active: boolean;
    icon: ReactNode;
    children?: NavSubItem[];
    adminOnly?: boolean;
    soon?: boolean;
    chevron?: boolean;
    method?: 'post';
    as?: 'button';
};

type NavSubItem = {
    label: string;
    href?: string;
    active: boolean;
    soon?: boolean;
    requiredModuleKey?: string;
};

export default function Authenticated({
    header,
    children,
    sidebar,
    hideSidebar = false,
}: PropsWithChildren<{ header?: ReactNode; sidebar?: ReactNode; hideSidebar?: boolean }>) {
    const auth = usePage().props.auth;
    const user = auth.user;
    const modulePermissions = auth.modulePermissions ?? {};
    const isAdmin = user.role === 'admin';
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        if (route().current('learner-accounts.*') || route().current('finance.*')) {
            router.get(route('learner-accounts.index'), { search: searchQuery });
        } else {
            router.get(route('learners.index'), { search: searchQuery });
        }
    };

    const [openNavGroups, setOpenNavGroups] = useState<Record<string, boolean>>({});

    const navItems: NavItem[] = ([
        {
            moduleKey: 'dashboard',
            label: 'Registrar Dashboard',
            href: route('dashboard'),
            active: route().current('dashboard'),
            icon: <DashboardIcon />,
        },
        {
            moduleKey: 'learner_management',
            label: 'Learner Management',
            href: route('learners.index'),
            active: route().current('learners.*'),
            icon: <LearnerIcon />,
        },
        {
            moduleKey: 'admission',
            label: 'Admission & Application',
            href: route('admissions.index'),
            active: route().current('admissions.*'),
            icon: <AdmissionIcon />,
            soon: true,
        },
        {
            moduleKey: 'enrollment',
            label: 'Enrollment Management',
            href: route('enrollments.index'),
            active: route().current('enrollments.*'),
            icon: <EnrollmentIcon />,
            soon: true,
        },
        {
            moduleKey: 'document_center',
            label: 'Documents & Requirements',
            href: route('imports.index'),
            active: route().current('imports.*'),
            icon: <DocumentsIcon />,
        },
        {
            moduleKey: 'class_section',
            label: 'Class & Section Management',
            href: route('classes.index'),
            active: route().current('classes.*'),
            icon: <ClassIcon />,
            soon: true,
        },
        {
            moduleKey: 'academic_records',
            label: 'Academic Records',
            href: route('academic-records.index'),
            active: route().current('academic-records.*'),
            icon: <RecordsIcon />,
            soon: true,
        },
        {
            moduleKey: 'attendance',
            label: 'Attendance Records',
            href: route('attendance.index'),
            active: route().current('attendance.*'),
            icon: <AttendanceIcon />,
            soon: true,
        },
        {
            moduleKey: 'transfer_withdrawal',
            label: 'Transfer & Withdrawal',
            href: route('transfers.index'),
            active: route().current('transfers.*'),
            icon: <TransferIcon />,
            soon: true,
        },
        {
            moduleKey: 'certificates',
            label: 'Certificates & Documents',
            href: route('certificates.index'),
            active: route().current('certificates.*'),
            icon: <CertificatesIcon />,
            soon: true,
        },
        {
            moduleKey: 'finance',
            label: 'Finance Dashboard',
            href: route('finance.index'),
            active: route().current('finance.*'),
            icon: <FinanceIcon />,
        },
        {
            moduleKey: 'learner_accounts',
            label: 'Learner Accounts',
            href: route('learner-accounts.index'),
            active: route().current('learner-accounts.*'),
            icon: <LedgerIcon />,
        },
        {
            moduleKey: 'reports',
            label: 'Reports & Analytics',
            href: route('reports.index'),
            active: route().current('reports.*'),
            icon: <ReportsIcon />,
            soon: true,
        },
        {
            moduleKey: 'user_access',
            label: 'User Access & Audit Trail',
            href: isAdmin ? route('users.index') : '#',
            active: route().current('users.*') || route().current('profile.*'),
            icon: <SecurityIcon />,
            adminOnly: true,
        },
    ] as NavItem[]).filter((item) => {
        if (item.adminOnly && !isAdmin) {
            return false;
        }
        return modulePermissions[item.moduleKey] ?? false;
    });

    return (
        <div className="ops-screen bg-slate-50 selection:bg-emerald-500 selection:text-white">
            <div className={(hideSidebar && !sidebar) ? "ops-shell" : "ops-shell lg:grid lg:grid-cols-[300px_minmax(0,1fr)]"}>
                {sidebar ? (
                    sidebar
                ) : !hideSidebar ? (
                    <aside className="ops-sidebar hidden sticky top-0 h-screen overflow-y-auto bg-slate-950 px-4 py-6 text-slate-300 shadow-2xl lg:block no-scrollbar">
                        <Link href="/" className="flex items-center gap-3 px-2">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-premium backdrop-blur-md">
                                <ApplicationLogo className="h-10 w-10 fill-current text-emerald-400 drop-shadow-md" />
                            </div>
                            <div className="tracking-tight text-white">
                                <p className="text-sm font-black leading-tight">
                                    M.A BRAIN
                                </p>
                                <p className="text-sm font-black leading-tight">
                                    DEVELOPMENT CENTER
                                </p>
                                <p className="text-sm font-black leading-tight">
                                    OR MABDC
                                </p>
                            </div>
                        </Link>

                        <nav className="mt-12 space-y-2">
                            {navItems.map((item) => (
                                <SidebarEntry
                                    key={item.label}
                                    item={item}
                                    open={openNavGroups[item.moduleKey] ?? item.active}
                                    onToggle={() =>
                                        setOpenNavGroups((current) => ({
                                            ...current,
                                            [item.moduleKey]:
                                                !(current[item.moduleKey] ??
                                                    item.active),
                                        }))
                                    }
                                />
                            ))}
                        </nav>

                        <div className="mt-12 mb-6 rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-lg backdrop-blur-xl transition hover:bg-white/[0.04]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/80">
                                Current access
                            </p>
                            <p className="mt-2 text-lg font-black text-white drop-shadow-sm">{user.name}</p>
                            <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {user.role}
                            </p>
                        </div>

                        <div className="mb-6">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition duration-300"
                            >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                                    <LogoutIcon />
                                </span>
                                <span className="min-w-0 flex-1 truncate">Logout</span>
                            </Link>
                        </div>
                    </aside>
                ) : null}

                <section className="min-h-screen bg-slate-50">
                    <div className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
                        <div className="flex min-h-[5.5rem] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm lg:hidden"
                            >
                                Menu
                            </button>

                             <div className="min-w-0 flex-1 flex items-center gap-4">
                                 {header}
                                 
                                 {/* Global Learner Search Bar */}
                                 <form onSubmit={handleSearchSubmit} className="hidden md:block max-w-xs w-full ml-6">
                                     <div className="relative">
                                         <input
                                             type="text"
                                             value={searchQuery}
                                             onChange={(e) => setSearchQuery(e.target.value)}
                                             placeholder="Search learners..."
                                             className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005f3d] focus:border-[#005f3d] transition-all"
                                         />
                                         <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                             </svg>
                                         </span>
                                     </div>
                                 </form>
                             </div>

                             <div className="hidden items-center gap-5 sm:flex">
                                 {/* Activated Notification Dropdown */}
                                 <Dropdown>
                                     <Dropdown.Trigger>
                                         <button
                                             type="button"
                                             className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-[#005f3d] focus:outline-none"
                                         >
                                             <svg
                                                 className="h-5 w-5"
                                                 viewBox="0 0 24 24"
                                                 fill="none"
                                                 stroke="currentColor"
                                                 strokeWidth="2.5"
                                                 strokeLinecap="round"
                                                 strokeLinejoin="round"
                                             >
                                                 <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                                                 <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                             </svg>
                                             {((usePage().props.recentNotifications as any[]) || []).length > 0 && (
                                                 <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-white">
                                                     {((usePage().props.recentNotifications as any[]) || []).length}
                                                 </span>
                                             )}
                                         </button>
                                     </Dropdown.Trigger>
                                     <Dropdown.Content align="right" width="80" contentClasses="py-0 bg-white ring-1 ring-black/5 rounded-2xl overflow-hidden shadow-2xl">
                                         <div className="border-b border-slate-100 px-4 py-3 bg-slate-50/50">
                                             <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                                                 Recent Activities
                                             </p>
                                         </div>
                                         <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 min-w-[280px]">
                                             {(!usePage().props.recentNotifications || (usePage().props.recentNotifications as any[]).length === 0) ? (
                                                 <div className="px-4 py-6 text-center text-xs text-slate-400 font-semibold">
                                                     No recent activities.
                                                 </div>
                                             ) : (
                                                 ((usePage().props.recentNotifications as any[]) || []).map((notif: any) => (
                                                     <div key={notif.id} className="px-4 py-3 hover:bg-slate-50 transition text-left">
                                                         <p className="text-xs text-slate-800 font-medium leading-normal">
                                                             <span className="font-extrabold text-[#005f3d]">{notif.actor}</span>{' '}
                                                             <span className="lowercase">{notif.event_type.replace(/_/g, ' ')}</span>{' '}
                                                             <span className="text-slate-450 font-bold text-[10px] uppercase">({notif.subject_type})</span>
                                                         </p>
                                                         <p className="mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                                                             {notif.created_at}
                                                         </p>
                                                     </div>
                                                 ))
                                             )}
                                         </div>
                                         <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/50 text-center">
                                             <Link
                                                 href={route('dashboard')}
                                                 className="text-[10px] font-black text-[#005f3d] hover:underline uppercase tracking-wider"
                                             >
                                                 View All Activities
                                             </Link>
                                         </div>
                                     </Dropdown.Content>
                                 </Dropdown>
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:bg-slate-50"
                                        >
                                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-black text-white shadow-glow">
                                                {user.name
                                                    .slice(0, 1)
                                                    .toUpperCase()}
                                            </span>
                                            <span>
                                                <span className="block text-sm font-black text-slate-900">
                                                    {user.name}
                                                </span>
                                                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    {user.role}
                                                </span>
                                            </span>
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile Settings
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {showingNavigationDropdown && (
                            <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
                                <div className="grid gap-2">
                                    {navItems.map((item) => (
                                        <MobileNavEntry
                                            key={item.label}
                                            item={item}
                                            open={
                                                openNavGroups[item.moduleKey] ??
                                                item.active
                                            }
                                            onToggle={() =>
                                                setOpenNavGroups((current) => ({
                                                    ...current,
                                                    [item.moduleKey]:
                                                        !(current[
                                                            item.moduleKey
                                                        ] ?? item.active),
                                                }))
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <main>{children}</main>
                </section>
            </div>
        </div>
    );
}

function SidebarEntry({
    item,
    open,
    onToggle,
}: {
    item: NavItem;
    open: boolean;
    onToggle: () => void;
}) {
    if (item.children?.length) {
        return (
            <div>
                <button
                    type="button"
                    onClick={onToggle}
                    aria-expanded={open}
                    className={
                        'flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left text-sm font-bold transition duration-300 ' +
                        (item.active
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-glow ring-1 ring-white/10'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white')
                    }
                >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                        {item.icon}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    <ChevronDisclosureIcon open={open} />
                </button>

                {open && <SidebarSubNav items={item.children} />}
            </div>
        );
    }

    return <SidebarLink item={item} />;
}

function SidebarLink({ item }: { item: NavItem }) {
    const content = (
        <>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                {item.icon}
            </span>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.soon && (
                <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-green-50 ring-1 ring-white/20">
                    Soon
                </span>
            )}
            {item.chevron && (
                <span className="text-green-100">
                    <ChevronRightIcon />
                </span>
            )}
        </>
    );

    return (
        <Link
            href={item.href}
            method={item.method}
            as={item.as}
            className={
                'flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left text-sm font-bold transition duration-300 ' +
                (item.active
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-glow ring-1 ring-white/10'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white')
            }
        >
            {content}
        </Link>
    );
}

function SidebarSubNav({ items }: { items: NavSubItem[] }) {
    return (
        <div className="ml-8 mt-3 space-y-1 border-l-2 border-white/5 pl-3">
            {items.map((item) =>
                item.soon || !item.href ? (
                    <div
                        key={item.label}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black text-green-100/70"
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-green-100/50" />
                        <span className="min-w-0 flex-1 truncate">
                            {item.label}
                        </span>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] uppercase tracking-wide ring-1 ring-white/10">
                            Soon
                        </span>
                    </div>
                ) : (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={
                            'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold transition duration-200 ' +
                            (item.active
                                ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/20'
                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200')
                        }
                    >
                        <span
                            className={
                                'h-1.5 w-1.5 rounded-full transition-colors ' +
                                (item.active ? 'bg-emerald-400 shadow-glow' : 'bg-slate-600 group-hover:bg-slate-400')
                            }
                        />
                        <span className="min-w-0 flex-1 truncate">
                            {item.label}
                        </span>
                    </Link>
                ),
            )}
        </div>
    );
}

function MobileNavEntry({
    item,
    open,
    onToggle,
}: {
    item: NavItem;
    open: boolean;
    onToggle: () => void;
}) {
    if (item.children?.length) {
        return (
            <div className="rounded-xl bg-slate-50">
                <button
                    type="button"
                    onClick={onToggle}
                    aria-expanded={open}
                    className={
                        'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-black ' +
                        (item.active
                            ? 'bg-green-600 text-white'
                            : 'text-slate-700')
                    }
                >
                    {item.icon}
                    <span className="min-w-0 flex-1 truncate">
                        {item.label}
                    </span>
                    <ChevronDisclosureIcon open={open} />
                </button>

                {open && (
                    <div className="grid gap-1 px-3 pb-3 pt-2">
                        {item.children.map((child) =>
                            child.soon || !child.href ? (
                                <div
                                    key={child.label}
                                    className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-400"
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                    <span className="min-w-0 flex-1 truncate">
                                        {child.label}
                                    </span>
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] uppercase tracking-wide text-slate-500">
                                        Soon
                                    </span>
                                </div>
                            ) : (
                                <Link
                                    key={child.label}
                                    href={child.href}
                                    className={
                                        'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black ' +
                                        (child.active
                                            ? 'bg-green-100 text-green-900'
                                            : 'bg-white text-slate-700')
                                    }
                                >
                                    <span
                                        className={
                                            'h-1.5 w-1.5 rounded-full ' +
                                            (child.active
                                                ? 'bg-green-700'
                                                : 'bg-slate-300')
                                        }
                                    />
                                    <span className="min-w-0 flex-1 truncate">
                                        {child.label}
                                    </span>
                                </Link>
                            ),
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            href={item.href}
            method={item.method}
            as={item.as}
            className={
                'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-black ' +
                (item.active
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-50 text-slate-700')
            }
        >
            {item.icon}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.soon && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-green-800">
                    Soon
                </span>
            )}
            {item.chevron && (
                <span className="text-green-700">
                    <ChevronRightIcon />
                </span>
            )}
        </Link>
    );
}

function ChevronDisclosureIcon({ open }: { open: boolean }) {
    return (
        <svg
            className={
                'h-4 w-4 shrink-0 transition-transform ' +
                (open ? 'rotate-90' : '')
            }
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}

function IconShell({ children }: PropsWithChildren) {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {children}
        </svg>
    );
}

// === NEW ICONS FOR 12 MODULES ===

function DashboardIcon() {
    return (
        <IconShell>
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
        </IconShell>
    );
}

function LearnerIcon() {
    return (
        <IconShell>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </IconShell>
    );
}

function AdmissionIcon() {
    return (
        <IconShell>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <path d="M9 14h6" />
            <path d="M9 10h6" />
        </IconShell>
    );
}

function EnrollmentIcon() {
    return (
        <IconShell>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="m9 15 2 2 4-4" />
        </IconShell>
    );
}

function DocumentsIcon() {
    return (
        <IconShell>
            <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M3 15h6" />
            <path d="M3 18h6" />
        </IconShell>
    );
}

function ClassIcon() {
    return (
        <IconShell>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2" />
            <rect x="9" y="5" width="8" height="4" rx="1" />
        </IconShell>
    );
}

function RecordsIcon() {
    return (
        <IconShell>
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </IconShell>
    );
}

function AttendanceIcon() {
    return (
        <IconShell>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="m9 16 2 2 4-4" />
        </IconShell>
    );
}

function TransferIcon() {
    return (
        <IconShell>
            <path d="M16 3h5v5" />
            <path d="M8 3H3v5" />
            <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" />
            <path d="m15 9 6-6" />
        </IconShell>
    );
}

function CertificatesIcon() {
    return (
        <IconShell>
            <path d="M12 15V3" />
            <path d="M8 7h8" />
            <path d="M6 11h12" />
            <circle cx="12" cy="19" r="2" />
        </IconShell>
    );
}

function ReportsIcon() {
    return (
        <IconShell>
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
        </IconShell>
    );
}

function SecurityIcon() {
    return (
        <IconShell>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </IconShell>
    );
}

function LogoutIcon() {
    return (
        <IconShell>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
        </IconShell>
    );
}

function ChevronRightIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}


function FinanceIcon() {
    return (
        <IconShell>
            <path d="M12 2v20" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </IconShell>
    );
}

function LedgerIcon() {
    return (
        <IconShell>
            <path d="M4 2h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
            <path d="M8 6h8M8 10h8M8 14h5" />
        </IconShell>
    );
}
