<?php

namespace Pterodactyl\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class SendPasswordReset extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public string $token)
    {
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(mixed $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('密码重置')
            ->line('您收到这封电子邮件是因为我们收到了您帐户的密码重置请求。')
            ->action('点此重置密码', url('/auth/password/reset/' . $this->token . '?email=' . urlencode($notifiable->email)))
            ->line('如果您没有请求重置密码，则无需采取进一步措施。');
    }
}
