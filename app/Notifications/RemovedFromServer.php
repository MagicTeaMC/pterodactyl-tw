<?php

namespace Pterodactyl\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class RemovedFromServer extends Notification implements ShouldQueue
{
    use Queueable;

    public object $server;

    /**
     * Create a new notification instance.
     */
    public function __construct(array $server)
    {
        $this->server = (object) $server;
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
        return (new MailMessage())
            ->error()
            ->subject('已被移除子用户')
            ->greeting('你好 ' . $this->server->user . '.')
            ->line('您已作为以下服务器的子用户被删除,并失去其控制权限。')
            ->line('服务器名称: ' . $this->server->name)
            ->action('点此浏览面板', route('index'));
    }
}
