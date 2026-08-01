<?php

namespace App\Mail;

use App\Models\Receipt;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ParentReceiptMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Receipt $receipt,
        public $currentBalance
    ) {}

    public function envelope(): Envelope
    {
        $learnerName = $this->receipt->payment->enrollment->learner->full_name;
        return new Envelope(
            from: new \Illuminate\Mail\Mailables\Address('finance@mabdc.org', 'MABDC Finance Dept'),
            subject: 'Payment Receipt Confirmation - Receipt #' . $this->receipt->receipt_number . ' for ' . $learnerName,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.receipt',
            with: [
                'current_balance' => $this->currentBalance,
            ],
        );
    }

    public function attachments(): array
    {
        $pdf = Pdf::loadView('pdf.receipt', [
            'receipt' => $this->receipt,
            'current_balance' => $this->currentBalance,
        ]);

        $filename = 'Receipt_' . str_replace('/', '_', $this->receipt->receipt_number) . '.pdf';

        return [
            Attachment::fromData(fn () => $pdf->output(), $filename)
                ->withMime('application/pdf'),
        ];
    }
}
