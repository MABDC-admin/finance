<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\Learner;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use App\Mail\ParentStatementMail;
use App\Mail\ParentReceiptMail;
use App\Models\AuditEvent;
use App\Models\Receipt;
use App\Models\InstallmentPlan;
use App\Mail\ParentInstallmentPlanMail;

class LearnerAccountController extends Controller
{
    /**
     * List all learner accounts with their financial summary.
     */
    public function index(Request $request)
    {
        $search       = $request->query('search');
        $statusFilter = $request->query('status');
        $levelFilter  = $request->query('level');

        $enrollments = Enrollment::with(['learner', 'academicYear'])
            ->when($search, function ($query, $search) {
                $query->whereHas('learner', function ($q) use ($search) {
                    $q->where('full_name', 'ilike', "%{$search}%")
                      ->orWhere('lrn',       'ilike', "%{$search}%");
                });
            })
            ->when($statusFilter, fn ($q, $s) => $q->where('financial_status', $s))
            ->when($levelFilter, fn ($q, $l) => $q->where('level', $l))
            ->paginate(13)
            ->withQueryString()
            ->through(function ($enrollment) {
                $balance = $enrollment->financeLedgers()->sum('amount');
                $statementSent = AuditEvent::query()
                    ->where('event_type', 'email_statement_sent')
                    ->where('subject_type', Enrollment::class)
                    ->where('subject_id', $enrollment->id)
                    ->exists();

                return [
                    'id'             => $enrollment->id,
                    'learner_name'   => optional($enrollment->learner)->full_name,
                    'lrn'            => optional($enrollment->learner)->lrn,
                    'mother_email'   => optional($enrollment->learner)->mother_email,
                    'father_email'   => optional($enrollment->learner)->father_email,
                    'receipt_email'  => optional($enrollment->learner)->receipt_email,
                    'grade_level'    => $enrollment->level,
                    'academic_year'  => optional($enrollment->academicYear)->name,
                    'balance'        => $balance,
                    'status'         => $enrollment->financial_status,
                    'statement_sent' => $statementSent,
                ];
            });

        $levels = Enrollment::query()
            ->distinct()
            ->whereNotNull('level')
            ->pluck('level')
            ->filter()
            ->values()
            ->sortBy(fn ($level) => $this->levelSortKey($level))
            ->values()
            ->toArray();

        return Inertia::render('LearnerAccounts/Index', [
            'enrollments' => $enrollments,
            'levels'      => $levels,
            'filters'     => $request->only(['search', 'status', 'level']),
        ]);
    }

    /**
     * Show the full statement of account for a single enrollment.
     * Delegates to the Finance Show view (same data shape).
     */
    public function show(Enrollment $enrollment)
    {
        $enrollment->load([
            'learner',
            'academicYear',
            'financeLedgers' => function ($query) {
                $query->orderBy('transaction_date', 'desc')->orderBy('created_at', 'desc');
            },
            'installmentPlans',
            'receipts',
        ]);

        $balance        = $enrollment->financeLedgers()->sum('amount');
        $totalFees      = $enrollment->financeLedgers()->whereIn('type', ['charge', 'tax'])->sum('amount');
        $totalPayments  = $enrollment->financeLedgers()->where('type', 'payment')->sum('amount');
        $totalDiscounts = $enrollment->financeLedgers()->where('type', 'discount')->sum('amount');

        $statusLabel = match (true) {
            $totalFees == 0         => 'No Assessment',
            $balance   <= 0         => 'Cleared',
            $totalPayments < 0      => 'Partially Paid',
            default                 => 'Unpaid',
        };

        $receiptIds = $enrollment->receipts->pluck('id');
        $emailedReceiptIds = AuditEvent::query()
            ->where('event_type', 'receipt_email_sent')
            ->where('subject_type', Receipt::class)
            ->whereIn('subject_id', $receiptIds)
            ->pluck('subject_id')
            ->toArray();

        $statementSent = AuditEvent::query()
            ->where('event_type', 'email_statement_sent')
            ->where('subject_type', Enrollment::class)
            ->where('subject_id', $enrollment->id)
            ->exists();

        $latestPlan = $enrollment->installmentPlans->last();
        $installmentEmailed = false;
        if ($latestPlan) {
            $installmentEmailed = AuditEvent::query()
                ->where('event_type', 'installment_plan_email_sent')
                ->where('subject_type', InstallmentPlan::class)
                ->where('subject_id', $latestPlan->id)
                ->exists();
        }

        $pendingPastBalance = Enrollment::where('learner_id', $enrollment->learner_id)
            ->where('id', '!=', $enrollment->id)
            ->get()
            ->sum(function ($past) {
                return $past->financeLedgers()->sum('amount');
            });

        return Inertia::render('LearnerAccounts/Show', [
            'enrollment' => array_merge($enrollment->toArray(), [
                'learner_name'    => optional($enrollment->learner)->full_name,
                'lrn'             => optional($enrollment->learner)->lrn,
                'academic_year'   => optional($enrollment->academicYear)->name,
                'grade_level'     => $enrollment->level,
                'balance'         => $balance,
                'total_fees'      => $totalFees,
                'total_payments'  => abs($totalPayments),
                'total_discounts' => abs($totalDiscounts),
                'financial_status'=> $statusLabel,
                'ledgers'         => $enrollment->financeLedgers,
                'installment_plans'=> $enrollment->installmentPlans,
                'receipts'        => $enrollment->receipts,
                'receipt_email'   => optional($enrollment->learner)->receipt_email,
            ]),
            'emailedReceiptIds' => $emailedReceiptIds,
            'statementSent' => $statementSent,
            'installmentEmailed' => $installmentEmailed,
            'pendingPastBalance' => $pendingPastBalance,
        ]);
    }

