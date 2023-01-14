<?php

namespace Pterodactyl\Console\Commands;

use Illuminate\Console\Command;
use Pterodactyl\Services\Helpers\SoftwareVersionService;
use Illuminate\Contracts\Config\Repository as ConfigRepository;

class InfoCommand extends Command
{
    protected $description = '显示应用程序、数据库和电子邮件配置以及面板版本。';

    protected $signature = 'p:info';

    /**
     * VersionCommand constructor.
     */
    public function __construct(private ConfigRepository $config, private SoftwareVersionService $versionService)
    {
        parent::__construct();
    }

    /**
     * Handle execution of command.
     */
    public function handle()
    {
        $this->output->title('版本信息');
        $this->table([], [
            ['面板版本', $this->config->get('app.version')],
            ['最新版本', $this->versionService->getPanel()],
            ['是否为最新版', $this->versionService->isLatestPanel() ? '是' : $this->formatText('否', 'bg=red')],
            ['服务作者', $this->config->get('pterodactyl.service.author')],
        ], 'compact');

        $this->output->title('应用配置');
        $this->table([], [
            ['环境', $this->formatText($this->config->get('app.env'), $this->config->get('app.env') === 'production' ?: 'bg=red')],
            ['是否处于调试模式', $this->formatText($this->config->get('app.debug') ? '是' : '否', !$this->config->get('app.debug') ?: 'bg=red')],
            ['安装 URL', $this->config->get('app.url')],
            ['安装路径', base_path()],
            ['时区', $this->config->get('app.timezone')],
            ['Cache 缓存驱动器', $this->config->get('cache.default')],
            ['Queue 队列驱动器', $this->config->get('queue.default')],
            ['Session 会话驱动器', $this->config->get('session.driver')],
            ['Filesystem 文件系统驱动器', $this->config->get('filesystems.default')],
            ['默认主题', $this->config->get('themes.active')],
            ['代理', $this->config->get('trustedproxies.proxies')],
        ], 'compact');

        $this->output->title('数据库配置');
        $driver = $this->config->get('database.default');
        $this->table([], [
            ['驱动器', $driver],
            ['主机', $this->config->get("database.connections.$driver.host")],
            ['端口', $this->config->get("database.connections.$driver.port")],
            ['数据库', $this->config->get("database.connections.$driver.database")],
            ['用户名', $this->config->get("database.connections.$driver.username")],
        ], 'compact');

        // TODO: Update this to handle other mail drivers
        $this->output->title('邮件发件配置');
        $this->table([], [
            ['驱动器', $this->config->get('mail.default')],
            ['主机', $this->config->get('mail.mailers.smtp.host')],
            ['端口', $this->config->get('mail.mailers.smtp.port')],
            ['用户名', $this->config->get('mail.mailers.smtp.username')],
            ['发件地址', $this->config->get('mail.from.address')],
            ['发件人', $this->config->get('mail.from.name')],
            ['加密方式', $this->config->get('mail.mailers.smtp.encryption')],
        ], 'compact');
    }

    /**
     * Format output in a Name: Value manner.
     */
    private function formatText(string $value, string $opts = ''): string
    {
        return sprintf('<%s>%s</>', $opts, $value);
    }
}
