<?php

namespace Pterodactyl\Notifications;

use Pterodactyl\Models\User;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class MailTested extends Notification
{
    public function __construct(private User $user)
    {
    }

    public function via(): array
    {
        return ['mail'];
    }

    public function toMail(): MailMessage
    {
        return (new MailMessage())
            ->subject('pterodactyl面板測試訊息')
            ->greeting('你好 ' . $this->user->name . '!')
            ->line('這裡是pterodactyl面板郵件系統，如果你收到這份郵件，說明郵件系統可以正常運行了!');
    }
}