<?php

namespace Pterodactyl\Console\Commands\Environment;

use Illuminate\Console\Command;
use Illuminate\Contracts\Console\Kernel;
use Pterodactyl\Traits\Commands\EnvironmentWriterTrait;

class AppSettingsCommand extends Command
{
    use EnvironmentWriterTrait;

    public const CACHE_DRIVERS = [
        'redis' => 'Redis (推荐)',
        'memcached' => 'Memcached',
        'file' => 'Filesystem',
    ];

    public const SESSION_DRIVERS = [
        'redis' => 'Redis (推荐)',
        'memcached' => 'Memcached',
        'database' => 'MySQL 数据库',
        'file' => 'Filesystem',
        'cookie' => 'Cookie',
    ];

    public const QUEUE_DRIVERS = [
        'redis' => 'Redis (推荐)',
        'database' => 'MySQL 数据库',
        'sync' => 'Sync',
    ];

    protected $description = '进行面板的基本环境配置.';

    protected $signature = 'p:environment:setup
                            {--new-salt : 是否为 HashIDs 生成新 Salt,若生成新 Salt 当前用户所有密码验证都会失效，需要重设密码.}
                            {--author= : 在此实例上创建的服务应链接到的电子邮箱.}
                            {--url= : 运行此面板的 URL 例如 https://pterodactyl.cn}
                            {--timezone= : 用于面板时间的时区 北京时区为 Asia/Shanghai.}
                            {--cache= : 要使用的缓存驱动程序后端 不懂就用默认值.}
                            {--session= : 要使用的会话驱动程序后端 不懂就用默认值.}
                            {--queue= : 要使用的队列驱动程序后端 不懂就用默认值.}
                            {--redis-host= : 用于连接的 Redis 主机.}
                            {--redis-pass= : 用于连接 Redis 的密码.}
                            {--redis-port= : 连接到 Redis 的端口.}
                            {--settings-ui= : 启用或禁用设置 UI.}
                            {--telemetry= : 启用或禁用匿名遥测.}';

    protected array $variables = [];

    /**
     * AppSettingsCommand constructor.
     */
    public function __construct(private Kernel $console)
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
        if (empty(config('hashids.salt')) || $this->option('new-salt')) {
            $this->variables['HASHIDS_SALT'] = str_random(20);
        }

        $this->output->comment('提供预设导出中作者使用的电子邮箱地址.');
        $this->variables['APP_SERVICE_AUTHOR'] = $this->option('author') ?? $this->ask(
            '预设作者邮箱',
            config('pterodactyl.service.author', 'unknown@unknown.com')
        );

        if (!filter_var($this->variables['APP_SERVICE_AUTHOR'], FILTER_VALIDATE_EMAIL)) {
            $this->output->error('提供的邮箱地址无效.');

            return 1;
        }

        $this->output->comment('面板 URL 取决于是否使用 SSL 安全连接必须以 https:// 或 http:// 开头. 如果此处填写错误，您的电子邮箱和其他内容将被链接到错误的地址.');
        $this->variables['APP_URL'] = $this->option('url') ?? $this->ask(
            '应用 URL',
            config('app.url', 'https://example.com')
        );

        $this->output->comment('时区应与 PHP 支持的时区之一匹配 北京时区是 Asia/Shanghai。如果不确定，请参考 https://php.net/manual/zh/timezones.php.');
        $this->variables['APP_TIMEZONE'] = $this->option('timezone') ?? $this->anticipate(
            '应用程序时区',
            \DateTimeZone::listIdentifiers(),
            config('app.timezone')
        );

        $selected = config('cache.default', 'redis');
        $this->variables['CACHE_DRIVER'] = $this->option('cache') ?? $this->choice(
            'Cache 缓存驱动程序 不懂你就按回车',
            self::CACHE_DRIVERS,
            array_key_exists($selected, self::CACHE_DRIVERS) ? $selected : null
        );

        $selected = config('session.driver', 'redis');
        $this->variables['SESSION_DRIVER'] = $this->option('session') ?? $this->choice(
            'Session 会话驱动程序 不懂你就按回车',
            self::SESSION_DRIVERS,
            array_key_exists($selected, self::SESSION_DRIVERS) ? $selected : null
        );

        $selected = config('queue.default', 'redis');
        $this->variables['QUEUE_CONNECTION'] = $this->option('queue') ?? $this->choice(
            'Queue 队列驱动程序 不懂你就按回车',
            self::QUEUE_DRIVERS,
            array_key_exists($selected, self::QUEUE_DRIVERS) ? $selected : null
        );

        if (!is_null($this->option('settings-ui'))) {
            $this->variables['APP_ENVIRONMENT_ONLY'] = $this->option('settings-ui') == 'true' ? 'false' : 'true';
        } else {
            $this->variables['APP_ENVIRONMENT_ONLY'] = $this->confirm('启用基于 UI 的设置编辑器?', true) ? 'false' : 'true';
        }

        $this->output->comment('有关遥测数据和收集的更多详细信息，请参考 https://pterodactyl.top/panel/1.0/additional_configuration.html#telemetry。');
        $this->variables['PTERODACTYL_TELEMETRY_ENABLED'] = $this->option('telemetry') ?? $this->confirm(
            '允许发送匿名遥测数据？',
            config('pterodactyl.telemetry.enabled', true)
        ) ? 'true' : 'false';

        // Make sure session cookies are set as "secure" when using HTTPS
        if (str_starts_with($this->variables['APP_URL'], 'https://')) {
            $this->variables['SESSION_SECURE_COOKIE'] = 'true';
        }

        $this->checkForRedis();
        $this->writeToEnvironment($this->variables);

        $this->info($this->console->output());

        return 0;
    }

    /**
     * Check if redis is selected, if so, request connection details and verify them.
     */
    private function checkForRedis()
    {
        $items = collect($this->variables)->filter(function ($item) {
            return $item === 'redis';
        });

        // Redis was not selected, no need to continue.
        if (count($items) === 0) {
            return;
        }

        $this->output->note('您为一个或多个选项选择了 Redis 驱动程序，请在下面提供有效的连接信息。在大多数情况下，您可以使用提供的默认值，除非您修改了 Redis 主机设置.');
        $this->variables['REDIS_HOST'] = $this->option('redis-host') ?? $this->ask(
            'Redis 主机',
            config('database.redis.default.host')
        );

        $askForRedisPassword = true;
        if (!empty(config('database.redis.default.password'))) {
            $this->variables['REDIS_PASSWORD'] = config('database.redis.default.password');
            $askForRedisPassword = $this->confirm('似乎已经为 Redis 定义了密码，您要更改吗?');
        }

        if ($askForRedisPassword) {
            $this->output->comment('默认情况下，Redis 服务器连接无需密码，因为它在本地运行并且不允许外部访问。在这种情况下，阁下只需直接按回车键表示留空.');
            $this->variables['REDIS_PASSWORD'] = $this->option('redis-pass') ?? $this->output->askHidden(
                'Redis 密码'
            );
        }

        if (empty($this->variables['REDIS_PASSWORD'])) {
            $this->variables['REDIS_PASSWORD'] = 'null';
        }

        $this->variables['REDIS_PORT'] = $this->option('redis-port') ?? $this->ask(
            'Redis 端口',
            config('database.redis.default.port')
        );
    }
}
