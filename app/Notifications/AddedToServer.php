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
            ->subject('已被添加為子用戶')
            ->greeting('你好 ' . $this->server->user . '!')
            ->line('您已被添加為以下伺服器的子用戶，允許您對伺服器進行一定的控制。')
            ->line('伺服器名稱: ' . $this->server->name)
            ->action('點此瀏覽伺服器', url('/server/' . $this->server->uuidShort));
    }
}