    /* ── Ledger actions (reuse Finance logic via delegation) ── */

    public function storePayment(Request $request, Enrollment $enrollment)
    {
        return app(FinanceController::class)->storePayment($request, $enrollment);
    }

    public function storeDiscount(Request $request, Enrollment $enrollment)
    {
        return app(FinanceController::class)->storeDiscount($request, $enrollment);
    }

    public function storeCharge(Request $request, Enrollment $enrollment)
    {
        return app(FinanceController::class)->storeCharge($request, $enrollment);
    }

    public function storeRefund(Request $request, Enrollment $enrollment)
    {
        return app(FinanceController::class)->storeRefund($request, $enrollment);
    }

    public function storeInstallmentPlan(Request $request, Enrollment $enrollment)
    {
        return app(FinanceController::class)->storeInstallmentPlan($request, $enrollment);
    }

    public function assessTuition(Enrollment $enrollment)
    {
        // 1. Find GradeLevelFee for this level
        $gradeLevelFee = \App\Models\GradeLevelFee::where('grade_level', $enrollment->level)->first();

        // 2. Find mandatory active FeeStructures
        $fees = \App\Models\FeeStructure::where('is_active', true)
            ->where(function($q) use ($enrollment) {
                $q->whereNull('level')->orWhere('level', $enrollment->level);
            })
            ->where('is_optional', false)
            ->get();

        if (!$gradeLevelFee && $fees->isEmpty()) {
            return redirect()->back()->withErrors(['message' => 'No active mandatory fee structures or tuition fees defined for this grade level.']);
        }

        // 3. Prevent duplicate assessment if they already have charges
        $hasCharges = $enrollment->financeLedgers()->whereIn('type', ['charge', 'tax'])->exists();
        if ($hasCharges) {
            return redirect()->back()->withErrors(['message' => 'This student has already been assessed for this academic year.']);
        }

        \DB::transaction(function () use ($enrollment, $gradeLevelFee, $fees) {
            
            // --- CARRY FORWARD LOGIC ---
            $pastEnrollments = Enrollment::where('learner_id', $enrollment->learner_id)
                ->where('id', '!=', $enrollment->id)
                ->get();

            $totalArrears = 0;
            $totalCredits = 0;
            foreach ($pastEnrollments as $past) {
                $pastBalance = $past->financeLedgers()->sum('amount');
                if ($pastBalance > 0) {
                    $totalArrears += $pastBalance;
                    $past->financeLedgers()->create([
                        'type' => 'payment',
                        'description' => 'Balance transferred to new Academic Year',
                        'amount' => -$pastBalance,
                        'transaction_date' => now(),
                    ]);
                    $past->update(['financial_status' => 'Cleared']);
                } elseif ($pastBalance < 0) {
                    $absCredit = abs($pastBalance);
                    $totalCredits += $absCredit;
                    $past->financeLedgers()->create([
                        'type' => 'charge',
                        'description' => 'Credit balance transferred to new Academic Year',
                        'amount' => $absCredit,
                        'transaction_date' => now(),
                    ]);
                    $past->update(['financial_status' => 'Cleared']);
                }
            }

            if ($totalArrears > 0) {
                $enrollment->financeLedgers()->create([
                    'type' => 'charge',
                    'description' => 'Previous Year Arrears Forwarded',
                    'amount' => $totalArrears,
                    'transaction_date' => now(),
                ]);
            }

            if ($totalCredits > 0) {
                $enrollment->financeLedgers()->create([
                    'type' => 'discount',
                    'description' => 'Previous Year Credit Balance Forwarded',
                    'amount' => -$totalCredits,
                    'transaction_date' => now(),
                ]);
            }
            // ---------------------------

            // Assess base tuition
            if ($gradeLevelFee) {
                $enrollment->financeLedgers()->create([
                    'type' => 'charge',
                    'description' => 'Tuition Fee',
                    'amount' => $gradeLevelFee->base_tuition,
                    'transaction_date' => now(),
                ]);

                $taxAmount = $gradeLevelFee->base_tuition * 0.05;
                $enrollment->financeLedgers()->create([
                    'type' => 'tax',
                    'description' => 'UAE VAT (5%) on Tuition Fee',
                    'amount' => $taxAmount,
                    'transaction_date' => now(),
                ]);
            }

            // Assess other mandatory fees
            foreach ($fees as $fee) {
                $enrollment->financeLedgers()->create([
                    'type' => 'charge',
                    'description' => $fee->name,
                    'amount' => $fee->amount,
                    'transaction_date' => now(),
                ]);

                $taxAmount = $fee->amount * 0.05;
                $enrollment->financeLedgers()->create([
                    'type' => 'tax',
                    'description' => 'UAE VAT (5%) on ' . $fee->name,
                    'amount' => $taxAmount,
                    'transaction_date' => now(),
                ]);
            }

            $enrollment->update(['financial_status' => 'Unpaid']);
        });

        return redirect()->back()->with('success', 'Student fees assessed successfully.');
    }

