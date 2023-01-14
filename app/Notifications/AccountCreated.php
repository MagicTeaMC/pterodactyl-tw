<?php

namespace Pterodactyl\Notifications;

use Pterodactyl\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class AccountCreated extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public User $user, public ?string $token = null)
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
    public function toMail(): MailMessage
    {
        $message = (new MailMessage())
            ->subject('已创建帐户')
            ->greeting('你好 ' . $this->user->name . '!')
            ->line('您收到这封电子邮件是因为已经为您创建了一个帐户于 ' . config('app.name') . '.')
            ->line('账户名称: ' . $this->user->username)
            ->line('账户电子邮箱: ' . $this->user->email);

        if (!is_null($this->token)) {
            return $message->action('点此设置您的帐户', url('/auth/password/reset/' . $this->token . '?email=' . urlencode($this->user->email)));
        }

        return $message;
    }
}
