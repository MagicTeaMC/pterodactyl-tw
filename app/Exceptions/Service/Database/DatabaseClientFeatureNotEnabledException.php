<?php

namespace Pterodactyl\Exceptions\Service\Database;

use Pterodactyl\Exceptions\PterodactylException;

class DatabaseClientFeatureNotEnabledException extends PterodactylException
{
    public function __construct()
    {
        parent::__construct('此面板未启用在客户端创建数据库。');
    }
}
