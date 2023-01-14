@extends('layouts.admin')

@section('title')
    創建伺服器
@endsection

@section('content-header')
    <h1>創建伺服器<small>創建一個新的伺服器.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li><a href="{{ route('admin.servers') }}">伺服器</a></li>
        <li class="active">創建伺服器</li>
    </ol>
@endsection

@section('content')
<form action="{{ route('admin.servers.new') }}" method="POST">
    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">核心細節</h3>
                </div>

                <div class="box-body row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="pName">名稱</label>
                            <input type="text" class="form-control" id="pName" name="name" value="{{ old('name') }}" placeholder="伺服器名稱">
                            <p class="small text-muted no-margin">字元限制: <code>a-z A-Z 0-9 _ - .</code> 和 <code>[空格]</code>.</p>
                        </div>

                        <div class="form-group">
                            <label for="pUserId">所有者</label>
                            <select id="pUserId" name="owner_id" class="form-control" style="padding-left:0;"></select>
                            <p class="small text-muted no-margin">所有者帳戶的電子郵箱位址.</p>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="pDescription" class="control-label">伺服器描述</label>
                            <textarea id="pDescription" name="description" rows="3" class="form-control">{{ old('description') }}</textarea>
                            <p class="text-muted small">伺服器的簡單介紹.</p>
                        </div>

                        <div class="form-group">
                            <div class="checkbox checkbox-primary no-margin-bottom">
                                <input id="pStartOnCreation" name="start_on_completion" type="checkbox" {{ \Pterodactyl\Helpers\Utilities::checked('start_on_completion', 1) }} />
                                <label for="pStartOnCreation" class="strong">安裝完成後啟動</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="overlay" id="allocationLoader" style="display:none;"><i class="fa fa-refresh fa-spin"></i></div>
                <div class="box-header with-border">
                    <h3 class="box-title">分配管理</h3>
                </div>

                <div class="box-body row">
                    <div class="form-group col-sm-4">
                        <label for="pNodeId">節點</label>
                        <select name="node_id" id="pNodeId" class="form-control">
                            @foreach($locations as $location)
                                <optgroup label="{{ $location->long }} ({{ $location->short }})">
                                @foreach($location->nodes as $node)

                                <option value="{{ $node->id }}"
                                    @if($location->id === old('location_id')) selected @endif
                                >{{ $node->name }}</option>

                                @endforeach
                                </optgroup>
                            @endforeach
                        </select>

                        <p class="small text-muted no-margin">該伺服器將被部署到的節點。</p>
                    </div>

                    <div class="form-group col-sm-4">
                        <label for="pAllocation">預設網路分配</label>
                        <select id="pAllocation" name="allocation_id" class="form-control"></select>
                        <p class="small text-muted no-margin">此伺服器的預設網路分配.</p>
                    </div>

                    <div class="form-group col-sm-4">
                        <label for="pAllocationAdditional">額外網路分配</label>
                        <select id="pAllocationAdditional" name="allocation_additional[]" class="form-control" multiple></select>
                        <p class="small text-muted no-margin">此伺服器的額外網路分配.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="overlay" id="allocationLoader" style="display:none;"><i class="fa fa-refresh fa-spin"></i></div>
                <div class="box-header with-border">
                    <h3 class="box-title">應用功能限制</h3>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-6">
                        <label for="pDatabaseLimit" class="control-label">資料庫限制</label>
                        <div>
                            <input type="text" id="pDatabaseLimit" name="database_limit" class="form-control" value="{{ old('database_limit', 0) }}"/>
                        </div>
                        <p class="text-muted small">允許使用者為此伺服器創建的資料庫總數.</p>
                    </div>
                    <div class="form-group col-xs-6">
                        <label for="pAllocationLimit" class="control-label">網路分配限制</label>
                        <div>
                            <input type="text" id="pAllocationLimit" name="allocation_limit" class="form-control" value="{{ old('allocation_limit', 0) }}"/>
                        </div>
                        <p class="text-muted small">允許使用者為此伺服器創建的網路分配總數.</p>
                    </div>
                    <div class="form-group col-xs-6">
                        <label for="pBackupLimit" class="control-label">備份限制</label>
                        <div>
                            <input type="text" id="pBackupLimit" name="backup_limit" class="form-control" value="{{ old('backup_limit', 0) }}"/>
                        </div>
                        <p class="text-muted small">可以為此伺服器創建的備份總數.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">資源管理</h3>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-6">
                        <label for="pCPU">CPU 限制</label>

                        <div class="input-group">
                            <input type="text" id="pCPU" name="cpu" class="form-control" value="{{ old('cpu', 0) }}" />
                            <span class="input-group-addon">%</span>
                        </div>

                        <p class="text-muted small">如果您不想限制 CPU 使用率，請將值設置為 <code>0</code>. 要確定一個值，請將執行緒數乘以 100。例如，在沒有超執行緒的四核系統上 <code>(4 * 100 = 400)</code> 填寫 <code>400</code> . 要將伺服器限制為使用單一執行緒的一半，您可以將值設置為 <code>50</code>. 要允許伺服器最多使用兩個執行緒，請將值設置為 <code>200</code>.<p>
                    </div>

                    <div class="form-group col-xs-6">
                        <label for="pThreads">CPU 核心</label>

                        <div>
                            <input type="text" id="pThreads" name="threads" class="form-control" value="{{ old('threads') }}" />
                        </div>

                        <p class="text-muted small"><strong>A高級:</strong> 輸入此進程可以運行的特定 CPU 執行緒，或留空以允許所有執行緒。這可以是單個數位，也可以是逗號分隔的列表. 例如: <code>0</code>, <code>0-1,3</code>, 或 <code>0,1,3,4</code>.</p>
                    </div>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-6">
                        <label for="pMemory">記憶體</label>

                        <div class="input-group">
                            <input type="text" id="pMemory" name="memory" class="form-control" value="{{ old('memory') }}" />
                            <span class="input-group-addon">MiB</span>
                        </div>

                        <p class="text-muted small">此容器允許的最大記憶體量。將此設置為 <code>0</code> 將允許此伺服器無限制使用記憶體.</p>
                    </div>

                    <div class="form-group col-xs-6">
                        <label for="pSwap">交換記憶體</label>

                        <div class="input-group">
                            <input type="text" id="pSwap" name="swap" class="form-control" value="{{ old('swap', 0) }}" />
                            <span class="input-group-addon">MiB</span>
                        </div>

                        <p class="text-muted small">將此設置為 <code>0</code> 將禁用此伺服器上的交換記憶體. 將此設置為 <code>-1</code> 將允許此伺服器使用無限交換記憶體.</p>
                    </div>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-6">
                        <label for="pDisk">存儲空間</label>

                        <div class="input-group">
                            <input type="text" id="pDisk" name="disk" class="form-control" value="{{ old('disk') }}" />
                            <span class="input-group-addon">MiB</span>
                        </div>

                        <p class="text-muted small">如果此伺服器使用的空間超過此數量，則將不允許它啟動。如果伺服器在運行時超過此限制，它將安全停止並鎖定，直到有足夠的可用空間。調成 <code>0</code> 將允許此伺服器使用無限存儲空間.</p>
                    </div>

                    <div class="form-group col-xs-6">
                        <label for="pIO">IO 優先順序</label>

                        <div>
                            <input type="text" id="pIO" name="io" class="form-control" value="{{ old('io', 500) }}" />
                        </div>

                        <p class="text-muted small"><strong>高級</strong>: 此伺服器相對於其他 <em>運行中</em> 伺服器的 IO 性能 . 此值應介於 <code>10</code> 至 <code>1000</code>. 請查閱 <a href="https://docs.docker.com/engine/reference/run/#block-io-bandwidth-blkio-constraint" target="_blank">此文檔</a> 瞭解更多.</p>
                    </div>
                    <div class="form-group col-xs-12">
                        <div class="checkbox checkbox-primary no-margin-bottom">
                            <input type="checkbox" id="pOomDisabled" name="oom_disabled" value="0" {{ \Pterodactyl\Helpers\Utilities::checked('oom_disabled', 0) }} />
                            <label for="pOomDisabled" class="strong">啟用 OOM Killer</label>
                        </div>

                        <p class="small text-muted no-margin">如果伺服器超出記憶體限制，則終止伺服器。啟用 OOM Killer 可能會導致伺服器進程意外退出.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-6">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">預設組設置</h3>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-12">
                        <label for="pNestId">預設組</label>

                        <select id="pNestId" name="nest_id" class="form-control">
                            @foreach($nests as $nest)
                                <option value="{{ $nest->id }}"
                                    @if($nest->id === old('nest_id'))
                                        selected="selected"
                                    @endif
                                >{{ $nest->name }}</option>
                            @endforeach
                        </select>

                        <p class="small text-muted no-margin">選擇此伺服器將歸入的預設組.</p>
                    </div>

                    <div class="form-group col-xs-12">
                        <label for="pEggId">預設</label>
                        <select id="pEggId" name="egg_id" class="form-control"></select>
                        <p class="small text-muted no-margin">選擇將定義此伺服器如何正確運行的預設.</p>
                    </div>
                    <div class="form-group col-xs-12">
                        <div class="checkbox checkbox-primary no-margin-bottom">
                            <input type="checkbox" id="pSkipScripting" name="skip_scripts" value="1" {{ \Pterodactyl\Helpers\Utilities::checked('skip_scripts', 0) }} />
                            <label for="pSkipScripting" class="strong">跳過預設安裝腳本</label>
                        </div>

                        <p class="small text-muted no-margin">如果選定的預設附加了安裝腳本，則該程式將在安裝期間運行。如果您想跳過此步驟，請選中此框.</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Docker 設置</h3>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-12">
                        <label for="pDefaultContainer">Docker 鏡像</label>
                        <select id="pDefaultContainer" name="image" class="form-control"></select>
                        <input id="pDefaultContainerCustom" name="custom_image" value="{{ old('custom_image') }}" class="form-control" placeholder="或輸入自訂鏡像..." style="margin-top:1rem"/>
                        <p class="small text-muted no-margin">這是將用於運行此伺服器的默認 Docker 映射。從上面的下拉清單中選擇一個鏡像，或在上面的文本欄位中輸入一個自訂鏡像.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">啟動設置</h3>
                </div>

                <div class="box-body row">
                    <div class="form-group col-xs-12">
                        <label for="pStartup">啟動指令</label>
                        <input type="text" id="pStartup" name="startup" value="{{ old('startup') }}" class="form-control" />
                        <p class="small text-muted no-margin">以下變數可用於啟動命令: <code>@{{SERVER_MEMORY}}</code>, <code>@{{SERVER_IP}}</code>, 和 <code>@{{SERVER_PORT}}</code>. 它們將分別替換為分配的記憶體、伺服器 IP 和伺服器埠的值.</p>
                    </div>
                </div>

                <div class="box-header with-border" style="margin-top:-10px;">
                    <h3 class="box-title">變數</h3>
                </div>

                <div class="box-body row" id="appendVariablesTo"></div>

                <div class="box-footer">
                    {!! csrf_field() !!}
                    <input type="submit" class="btn btn-success pull-right" value="創建伺服器" />
                </div>
            </div>
        </div>
    </div>
