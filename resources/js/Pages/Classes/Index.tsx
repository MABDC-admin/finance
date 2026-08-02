import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
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

type Learner = {
    id: number;
    full_name: string;
    normalized_name: string;
};

type Enrollment = {
    id: number;
    learner: Learner;
    level: string;
    section_id: number | null;
    status: string;
};

type ClassesIndexProps = {
    activeYear: ActiveYear;
    sections: Section[];
    enrollments?: Enrollment[];
};

export default function ClassesIndex({ activeYear, sections, enrollments = [] }: ClassesIndexProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'board'>('grid');
    
    // Sync state for local optimistic updates during drag/drop
    const [localEnrollments, setLocalEnrollments] = useState<Enrollment[]>(enrollments);
    
    useEffect(() => {
        setLocalEnrollments(enrollments);
    }, [enrollments]);

    // Unique list of grade levels
    const uniqueLevels = Array.from(new Set([
        ...sections.map(s => s.level),
        ...enrollments.map(e => e.level)
    ])).filter(Boolean).sort();

    const [selectedLevel, setSelectedLevel] = useState<string>(uniqueLevels[0] || '');

    useEffect(() => {
        if (!selectedLevel && uniqueLevels.length > 0) {
            setSelectedLevel(uniqueLevels[0]);
        }
    }, [uniqueLevels, selectedLevel]);

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

    // ── Drag and Drop Handlers ──
    const [draggedEnrollmentId, setDraggedEnrollmentId] = useState<number | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null); // 'unassigned' or 'section-{id}'

    const handleDragStart = (e: React.DragEvent, id: number) => {
        setDraggedEnrollmentId(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id.toString());
    };

    const handleDragOver = (e: React.DragEvent, targetCol: string) => {
        e.preventDefault();
        setDragOverColumn(targetCol);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = (e: React.DragEvent, targetSectionId: number | null) => {
        e.preventDefault();
        setDragOverColumn(null);
        
        const enrollmentIdStr = e.dataTransfer.getData('text/plain') || draggedEnrollmentId?.toString();
        if (!enrollmentIdStr) return;
        
        const enrollmentId = parseInt(enrollmentIdStr, 10);
        const enrollment = localEnrollments.find(x => x.id === enrollmentId);
        
        if (!enrollment) return;
        if (enrollment.section_id === targetSectionId) return; // Dropped on same column

        // 1. Optimistic Update (Immediate feedback in UI)
        setLocalEnrollments(prev => prev.map(x => {
            if (x.id === enrollmentId) {
                return { ...x, section_id: targetSectionId };
            }
            return x;
        }));

        // 2. Perform backend mutation
        if (targetSectionId === null) {
            // Unassign from current section
            const currentSectionId = enrollment.section_id;
            if (currentSectionId) {
                router.post(route('classes.unassign', currentSectionId), {
                    enrollment_id: enrollmentId
                }, { preserveScroll: true });
            }
        } else {
            // Assign to new section
            router.post(route('classes.assign', targetSectionId), {
                enrollment_id: enrollmentId
            }, { preserveScroll: true });
        }

        setDraggedEnrollmentId(null);
    };

    // Filtered data for the board columns and KPI calculations
    const levelSections = sections.filter(s => s.level === selectedLevel);
    const levelEnrollments = localEnrollments.filter(e => e.level === selectedLevel);
    const unassignedStudents = levelEnrollments.filter(e => e.section_id === null);

    // Global Stats for active year
    const totalStudentsCount = localEnrollments.length;
    const sectionedCount = localEnrollments.filter(e => e.section_id !== null).length;
    const unsectionedCount = localEnrollments.filter(e => e.section_id === null).length;
    const sectioningRate = totalStudentsCount > 0 ? Math.round((sectionedCount / totalStudentsCount) * 100) : 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
                            🏫 Registrar Workspace
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Class & Section Management</h1>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                            {activeYear ? `Managing classes and active student sectioning for ${activeYear.name}` : 'No active academic year found.'}
                        </p>
                    </div>
                    
                    {activeYear && (
                        <div className="flex items-center gap-3">
                            {/* Toggle Controls */}
                            <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-250 inline-flex items-center shadow-xs">
                                <button 
                                    onClick={() => setViewMode('grid')}
                                    className={`px-4 py-2 rounded-md text-xs font-black transition flex items-center gap-1.5 ${
                                        viewMode === 'grid' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-855'
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>
                                    Grid View
                                </button>
                                <button 
                                    onClick={() => setViewMode('board')}
                                    className={`px-4 py-2 rounded-md text-xs font-black transition flex items-center gap-1.5 ${
                                        viewMode === 'board' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-855'
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
                                    Interactive Board
                                </button>
                            </div>

                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-black text-white shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all"
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

            <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="mx-auto w-full max-w-none space-y-8">
                    
                    {/* ── Visual KPI Cards ── */}
                    {activeYear && (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-slate-400 block tracking-wider uppercase">Total Class Sections</span>
                                    <span className="text-2xl font-black text-slate-900 block">{sections.length}</span>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">📂</div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-slate-400 block tracking-wider uppercase">Sectioned Students</span>
                                    <span className="text-2xl font-black text-slate-900 block">{sectionedCount} <span className="text-xs font-bold text-slate-400">/ {totalStudentsCount}</span></span>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">✓</div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-slate-400 block tracking-wider uppercase">Unsectioned Pool</span>
                                    <span className="text-2xl font-black text-rose-600 block">{unsectionedCount}</span>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold">⚠️</div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">Sectioning rate</span>
                                    <span className="text-sm font-black text-emerald-600">{sectioningRate}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${sectioningRate}%` }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── GRID VIEW ── */}
                    {viewMode === 'grid' && (
                        <>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {sections.map((section) => (
                                    <Link 
                                        key={section.id} 
                                        href={route('classes.show', section.id)}
                                        className="block group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-emerald-500 hover:scale-[1.01] transition-all duration-200"
                                    >
                                        <div className="p-5">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{section.level}</p>
                                                    <h3 className="text-lg font-black text-slate-900 mt-1.5 group-hover:text-emerald-700 transition-colors">{section.name}</h3>
                                                </div>
                                                <span className={`inline-flex items-center px-2.5 py-0.8 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                                    section.session === 'morning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                    section.session === 'afternoon' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                                    'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                }`}>
                                                    {section.session.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="mt-6 flex items-center justify-between text-sm">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Adviser</span>
                                                    <span className="font-bold text-slate-700">{section.teacher_name || 'TBA'}</span>
                                                </div>
                                                <div className="flex flex-col items-end gap-0.5">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Students</span>
                                                    <span className="font-black text-emerald-600 text-lg leading-tight">{section.enrollments_count}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-100 flex justify-between items-center group-hover:bg-emerald-50/50 transition-colors">
                                            <span className="text-xs font-black text-slate-500 group-hover:text-emerald-600 tracking-wider uppercase">Manage Roster &rarr;</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {sections.length === 0 && (
                                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-xl mx-auto">
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
                        </>
                    )}

                    {/* ── PREMIUM BOARD VIEW ── */}
                    {viewMode === 'board' && (
                        <div className="space-y-6">
                            {/* Grade Selector Row */}
                            <div className="flex flex-wrap items-center gap-2.5 pb-5 border-b border-slate-200">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">Grade Level Filter:</span>
                                {uniqueLevels.map(level => (
                                    <button 
                                        key={level}
                                        onClick={() => setSelectedLevel(level)}
                                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-150 ${
                                            selectedLevel === level 
                                                ? 'bg-[#005f3d] text-white shadow-md' 
                                                : 'bg-white hover:bg-slate-55 text-slate-600 border border-slate-200 shadow-sm'
                                        }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                                {uniqueLevels.length === 0 && (
                                    <span className="text-sm font-medium text-slate-500">No student enrollments found.</span>
                                )}
                            </div>

                            {/* Kanban Board Container */}
                            <div className="flex gap-6 overflow-x-auto pb-6 min-h-[600px] items-start">
                                
                                {/* 1. UNASSIGNED POOL COLUMN */}
                                <div 
                                    onDragOver={(e) => handleDragOver(e, 'unassigned')}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, null)}
                                    className={`flex-none w-80 bg-slate-50 rounded-2xl border p-5 flex flex-col max-h-[750px] transition-all duration-200 ${
                                        dragOverColumn === 'unassigned' 
                                            ? 'border-emerald-500 bg-emerald-50/40 ring-4 ring-emerald-500/10' 
                                            : 'border-slate-200 shadow-xs'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200/60">
                                        <div>
                                            <h3 className="font-black text-slate-800 text-sm tracking-tight">Unassigned Pool</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Movable Learners</p>
                                        </div>
                                        <span className="bg-slate-200/80 text-slate-700 px-3 py-0.8 rounded-full text-xs font-black">
                                            {unassignedStudents.length}
                                        </span>
                                    </div>

                                    {/* Drop Area */}
                                    <div className="flex-1 overflow-y-auto space-y-3 min-h-[300px] max-h-[600px] pr-1.5">
                                        {unassignedStudents.map(e => (
                                            <div 
                                                key={e.id}
                                                draggable
                                                onDragStart={(evt) => handleDragStart(evt, e.id)}
                                                className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs hover:shadow-md hover:border-emerald-400 cursor-grab active:cursor-grabbing transition-all select-none group relative overflow-hidden"
                                            >
                                                {/* Left highlight strip */}
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300 group-hover:bg-emerald-500 transition-all"></div>
                                                
                                                <div className="flex items-center gap-3">
                                                    {/* Custom drag handle */}
                                                    <div className="text-slate-300 group-hover:text-emerald-500 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9h8M8 15h8" /></svg>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-slate-800 tracking-tight leading-tight">{e.learner.full_name}</span>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{e.level} Pool</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {unassignedStudents.length === 0 && (
                                            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">All students sectioned!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 2. SECTIONS COLUMNS */}
                                {levelSections.map(section => {
                                    const sectionEnrollments = levelEnrollments.filter(e => e.section_id === section.id);
                                    const isTargetOver = dragOverColumn === `section-${section.id}`;
                                    
                                    return (
                                        <div 
                                            key={section.id}
                                            onDragOver={(e) => handleDragOver(e, `section-${section.id}`)}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, section.id)}
                                            className={`flex-none w-80 bg-white rounded-2xl border p-5 flex flex-col max-h-[750px] transition-all duration-200 ${
                                                isTargetOver 
                                                    ? 'border-emerald-500 bg-emerald-50/20 ring-4 ring-emerald-500/10 scale-[1.01]' 
                                                    : 'border-slate-250 shadow-sm'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-4 pb-2 border-b border-slate-100">
                                                <div>
                                                    <h3 className="font-black text-slate-900 text-sm tracking-tight">{section.name}</h3>
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                                                            section.session === 'morning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                            section.session === 'afternoon' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        }`}>
                                                            {section.session}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]" title={section.teacher_name || 'TBA'}>
                                                            Adviser: {section.teacher_name || 'TBA'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-0.5 rounded-full text-xs font-black">
                                                    {sectionEnrollments.length}
                                                </span>
                                            </div>

                                            {/* Drop Area */}
                                            <div className="flex-1 overflow-y-auto space-y-3 min-h-[300px] max-h-[600px] bg-slate-50/50 p-2.5 rounded-xl border border-dashed border-slate-200/80 pr-1.5">
                                                {sectionEnrollments.map(e => (
                                                    <div 
                                                        key={e.id}
                                                        draggable
                                                        onDragStart={(evt) => handleDragStart(evt, e.id)}
                                                        className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs hover:shadow-md hover:border-emerald-450 cursor-grab active:cursor-grabbing transition-all select-none group relative overflow-hidden"
                                                    >
                                                        {/* Left highlight strip */}
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 group-hover:bg-emerald-600 transition-all"></div>
                                                        
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-slate-350 group-hover:text-emerald-500 transition-colors">
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9h8M8 15h8" /></svg>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-black text-slate-800 tracking-tight leading-tight">{e.learner.full_name}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {sectionEnrollments.length === 0 && (
                                                    <div className="text-center py-20 border-2 border-dashed border-slate-200/60 rounded-xl flex flex-col items-center justify-center">
                                                        <span className="text-2xl mb-1 text-slate-300">📥</span>
                                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Drag student here</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {levelSections.length === 0 && (
                                    <div className="flex-1 text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl max-w-xl mx-auto">
                                        <p className="text-sm font-bold text-slate-500">No sections created for {selectedLevel} yet.</p>
                                    </div>
                                )}

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
