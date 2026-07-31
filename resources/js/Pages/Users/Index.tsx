import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type ManagedUser = {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
};

type Props = {
    users: ManagedUser[];
    roles: string[];
};

export default function UsersIndex({ users, roles }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        Administration
                    </p>
                    <h2 className="text-xl font-semibold leading-tight text-gray-900">
                        User Roles
                    </h2>
                </div>
            }
        >
            <Head title="User Roles" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-base font-semibold text-gray-900">
                                Account access
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Basic users can sign in but cannot access
                                registrar records until promoted.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <HeaderCell>User</HeaderCell>
                                        <HeaderCell>Email</HeaderCell>
                                        <HeaderCell>Role</HeaderCell>
                                        <HeaderCell>Action</HeaderCell>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {users.map((user) => (
                                        <UserRoleRow
                                            key={user.id}
                                            user={user}
                                            roles={roles}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function UserRoleRow({
    user,
    roles,
}: {
    user: ManagedUser;
    roles: string[];
}) {
    const { data, setData, patch, processing, errors, isDirty } = useForm({
        role: user.role,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        patch(route('users.role.update', user.id), {
            preserveScroll: true,
        });
    };

    return (
        <tr>
            <td className="whitespace-nowrap px-6 py-4">
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="mt-1 text-xs text-gray-500">ID {user.id}</p>
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                {user.email}
            </td>
            <td className="whitespace-nowrap px-6 py-4">
                <form onSubmit={submit} className="flex items-start gap-3">
                    <div>
                        <select
                            value={data.role}
                            onChange={(event) =>
                                setData('role', event.target.value)
                            }
                            className="block w-40 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            {roles.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>
                        {errors.role && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.role}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={processing || !isDirty}
                        className="inline-flex h-9 items-center rounded-md bg-gray-900 px-3 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Save
                    </button>
                </form>
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {roleDescription(data.role)}
            </td>
        </tr>
    );
}

function HeaderCell({ children }: { children: string }) {
    return (
        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            {children}
        </th>
    );
}

function roleDescription(role: string) {
    if (role === 'admin') {
        return 'Can manage users and registrar data';
    }

    if (role === 'registrar') {
        return 'Can manage registrar records';
    }

    return 'No registrar access';
}
