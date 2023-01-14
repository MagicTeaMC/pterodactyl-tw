<?php

namespace Pterodactyl\Console\Commands\User;

use Pterodactyl\Models\User;
use Webmozart\Assert\Assert;
use Illuminate\Console\Command;
use Pterodactyl\Services\Users\UserDeletionService;

class DeleteUserCommand extends Command
{
    protected $description = '如果没有服务器附加到他们的帐户，从面板中该删除用户。';

    protected $signature = 'p:user:delete {--user=}';

    /**
     * DeleteUserCommand constructor.
     */
    public function __construct(private UserDeletionService $deletionService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $search = $this->option('user') ?? $this->ask(trans('command/messages.user.search_users'));
        Assert::notEmpty($search, '搜索词应为电子邮件地址，得到：%s。');

        $results = User::query()
            ->where('id', 'LIKE', "$search%")
            ->orWhere('username', 'LIKE', "$search%")
            ->orWhere('email', 'LIKE', "$search%")
            ->get();

        if (count($results) < 1) {
            $this->error(trans('command/messages.user.no_users_found'));
            if ($this->input->isInteractive()) {
                return $this->handle();
            }

            return 1;
        }

        if ($this->input->isInteractive()) {
            $tableValues = [];
            foreach ($results as $user) {
                $tableValues[] = [$user->id, $user->email, $user->name];
            }

            $this->table(['User ID', 'Email', 'Name'], $tableValues);
            if (!$deleteUser = $this->ask(trans('command/messages.user.select_search_user'))) {
                return $this->handle();
            }
        } else {
            if (count($results) > 1) {
                $this->error(trans('command/messages.user.multiple_found'));

                return 1;
            }

            $deleteUser = $results->first();
        }

        if ($this->confirm(trans('command/messages.user.confirm_delete')) || !$this->input->isInteractive()) {
            $this->deletionService->handle($deleteUser);
            $this->info(trans('command/messages.user.deleted'));
        }

        return 0;
    }
}