    public function updateLedger(Request $request, Enrollment $enrollment, \App\Models\FinanceLedger $ledger)
    {
        if ($ledger->enrollment_id !== $enrollment->id) {
            abort(403, 'Unauthorized ledger entry.');
        }

        $request->validate([
            'transaction_date' => 'required|date',
            'description'      => 'required|string|max:255',
            'amount'           => 'required|numeric',
        ]);

        // Keep the sign correct depending on original ledger type:
        $amount = floatval($request->amount);
        $isNegativeType = in_array($ledger->type, ['payment', 'discount', 'refund']);
        if ($isNegativeType && $amount > 0) {
            $amount = -$amount;
        } elseif (!$isNegativeType && $amount < 0) {
            $amount = -$amount;
        }

        $ledger->update([
            'transaction_date' => $request->transaction_date,
            'description'      => $request->description,
            'amount'           => $amount,
        ]);

        app(FinanceController::class)->updateFinancialStatus($enrollment);

        return redirect()->back()->with('success', 'Ledger entry updated successfully.');
    }

    public function destroyLedger(Enrollment $enrollment, \App\Models\FinanceLedger $ledger)
    {
        if ($ledger->enrollment_id !== $enrollment->id) {
            abort(403, 'Unauthorized ledger entry.');
        }

        $ledger->delete();

        app(FinanceController::class)->updateFinancialStatus($enrollment);

        return redirect()->back()->with('success', 'Ledger entry deleted successfully.');
    }

