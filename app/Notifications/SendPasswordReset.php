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

->subject('密碼重置')

->line('您收到這封電子郵件是因為我們收到了您帳戶的密碼重置請求。')

->action('點此重置密碼', url('/auth/password/reset/' . $this->token . '?email=' . urlencode($notifiable->email)))

->line('如果您沒有請求重置密碼，則無需採取進一步措施。');

}

}

