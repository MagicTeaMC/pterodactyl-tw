<?php

return [
    'daemon_connection_failed' => '在嘗試與Daemon通信時發生異常，導致 HTTP/:code 響應代碼。此異常已被記錄。',
    'node' => [
        'servers_attached' => '要刪除節點，必須先取消連接到它的所有伺服器。',
        'daemon_off_config_updated' => '守護程序配置 <strong>已更新</strong>，但在嘗試自動更新Daemon上的配置文件（config.yml）時遇到錯誤。您需要手動更新守護程序的配置文件以應用這些更改。',
    ],
    'allocations' => [
        'server_using' => '當前有伺服器分配到此分配上。只有在沒有伺服器分配時，才能刪除分配。',
        'too_many_ports' => '一次添加超過 1000 個端口範圍不受支持。',
        'invalid_mapping' => '提供給 :port 的映射無效且無法處理。',
        'cidr_out_of_range' => 'CIDR 表示法僅允許掩碼介於 /25 和 /32 之間。',
        'port_out_of_range' => '分配中的端口必須大於 1024 並且小於或等於 65535。',
    ],
    'nest' => [
        'delete_has_servers' => '無法從控制面板中刪除已連接到活動伺服器的nest。',
        'egg' => [
            'delete_has_servers' => '無法從控制面板中刪除已連接到活動伺服器的蛋。',
            'invalid_copy_id' => '用於複製腳本的所選蛋不存在，或者正在複製腳本自身。',
            'must_be_child' => '此蛋的 "從中複製設置" 指令必須是所選nest的子選項。',
            'has_children' => '此蛋是一個或多個其他egg的父egg。請在刪除此蛋之前刪除那些egg。',
        ],
        'variables' => [
            'env_not_unique' => '環境變數 :name 必須在此egg中唯一。',
            'reserved_name' => '環境變數 :name 受保護，不能分配給變數。',
            'bad_validation_rule' => '":rule" 驗證規則對於此應用程序無效。',
        ],
        'importer' => [
            'json_error' => '在嘗試解析 JSON 文件時發生錯誤：:error。',
            'file_error' => '提供的 JSON 文件無效。',
            'invalid_json_provided' => '提供的 JSON 文件不符合可識別的格式。',
        ],
    ],
    'subusers' => [
        'editing_self' => '不允許編輯自己的子用戶帳戶。',
        'user_is_owner' => '您無法將伺服器所有者添加為此伺服器的子用戶。',
        'subuser_exists' => '已經將該電子郵件地址的用戶指定為此伺服器的子用戶。',
    ],
    'databases' => [
        'delete_has_databases' => '無法刪除已連接到活動數據庫的數據庫主機伺服器。',
    ],
    'tasks' => [
        'chain_interval_too_long' => '連鎖任務的最大間隔時間為 15 分鐘。',
    ],
    'locations' => [
        'has_nodes' => '無法刪除已連接到活動節點的位置。',
    ],
    'users' => [
        'node_revocation_failed' => '無法在 <a href=":link">節點 #:node</a> 上撤銷金鑰。 :error',
    ],
    'deployment' => [
        'no_viable_nodes' => '找不到滿足自動部署指定要求的節點。',
        'no_viable_allocations' => '找不到滿足自動部署要求的分配。',
    ],
    'api' => [
        'resource_not_found' => '在此伺服器上找不到請求的資源。',
    ],
];