    /**
     * Finance staff can set a dedicated receipt/statement email on the learner.
     */
    public function updateReceiptEmail(Request $request, Enrollment $enrollment)
    {
        $validated = $request->validate([
            'receipt_email' => 'nullable|email|max:255',
        ]);

        $enrollment->learner->update([
            'receipt_email' => $validated['receipt_email'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Receipt email address updated successfully.');
    }

    public function emailStatement(Request $request, Enrollment $enrollment)
    {
        $learner = $enrollment->learner;

        // Prefer the finance-assigned receipt_email; fall back to parent emails
        $emails = $learner->receipt_email
            ? [$learner->receipt_email]
            : collect([$learner->mother_email, $learner->father_email])->filter()->unique()->all();

        if (empty($emails)) {
            return redirect()->back()->withErrors([
                'email' => 'No email address configured for this student. Please add a receipt email or parent contact details.'
            ]);
        }

        // Calculate totals for statement
        $balance        = $enrollment->financeLedgers()->sum('amount');
        $totalFees      = $enrollment->financeLedgers()->whereIn('type', ['charge', 'tax'])->sum('amount');
        $totalPayments  = $enrollment->financeLedgers()->where('type', 'payment')->sum('amount');
        $totalDiscounts = $enrollment->financeLedgers()->where('type', 'discount')->sum('amount');

        // Send Email
        Mail::to($emails)->send(new ParentStatementMail(
            $enrollment,
            $totalFees,
            $totalPayments,
            $totalDiscounts,
            $balance
        ));

        // Log Audit Event
        AuditEvent::query()->create([
            'actor_id' => $request->user()?->id,
            'event_type' => 'email_statement_sent',
            'subject_type' => Enrollment::class,
            'subject_id' => $enrollment->id,
            'before' => null,
            'after' => null,
            'metadata' => [
                'learner_name' => $learner->full_name,
                'sent_to' => implode(', ', $emails),
                'message' => 'Statement of Account emailed to parent(s): ' . implode(', ', $emails),
            ],
        ]);

        return redirect()->back()->with('success', 'Statement of Account emailed successfully to: ' . implode(', ', $emails));
    }

    public function emailReceipt(Request $request, Receipt $receipt)
    {
        $receipt->load(['payment.enrollment.learner', 'payment.enrollment.academicYear']);
        $enrollment = $receipt->payment->enrollment;
        $learner = $enrollment->learner;

        // Prefer the finance-assigned receipt_email; fall back to parent emails
        $emails = $learner->receipt_email
            ? [$learner->receipt_email]
            : collect([$learner->mother_email, $learner->father_email])->filter()->unique()->all();

        if (empty($emails)) {
            return redirect()->back()->withErrors([
                'email' => 'No email address configured for this student. Please add a receipt email or parent contact details.'
            ]);
        }

        // Calculate the current balance (from student ledgers)
        $balance = $enrollment->financeLedgers()->sum('amount');

        // Send Email
        Mail::to($emails)->send(new ParentReceiptMail($receipt, $balance));

        // Log Audit Event
        AuditEvent::query()->create([
            'actor_id' => $request->user()?->id,
            'event_type' => 'receipt_email_sent',
            'subject_type' => Receipt::class,
            'subject_id' => $receipt->id,
            'before' => null,
            'after' => null,
            'metadata' => [
                'receipt_number' => $receipt->receipt_number,
                'learner_name' => $learner->full_name,
                'sent_to' => implode(', ', $emails),
                'message' => 'Payment receipt #' . $receipt->receipt_number . ' emailed to parent(s): ' . implode(', ', $emails),
            ],
        ]);

        return redirect()->back()->with('success', 'Receipt emailed successfully to: ' . implode(', ', $emails));
    }

    public function showInstallmentPlan(InstallmentPlan $plan)
    {
        $plan->load([
            'enrollment.learner',
            'enrollment.academicYear',
            'enrollment.section'
        ]);

        $totalFees = $plan->enrollment->financeLedgers()->whereIn('type', ['charge', 'tax'])->sum('amount');

        return Inertia::render('Finance/InstallmentPlan', [
            'plan' => array_merge($plan->toArray(), [
                'learner_name' => $plan->enrollment->learner->full_name,
                'lrn'          => $plan->enrollment->learner->lrn,
                'grade_level'  => $plan->enrollment->level,
                'section'      => $plan->enrollment->section?->name,
                'academic_year'=> $plan->enrollment->academicYear->name,
                'enrollment_id'=> $plan->enrollment_id,
            ]),
            'totalAmount' => $totalFees,
        ]);
    }

    public function emailInstallmentPlan(Request $request, InstallmentPlan $plan)
    {
        $plan->load(['enrollment.learner', 'enrollment.academicYear']);
        $learner = $plan->enrollment->learner;

        // Prefer the finance-assigned receipt_email; fall back to parent emails
        $emails = [];
        if ($learner->receipt_email) {
            $emails[] = $learner->receipt_email;
        } elseif ($learner->mother_email) {
            $emails[] = $learner->mother_email;
        } elseif ($learner->father_email) {
            $emails[] = $learner->father_email;
        }

        if (empty($emails)) {
            return redirect()->back()->with('error', 'No email address configured for this learner or parents.');
        }

        $totalFees = $plan->enrollment->financeLedgers()->whereIn('type', ['charge', 'tax'])->sum('amount');

        // Send Email
        Mail::to($emails)->send(new ParentInstallmentPlanMail($plan, $totalFees));

        // Log Audit Event
        AuditEvent::query()->create([
            'actor_id' => $request->user()?->id,
            'event_type' => 'installment_plan_email_sent',
            'subject_type' => InstallmentPlan::class,
            'subject_id' => $plan->id,
            'before' => null,
            'after' => null,
            'metadata' => [
                'learner_name' => $learner->full_name,
                'sent_to' => implode(', ', $emails),
                'message' => 'Installment Plan Agreement emailed to parent(s): ' . implode(', ', $emails),
            ],
        ]);

        return redirect()->back()->with('success', 'Installment plan emailed successfully to: ' . implode(', ', $emails));
    }

    private function levelSortKey(?string $level): string
    {
        $normalized = strtoupper(trim((string) $level));
        $compact = preg_replace('/[^A-Z0-9]+/', '', $normalized) ?? '';

        if (preg_match('/^(?:L|LEVEL)0*([0-9]+)/', $compact, $matches) === 1) {
            return sprintf('001-%02d-%s', (int) $matches[1], $compact);
        }

        if (preg_match('/^(?:G|GR|GRP|GROUP|GRADE)0*([0-9]+)/', $compact, $matches) === 1) {
            return sprintf('002-%02d-%s', (int) $matches[1], $compact);
        }

        if (preg_match('/^0*([0-9]+)/', $compact, $matches) === 1) {
            return sprintf('003-%02d-%s', (int) $matches[1], $compact);
        }

        return '999-'.$compact;
    }
}
