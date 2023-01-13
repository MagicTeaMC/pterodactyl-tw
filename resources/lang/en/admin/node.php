<?php
/**
 * Pterodactyl - Panel
 * Copyright (c) 2015 - 2022 ValiantShishu <vlssu@vlssu.com>.
 *
 * This software is licensed under the terms of the MIT license.
 * https://opensource.org/licenses/MIT
 */

return [
    'validation' => [
        'fqdn_not_resolvable' => '提供的域名或IP無法解析。',
        'fqdn_required_for_ssl' => '需要解析為外網IP的網域才能為此節點使用SSL。',
    ],
    'notices' => [
        'allocations_added' => '端口已成功添加到此節點。',
        'node_deleted' => '節點已成功從面板中刪除。',
        'location_required' => '您必須至少配置一個地域，然後才能將節點添加到此面板。',
        'node_created' => '成功創建新節點。 您可以通過訪問“配置”選項卡自動配置此機器上的守護程序。<strong>您必須先分配至少一個IP 地址和端口，然後才能新增伺服器。</strong>',
        'node_updated' => '節點訊息已更新。 如果更改了任何守護程序的設置，您將成功創建新節點。 您可以通過訪問“配置”選項卡自動配置此機器上的守護程序需要重新啟動它以使這些更改生效。',
        'unallocated_deleted' => '删除了 <code>:ip</code> 的所有未分配端口。',
    ],
];
