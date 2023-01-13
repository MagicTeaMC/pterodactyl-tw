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
            ->subject('已創建帳號')
            ->greeting('你好 ' . $this->user->name . '!')
            ->line('您收到這封電子郵件是因為已經為您創建了一個帳戶於 ' . config('app.name') . '.')
            ->line('帳號名稱: ' . $this->user->username)
            ->line('帳號電子郵件: ' . $this->user->email);

        if (!is_null($this->token)) {
            return $message->action('点此设置您的帐户', url('/auth/password/reset/' . $this->token . '?email=' . urlencode($this->user->email)));
        }

        return $message;
    }
}
