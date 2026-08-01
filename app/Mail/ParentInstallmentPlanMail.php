<?php

namespace App\Mail;

use App\Models\InstallmentPlan;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ParentInstallmentPlanMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public InstallmentPlan $installmentPlan,
        public $totalAmount
    ) {}

    public function envelope(): Envelope
    {
        $learnerName = $this->installmentPlan->enrollment->learner->full_name;
        return new Envelope(
            from: new \Illuminate\Mail\Mailables\Address('finance@mabdc.org', 'MABDC Finance Dept'),
            subject: 'Approved Installment Payment Plan - ' . $learnerName,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.installment_plan',
        );
    }

    public function attachments(): array
    {
        $pdf = Pdf::loadView('pdf.installment_plan', [
            'plan' => $this->installmentPlan,
            'totalAmount' => $this->totalAmount,
        ]);

        $filename = 'Installment_Plan_' . $this->installmentPlan->id . '.pdf';

        return [
            Attachment::fromData(fn () => $pdf->output(), $filename)
                ->withMime('application/pdf'),
        ];
    }
}
