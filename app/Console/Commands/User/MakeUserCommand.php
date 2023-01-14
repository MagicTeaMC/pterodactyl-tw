<?php

namespace Pterodactyl\Console\Commands\User;

use Illuminate\Console\Command;
use Pterodactyl\Services\Users\UserCreationService;

class MakeUserCommand extends Command
{
    protected $description = '通过 CLI 在系统上创建用户。';

    protected $signature = 'p:user:make {--email=} {--username=} {--name-first=} {--name-last=} {--password=} {--admin=} {--no-password}';

    /**
     * MakeUserCommand constructor.
     */
    public function __construct(private UserCreationService $creationService)
    {
        parent::__construct();
    }

    /**
     * Handle command request to create a new user.
     *
     * @throws \Exception
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     */
    public function handle()
    {
        $root_admin = $this->option('admin') ?? $this->confirm(trans('command/messages.user.ask_admin'));
        $email = $this->option('email') ?? $this->ask(trans('command/messages.user.ask_email'));
        $username = $this->option('username') ?? $this->ask(trans('command/messages.user.ask_username'));
        $name_first = $this->option('name-first') ?? $this->ask(trans('command/messages.user.ask_name_first'));
        $name_last = $this->option('name-last') ?? $this->ask(trans('command/messages.user.ask_name_last'));

        if (is_null($password = $this->option('password')) && !$this->option('no-password')) {
            $this->warn(trans('command/messages.user.ask_password_help'));
            $this->line(trans('command/messages.user.ask_password_tip'));
            $password = $this->secret(trans('command/messages.user.ask_password'));
        }

        $user = $this->creationService->handle(compact('email', 'username', 'name_first', 'name_last', 'password', 'root_admin'));
        $this->table(['Field', 'Value'], [
            ['UUID', $user->uuid],
            ['Email', $user->email],
            ['用户名', $user->username],
            ['姓名', $user->name],
            ['管理员', $user->root_admin ? '是' : '否'],
        ]);
    }
}
