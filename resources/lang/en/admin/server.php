<?php

return [
    'exceptions' => [
        'no_new_default_allocation' => '您正試圖刪除此伺服器的預設分配，但沒有可用的備用分配。',
        'marked_as_failed' => '此伺服器被標記為先前安裝失敗。無法在此狀態下切換目前狀態。',
        'bad_variable' => ':name 變數驗證錯誤。',
        'daemon_exception' => '在嘗試與守護程序通信時發生異常，導致 HTTP/:code 響應代碼。此異常已被記錄。 （請求 ID：:request_id）',
        'default_allocation_not_found' => '未在此伺服器的分配中找到請求的預設分配。',
    ],
    'alerts' => [
        'startup_changed' => '此伺服器的啟動配置已更新。如果更改了此伺服器的nest或egg，將立即進行重新安裝。',
        'server_deleted' => '伺服器已成功從系統中刪除。',
        'server_created' => '伺服器已成功在控制面板上創建。請允許程序幾分鐘時間完全安裝此伺服器。',
        'build_updated' => '此伺服器的構建詳細訊息已更新。某些更改可能需要重新啟動才能生效。',
        'suspension_toggled' => '伺服器暫停狀態已更改為 :status。',
        'rebuild_on_boot' => '此伺服器已標記為需要 Docker 容器重建。這將在下次啟動伺服器時發生。',
        'install_toggled' => '此伺服器的安裝狀態已切換。',
        'server_reinstalled' => '此伺服器已匡列進行重新安裝，準備開始。',
        'details_updated' => '伺服器詳細訊息已成功更新。',
        'docker_image_updated' => '已成功更改此伺服器使用的默認 Docker 映像。需要重新啟動以應用此更改。',
        'node_required' => '在添加伺服器到此控制面板之前，您必須配置至少一個節點。',
        'transfer_nodes_required' => '在轉移伺服器之前，您必須配置至少兩個節點。',
        'transfer_started' => '已啟動伺服器轉移。',
        'transfer_not_viable' => '您選擇的節點沒有足夠的磁碟空間或可用內存來容納此伺服器。',
    ],
];

