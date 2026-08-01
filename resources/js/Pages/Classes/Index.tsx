import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

type ActiveYear = {
    id: number;
    name: string;
} | null;

type Section = {
    id: number;
    academic_year_id: number;
    level: string;
    name: string;
    session: string;
    teacher_name: string | null;
    notes: string | null;
    enrollments_count: number;
};

export default function ClassesIndex({ activeYear, sections }: { activeYear: ActiveYear, sections: Section[] }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        academic_year_id: activeYear?.id || '',
        level: '',
        name: '',
        session: 'morning',
        teacher_name: '',
        notes: '',
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('classes.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Class & Section Management</h1>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                            {activeYear ? `Managing sections for ${activeYear.name}` : 'No active academic year found.'}
                        </p>
                    </div>
                    {activeYear && (
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                            >
                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                Create Section
                            </button>
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Class & Section Management" />

            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-none">
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {sections.map((section) => (
                            <Link 
                                key={section.id} 
                                href={route('classes.show', section.id)}
                                className="block group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-emerald-300 transition-all duration-200"
                            >
                                <div className="p-5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-black text-emerald-600 uppercase tracking-wider">{section.level}</p>
                                            <h3 className="text-lg font-black text-slate-900 mt-1 group-hover:text-emerald-700 transition-colors">{section.name}</h3>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                            section.session === 'morning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                            section.session === 'afternoon' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                            'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        }`}>
                                            {section.session.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 font-medium">Adviser</span>
                                            <span className="font-bold text-slate-700">{section.teacher_name || 'Unassigned'}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-slate-500 font-medium">Students</span>
                                            <span className="font-black text-emerald-600 text-lg">{section.enrollments_count}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center group-hover:bg-emerald-50 transition-colors">
                                    <span className="text-xs font-bold text-slate-500 group-hover:text-emerald-600">Manage Roster &rarr;</span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {sections.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
                            <svg className="mx-auto h-12 w-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <h3 className="text-base font-black text-slate-900">No sections found</h3>
                            <p className="mt-1 text-sm text-slate-500">Get started by creating a new section for this academic year.</p>
                            <div className="mt-6">
                                <PrimaryButton onClick={() => setIsCreateModalOpen(true)}>
                                    Create Section
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <form onSubmit={submitCreate} className="p-6">
                    <h2 className="text-lg font-black text-slate-900 mb-6">Create New Section</h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <InputLabel htmlFor="level" value="Grade Level" />
                            <TextInput
                                id="level"
                                className="mt-1 block w-full"
                                value={data.level}
                                onChange={(e) => setData('level', e.target.value)}
                                placeholder="e.g. Grade 1"
                                required
                            />
                            <InputError message={errors.level} className="mt-2" />
                        </div>
                        <div className="col-span-1">
                            <InputLabel htmlFor="name" value="Section Name" />
                            <TextInput
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Apollo"
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div className="col-span-1">
                            <InputLabel htmlFor="session" value="Session" />
                            <select
                                id="session"
                                className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={data.session}
                                onChange={(e) => setData('session', e.target.value)}
                                required
                            >
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="full_day">Full Day</option>
                            </select>
                            <InputError message={errors.session} className="mt-2" />
                        </div>

                        <div className="col-span-1">
                            <InputLabel htmlFor="teacher_name" value="Adviser / Teacher Name" />
                            <TextInput
                                id="teacher_name"
                                className="mt-1 block w-full"
                                value={data.teacher_name}
                                onChange={(e) => setData('teacher_name', e.target.value)}
                                placeholder="e.g. John Doe"
                            />
                            <InputError message={errors.teacher_name} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsCreateModalOpen(false)}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing}>Create Section</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
