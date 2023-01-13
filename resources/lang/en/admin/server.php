<?php
/**
 * Pterodactyl CHINA - Panel
 * Copyright (c) 2018 - 2022 ValiantShishu <vlssu@vlssu.com>.
 *
 * This software is licensed under the terms of the MIT license.
 * https://opensource.org/licenses/MIT
 */

return [
    'exceptions' => [
        'no_new_default_allocation' => '您正在試圖刪除此伺服器的默認埠，但沒有可供使用的備用埠。',
        'marked_as_failed' => '由於該伺服器之前被標記為安裝失敗。 在此狀態下無法切換當前狀態。',
        'bad_variable' => ':name 變數驗證錯誤。',
        'daemon_exception' => '嘗試與守護程式通信時出現異常，導致 HTTP/:code 回應碼。 已記錄此異常。(請求 id: :request_id)',
        'default_allocation_not_found' => '在此伺服器的分配中找不到所請求的默認分配。',
    ],
    'alerts' => [
        'startup_changed' => '該伺服器的啟動配置已經更新。如果此伺服器的預設組或預設被更改，現在將進行重新安裝。',
        'server_deleted' => '伺服器已成功從系統中刪除。',
        'server_created' => '伺服器已在面板上成功創建。請允許守護進程用幾分鐘的時間來完成安裝此伺服器。',
        'build_updated' => '此伺服器的構建配置已更新。某些更改可能需要重新開機才能生效。',
        'suspension_toggled' => '伺服器已從凍結狀態更改為 :status。',
        'rebuild_on_boot' => '該伺服器已標記為需要 Docker 容器重建。這將在下次啟動伺服器時執行該操作。',
        'install_toggled' => '該伺服器的安裝狀態已被切換。',
        'server_reinstalled' => '此伺服器已進入等候佇列，馬上重新安裝。',
        'details_updated' => '伺服器詳細資訊已成功更新。',
        'docker_image_updated' => '已成功更改用於此伺服器的默認 Docker 鏡像。需要重新開機才能應用此更改。',
        'node_required' => '您必須至少配置一個節點，然後才能將伺服器添加到此面板。',
        'transfer_nodes_required' => '您必須至少配置兩個節點，然後才能轉移伺服器。',
        'transfer_started' => '伺服器轉移已開始。',
        'transfer_not_viable' => '您選擇的節點沒有足夠的存儲空間或記憶體來容納此伺服器。',
    ],
];