</form>
@endsection

@section('footer-scripts')
    @parent
    {!! Theme::js('vendor/lodash/lodash.js') !!}

    <script type="application/javascript">
        // Persist 'Service Variables'
        function serviceVariablesUpdated(eggId, ids) {
            @if (old('egg_id'))
                // Check if the egg id matches.
                if (eggId != '{{ old('egg_id') }}') {
                    return;
                }

                @if (old('environment'))
                    @foreach (old('environment') as $key => $value)
                        $('#' + ids['{{ $key }}']).val('{{ $value }}');
                    @endforeach
                @endif
            @endif
            @if(old('image'))
                $('#pDefaultContainer').val('{{ old('image') }}');
            @endif
        }
        // END Persist 'Service Variables'
    </script>

    {!! Theme::js('js/admin/new-server.js?v=20220530') !!}

    <script type="application/javascript">
        $(document).ready(function() {
            // Persist 'Server Owner' select2
            @if (old('owner_id'))
                $.ajax({
                    url: '/admin/users/accounts.json?user_id={{ old('owner_id') }}',
                    dataType: 'json',
                }).then(function (data) {
                    initUserIdSelect([ data ]);
                });
            @else
                initUserIdSelect();
            @endif
            // END Persist 'Server Owner' select2

            // Persist 'Node' select2
            @if (old('node_id'))
                $('#pNodeId').val('{{ old('node_id') }}').change();

                // Persist 'Default Allocation' select2
                @if (old('allocation_id'))
                    $('#pAllocation').val('{{ old('allocation_id') }}').change();
                @endif
                // END Persist 'Default Allocation' select2

                // Persist 'Additional Allocations' select2
                @if (old('allocation_additional'))
                    const additional_allocations = [];

                    @for ($i = 0; $i < count(old('allocation_additional')); $i++)
                        additional_allocations.push('{{ old('allocation_additional.'.$i)}}');
                    @endfor

                    $('#pAllocationAdditional').val(additional_allocations).change();
                @endif
                // END Persist 'Additional Allocations' select2
            @endif
            // END Persist 'Node' select2

            // Persist 'Nest' select2
            @if (old('nest_id'))
                $('#pNestId').val('{{ old('nest_id') }}').change();

                // Persist 'Egg' select2
                @if (old('egg_id'))
                    $('#pEggId').val('{{ old('egg_id') }}').change();
                @endif
                // END Persist 'Egg' select2
            @endif
            // END Persist 'Nest' select2
        });
    </script>
@endsection

