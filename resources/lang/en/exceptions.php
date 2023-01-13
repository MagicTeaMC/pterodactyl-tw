<?php

/**
 * Pterodactyl CHINA - Panel
 * Copyright (c) 2018 - 2022 ValiantShishu <vlssu@vlssu.com>.
 *
 * This software is licensed under the terms of the MIT license.
 * https://opensource.org/licenses/MIT
 */

return [
    'daemon_connection_failed' => '嘗試與守護程式通信時出現異常，導致 HTTP/:code 回應代碼。已記錄此異常。',
    'node' => [
        'servers_attached' => '一個節點必須沒有關聯任何伺服器時才能被刪除。',
        'daemon_off_config_updated' => '守護程式配置<strong>已更新</strong>，但是在嘗試自動更新守護程式上的設定檔時遇到錯誤。您需要手動更新設定檔 (config.yml) 以使守護程式應用這些更改。',
    ],
    'allocations' => [
        'server_using' => '當前一台伺服器已分配給此分配。僅當前未分配任何伺服器時，才能刪除分配。',
        'too_many_ports' => '不支持一次在單個範圍內添加超過 1000 個埠。',
        'invalid_mapping' => '為 :port 提供的映射無效並且無法處理。',
        'cidr_out_of_range' => 'CIDR 標記法只允許 /25 於 /32 之間的遮罩。',
        'port_out_of_range' => '分配中的埠必須大於 1024 且小於或等於 65535。',
    ],
    'nest' => [
        'delete_has_servers' => '無法從面板中刪除關聯了伺服器的預設組。',
        'egg' => [
            'delete_has_servers' => '無法從面板中刪除關聯了伺服器的預設。',
            'invalid_copy_id' => '選擇用於複製腳本的預設不存在，或正在複製腳本本身。',
            'must_be_child' => '此預設的 "複製設置自" 指令必須是選定預設組的子選項。',
            'has_children' => '此預設是一個或多個其他預設的父級。請在刪除此預設之前刪除這些預設。',
        ],
        'variables' => [
            'env_not_unique' => '環境變數 :name 對於此預設必須是獨一無二的。',
            'reserved_name' => '環境變數 :name 是受保護的，不能給分配變數。',
            'bad_validation_rule' => '驗證規則 ":rule" 不是此應用程式的有效規則。',
        ],
        'importer' => [
            'json_error' => '嘗試解析 JSON 檔時出錯：:error。',
            'file_error' => '提供的 JSON 檔無效。',
            'invalid_json_provided' => '提供的 JSON 檔是不可識別的格式。',
        ],
    ],
    'subusers' => [
        'editing_self' => '不允許您修改自己的子使用者帳戶。',
        'user_is_owner' => '您不能將伺服器所有者添加為此伺服器的子用戶。',
        'subuser_exists' => '具有該電子郵箱位址的使用者已被指定為該伺服器的子用戶。',
    ],
    'databases' => [
        'delete_has_databases' => '無法刪除關聯了資料庫的資料庫主機伺服器。',
    ],
    'tasks' => [
        'chain_interval_too_long' => '鏈式任務的最大間隔時間是 15 分鐘。',
    ],
    'locations' => [
        'has_nodes' => '無法刪除關聯了節點的地域。',
    ],
    'users' => [
        'node_revocation_failed' => '無法撤銷 <a href=":link">節點 #:node</a> 上的金鑰。:error',
    ],
    'deployment' => [
        'no_viable_nodes' => '找不到滿足自動部署要求的節點。',
        'no_viable_allocations' => '未找到滿足自動部署要求的分配。',
    ],
    'api' => [
        'resource_not_found' => '請求的資源在此伺服器上不存在。',
    ],
];

