<?php

namespace Pterodactyl\Console\Commands\Environment;

use Illuminate\Console\Command;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Database\DatabaseManager;
use Pterodactyl\Traits\Commands\EnvironmentWriterTrait;

class DatabaseSettingsCommand extends Command
{
    use EnvironmentWriterTrait;

    protected $description = '为面板配置数据库设置.';

    protected $signature = 'p:environment:database
                            {--host= : MySQL服务器的连接地址.}
                            {--port= : MySQL服务器的连接端口.}
                            {--database= : 要使用的数据库.}
                            {--username= : 连接数据库时使用的用户名.}
                            {--password= : 用于连接此数据库的密码.}';

    protected array $variables = [];

    /**
     * DatabaseSettingsCommand constructor.
     */
    public function __construct(private DatabaseManager $database, private Kernel $console)
    {
        parent::__construct();
    }

    /**
     * Handle command execution.
     *
     * @throws \Pterodactyl\Exceptions\PterodactylException
     */
    public function handle(): int
    {
        $this->output->note('强烈建议不要使用"localhost"作为您的数据库主机，因为我们已经看到频繁的套接字连接问题。如果你想使用本地连接，你应该使用“127.0.0.1”.');
        $this->variables['DB_HOST'] = $this->option('host') ?? $this->ask(
            '数据库地址',
            config('database.connections.mysql.host', '127.0.0.1')
        );

        $this->variables['DB_PORT'] = $this->option('port') ?? $this->ask(
            '数据库端口',
            config('database.connections.mysql.port', 3306)
        );

        $this->variables['DB_DATABASE'] = $this->option('database') ?? $this->ask(
            '数据库名称',
            config('database.connections.mysql.database', 'panel')
        );

        $this->output->note('使用“root”帐户进行 MySQL 连接不仅非常不被推荐，而且此应用程序也不允许这样做。您需要专门为此软件创建一个有权限的 MySQL 用户.');
        $this->variables['DB_USERNAME'] = $this->option('username') ?? $this->ask(
            '数据库用户名',
            config('database.connections.mysql.username', 'pterodactyl')
        );

        $askForMySQLPassword = true;
        if (!empty(config('database.connections.mysql.password')) && $this->input->isInteractive()) {
            $this->variables['DB_PASSWORD'] = config('database.connections.mysql.password');
            $askForMySQLPassword = $this->confirm('您似乎已经定义了 MySQL 连接密码，您想更改它吗?');
        }

        if ($askForMySQLPassword) {
            $this->variables['DB_PASSWORD'] = $this->option('password') ?? $this->secret('数据库密码');
        }

        try {
            $this->testMySQLConnection();
        } catch (\PDOException $exception) {
            $this->output->error(sprintf('无法使用提供的凭证连接到 MySQL 服务器。返回的错误是 "%s".', $exception->getMessage()));
            $this->output->error('您的连接凭证尚未保存。在继续之前，您需要提供有效的连接信息.');

            if ($this->confirm('回去再试一次?')) {
                $this->database->disconnect('_pterodactyl_command_test');

                return $this->handle();
            }

            return 1;
        }

        $this->writeToEnvironment($this->variables);

        $this->info($this->console->output());

        return 0;
    }

    /**
     * Test that we can connect to the provided MySQL instance and perform a selection.
     */
    private function testMySQLConnection()
    {
        config()->set('database.connections._pterodactyl_command_test', [
            'driver' => 'mysql',
            'host' => $this->variables['DB_HOST'],
            'port' => $this->variables['DB_PORT'],
            'database' => $this->variables['DB_DATABASE'],
            'username' => $this->variables['DB_USERNAME'],
            'password' => $this->variables['DB_PASSWORD'],
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'strict' => true,
        ]);

        $this->database->connection('_pterodactyl_command_test')->getPdo();
    }
}
