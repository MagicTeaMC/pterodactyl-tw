<?php

namespace Pterodactyl\Console\Commands\User;

use Illuminate\Console\Command;
use Pterodactyl\Contracts\Repository\UserRepositoryInterface;

class DisableTwoFactorCommand extends Command
{
    protected $description = '在面板中为特定用户禁用动态口令认证。';

    protected $signature = 'p:user:disable2fa {--email= : 要为其禁用动态口令认证的用户邮箱。}';

    /**
     * DisableTwoFactorCommand constructor.
     */
    public function __construct(private UserRepositoryInterface $repository)
    {
        parent::__construct();
    }

    /**
     * Handle command execution process.
     *
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     * @throws \Pterodactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function handle()
    {
        if ($this->input->isInteractive()) {
            $this->output->warning(trans('command/messages.user.2fa_help_text'));
        }

        $email = $this->option('email') ?? $this->ask(trans('command/messages.user.ask_email'));
        $user = $this->repository->setColumns(['id', 'email'])->findFirstWhere([['email', '=', $email]]);

        $this->repository->withoutFreshModel()->update($user->id, [
            'use_totp' => false,
            'totp_secret' => null,
        ]);
        $this->info(trans('command/messages.user.2fa_disabled', ['email' => $user->email]));
    }
}
