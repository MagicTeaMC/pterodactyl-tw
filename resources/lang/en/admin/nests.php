<?php
/**
 * Pterodactyl CHINA - Panel
 * Copyright (c) 2018 - 2022 ValiantShishu <vlssu@vlssu.com>.
 *
 * This software is licensed under the terms of the MIT license.
 * https://opensource.org/licenses/MIT
 */

return [
    'notices' => [
        'created' => '已成功創建一个新的 :name 預設组。',
        'deleted' => '已成功回覆面板請求，删除該預設组。',
        'updated' => '已成功更新預設組配置選項。',
    ],
    'eggs' => [
        'notices' => [
            'imported' => '已成功導入此預設及其相關變量。',
            'updated_via_import' => '此預設已使用提供的文件進行了更新。',
            'deleted' => '已成功響應面板請求，刪除該預設。',
            'updated' => '預設配置已成功更新。',
            'script_updated' => '預設的安裝腳本已更新，並將在安裝伺服器時運行。',
            'egg_created' => '一個新的預設設置成功。 如果你要應用此新預設，記得將需要應用的服務器重新啟動哦，包括運行中或未運行的。',
        ],
    ],
    'variables' => [
        'notices' => [
            'variable_deleted' => '變數 ":variable" 已被刪除，一旦重建將不再為伺服器所用。',
            'variable_updated' => '變數 ":variable" 已更新。 您需要重建使用此變量的服務器才能應用更改。',
            'variable_created' => '已成功創建新變數並將其分配給此預設。',
        ],
    ],
];
