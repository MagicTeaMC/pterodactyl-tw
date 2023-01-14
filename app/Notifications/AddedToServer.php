<?php

namespace Pterodactyl\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class AddedToServer extends Notification implements ShouldQueue
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
            ->subject('已被添加为子用户')
            ->greeting('你好 ' . $this->server->user . '!')
            ->line('您已被添加为以下服务器的子用户，允许您对服务器进行一定的控制。')
            ->line('服务器名称: ' . $this->server->name)
            ->action('点此浏览服务器', url('/server/' . $this->server->uuidShort));
    }
}
