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
            ->subject('翼龙面板邮件测试信息')
            ->greeting('你好 ' . $this->user->name . '!')
            ->line('这里是翼龙面板邮件系统，如果你收到这份邮件，说明邮件系统可以正常运行了!');
    }
}
