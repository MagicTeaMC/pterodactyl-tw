<?php

namespace Pterodactyl\Console\Commands\Overrides;

use Illuminate\Foundation\Console\KeyGenerateCommand as BaseKeyGenerateCommand;

class KeyGenerateCommand extends BaseKeyGenerateCommand
{
    /**
     * Override the default Laravel key generation command to throw a warning to the user
     * if it appears that they have already generated an application encryption key.
     */
    public function handle()
    {
        if (!empty(config('app.key')) && $this->input->isInteractive()) {
            $this->output->warning('您似乎已经配置了应用程序加密密钥。继续此过程会覆盖该密钥并导致现有加密数据的数据全部损坏。所以不要继续，除非你知道你在做什么！');
            if (!$this->confirm('我了解执行此命令的后果，并对加密数据的丢失承担全部责任。')) {
                return;
            }

            if (!$this->confirm('您确定要继续吗？ 更改应用程序加密密钥将导致数据丢失。')) {
                return;
            }
        }

        parent::handle();
    }
}
