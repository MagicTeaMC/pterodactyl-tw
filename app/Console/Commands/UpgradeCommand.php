<?php

namespace Pterodactyl\Console\Commands;

use Illuminate\Console\Command;
use Pterodactyl\Console\Kernel;
use Symfony\Component\Process\Process;
use Symfony\Component\Console\Helper\ProgressBar;

class UpgradeCommand extends Command
{
    protected const DEFAULT_URL = 'https://github.com/pterodactyl-china/panel/releases/%s/panel.tar.gz';

    protected $signature = 'p:upgrade
        {--user= : 运行 PHP 的用户。所有文件将归此用户所有。}
        {--group= : 运行 PHP 所在的组。所有文件都归该组所有。}
        {--url= : 要下载的特定存档。}
        {--release= : 要从 GitHub 下载的特定翼龙版本。 留空则下载最新的。}
        {--skip-download : 如果设置，则不会下载存档。}';

    protected $description = '从 GitHub 下载翼龙中国的新存档，然后执行正常的升级命令。';

    /**
     * Executes an upgrade command which will run through all of our standard
     * commands for Pterodactyl and enable users to basically just download
     * the archive and execute this and be done.
     *
     * This places the application in maintenance mode as well while the commands
     * are being executed.
     *
     * @throws \Exception
     */
    public function handle()
    {
        $skipDownload = $this->option('skip-download');
        if (!$skipDownload) {
            $this->output->warning('该命令不会验证下载资源的完整性。请确保您信任此下载源。如果您不希望下载存档，请使用 --skip-download 参数指明，或对以下问题回答 "no"。');
            $this->output->comment('下载源(使用 --url= 参数进行设置):');
            $this->line($this->getUrl());
        }

        if (version_compare(PHP_VERSION, '7.4.0') < 0) {
            $this->error('无法执行自动升级。所需的最低 PHP 版本是 7.4.0，而你所用的是 [' . PHP_VERSION . '].');
        }

        $user = 'www-data';
        $group = 'www-data';
        if ($this->input->isInteractive()) {
            if (!$skipDownload) {
                $skipDownload = !$this->confirm('您想下载并解压最新版本的存档文件吗？', true);
            }

            if (is_null($this->option('user'))) {
                $userDetails = posix_getpwuid(fileowner('public'));
                $user = $userDetails['name'] ?? 'www-data';

                if (!$this->confirm("您的 WEB 服务器用户已被检测为 <fg=blue>[{$user}]:</> 是否正确?", true)) {
                    $user = $this->anticipate(
                        '请输入运行您的 WEB 服务器进程的用户名。这因系统而异，但通常是 "www-data"、"nginx" 或 "apache"。',
                        [
                            'www-data',
                            'nginx',
                            'apache',
                        ]
                    );
                }
            }

            if (is_null($this->option('group'))) {
                $groupDetails = posix_getgrgid(filegroup('public'));
                $group = $groupDetails['name'] ?? 'www-data';

                if (!$this->confirm("您的 WEB 服务器组已被检测为 <fg=blue>[{$group}]:</> 是否正确？", true)) {
                    $group = $this->anticipate(
                        '请输入运行您的 WEB 服务器进程组名。通常这与 WEB 服务器进程用户相同。',
                        [
                            'www-data',
                            'nginx',
                            'apache',
                        ]
                    );
                }
            }

            if (!$this->confirm('您确定要为您的面板运行升级操作吗？')) {
                $this->warn('用户终止了升级操作。');

                return;
            }
        }

        ini_set('output_buffering', '0');
        $bar = $this->output->createProgressBar($skipDownload ? 9 : 10);
        $bar->start();

        if (!$skipDownload) {
            $this->withProgress($bar, function () {
                $this->line("\$upgrader> curl -L \"{$this->getUrl()}\" | tar -xzv");
                $process = Process::fromShellCommandline("curl -L \"{$this->getUrl()}\" | tar -xzv");
                $process->run(function ($type, $buffer) {
                    $this->{$type === Process::ERR ? 'error' : 'line'}($buffer);
                });
            });
        }

        $this->withProgress($bar, function () {
            $this->line('$upgrader> php artisan down');
            $this->call('down');
        });

        $this->withProgress($bar, function () {
            $this->line('$upgrader> chmod -R 755 storage bootstrap/cache');
            $process = new Process(['chmod', '-R', '755', 'storage', 'bootstrap/cache']);
            $process->run(function ($type, $buffer) {
                $this->{$type === Process::ERR ? 'error' : 'line'}($buffer);
            });
        });

        $this->withProgress($bar, function () {
            $command = ['composer', 'install', '--no-ansi'];
            if (config('app.env') === 'production' && !config('app.debug')) {
                $command[] = '--optimize-autoloader';
                $command[] = '--no-dev';
            }

            $this->line('$upgrader> ' . implode(' ', $command));
            $process = new Process($command);
            $process->setTimeout(10 * 60);
            $process->run(function ($type, $buffer) {
                $this->line($buffer);
            });
        });

        /** @var \Illuminate\Foundation\Application $app */
        $app = require __DIR__ . '/../../../bootstrap/app.php';
        /** @var \Pterodactyl\Console\Kernel $kernel */
        $kernel = $app->make(Kernel::class);
        $kernel->bootstrap();
        $this->setLaravel($app);

        $this->withProgress($bar, function () {
            $this->line('$upgrader> php artisan view:clear');
            $this->call('view:clear');
        });

        $this->withProgress($bar, function () {
            $this->line('$upgrader> php artisan config:clear');
            $this->call('config:clear');
        });

        $this->withProgress($bar, function () {
            $this->line('$upgrader> php artisan migrate --force --seed');
            $this->call('migrate', ['--force' => true, '--seed' => true]);
        });

        $this->withProgress($bar, function () use ($user, $group) {
            $this->line("\$upgrader> chown -R {$user}:{$group} *");
            $process = Process::fromShellCommandline("chown -R {$user}:{$group} *", $this->getLaravel()->basePath());
            $process->setTimeout(10 * 60);
            $process->run(function ($type, $buffer) {
                $this->{$type === Process::ERR ? 'error' : 'line'}($buffer);
            });
        });

        $this->withProgress($bar, function () {
            $this->line('$upgrader> php artisan queue:restart');
            $this->call('queue:restart');
        });

        $this->withProgress($bar, function () {
            $this->line('$upgrader> php artisan up');
            $this->call('up');
        });

        $this->newLine(2);
        $this->info('面板已成功升级。请确保您还更新了所有 Wings 的实例：https://pterodactyl.top/wings/1.0/upgrading.html');
    }

    protected function withProgress(ProgressBar $bar, \Closure $callback)
    {
        $bar->clear();
        $callback();
        $bar->advance();
        $bar->display();
    }

    protected function getUrl(): string
    {
        if ($this->option('url')) {
            return $this->option('url');
        }

        return sprintf(self::DEFAULT_URL, $this->option('release') ? 'download/v' . $this->option('release') : 'latest/download');
    }
}
