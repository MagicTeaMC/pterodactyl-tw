<?php

return [
    'notices' => [
        'created' => '新的巢穴 :name 已成功建立。',
        'deleted' => '已成功從面板中刪除請求的巢穴。',
        'updated' => '已成功更新巢穴的配置選項。',
    ],
    'eggs' => [
        'notices' => [
            'imported' => '已成功導入此 Egg 及其相關變數。',
            'updated_via_import' => '此 Egg 已使用提供的文件更新。',
            'deleted' => '已成功從面板中刪除請求的 Egg。',
            'updated' => 'Egg 配置已成功更新。',
            'script_updated' => 'Egg 安裝腳本已更新，當伺服器安裝時將執行該腳本。',
            'egg_created' => '新的 Egg 已成功建立。你需要重新啟動任何正在運行的守護程式以應用此新的 Egg。',
        ],
    ],
    'variables' => [
        'notices' => [
            'variable_deleted' => '變數 ":variable" 已被刪除，並且在重新構建伺服器後將不再可用。',
            'variable_updated' => '變數 ":variable" 已更新。你需要重新構建任何使用此變數的伺服器才能應用變更。',
            'variable_created' => '新的變數已成功建立並分配給此 Egg。',
        ],
    ],
];
