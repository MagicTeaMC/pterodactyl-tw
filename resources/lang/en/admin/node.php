<?php

return [
    'validation' => [
        'fqdn_not_resolvable' => '提供的 FQDN 或 IP 位址無法解析為有效的 IP 位址。',
        'fqdn_required_for_ssl' => '要在此節點上使用 SSL，必須提供解析為公共 IP 位址的完整網域名稱（FQDN）。',
    ],
    'notices' => [
        'allocations_added' => '已成功將分配項新增至此節點。',
        'node_deleted' => '節點已成功從面板中移除。',
        'location_required' => '在將節點新增到此面板之前，你必須至少設定一個位置。',
        'node_created' => '已成功建立新節點。你可以前往「配置」選項卡自動配置此機器上的守護程式。<strong>在新增任何伺服器之前，你必須先分配至少一個 IP 位址和埠。</strong>',
        'node_updated' => '節點資訊已更新。如果更改了任何守護程式設定，你需要重新啟動它才能使變更生效。',
        'unallocated_deleted' => '已刪除 <code>:ip</code> 的所有未分配埠。',
    ],
];
