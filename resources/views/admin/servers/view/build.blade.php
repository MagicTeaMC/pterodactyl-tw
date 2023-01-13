@extends('layouts.admin')

@section('title')
    伺服器 — {{ $server->name }}: 構建配置
@endsection

@section('content-header')
    <h1>{{ $server->name }}<small>控制此伺服器的分配和系統資源。</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li><a href="{{ route('admin.servers') }}">伺服器</a></li>
        <li><a href="{{ route('admin.servers.view', $server->id) }}">{{ $server->name }}</a></li>
        <li class="active">構建配置</li>
    </ol>
@endsection

@section('content')
@include('admin.servers.partials.navigation')
<div class="row">
    <form action="{{ route('admin.servers.view.build', $server->id) }}" method="POST">
        <div class="col-sm-5">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">資源管理</h3>
                </div>
                <div class="box-body">
                <div class="form-group">
                        <label for="cpu" class="control-label">CPU 限制</label>
                        <div class="input-group">
                            <input type="text" name="cpu" class="form-control" value="{{ old('cpu', $server->cpu) }}"/>
                            <span class="input-group-addon">%</span>
                        </div>
                        <p class="text-muted small">每 <em>虛擬</em> 內核 (執行緒) 於此系統都將視為 <code>100%</code>. 將此值設置為 <code>0</code> 將允許此伺服器無限制使用CPU虛擬執行緒.</p>
                    </div>
                    <div class="form-group">
                        <label for="threads" class="control-label">CPU 核心</label>
                        <div>
                            <input type="text" name="threads" class="form-control" value="{{ old('threads', $server->threads) }}"/>
                        </div>
                        <p class="text-muted small"><strong>高級:</strong> 輸入此進程可以在其上運行的特定 CPU 內核，或留空以允許所有內核。這可以是單個數位，也可以是逗號分隔的列表. 例如: <code>0</code>, <code>0-1,3</code>, 或者 <code>0,1,3,4</code>.</p>
                    </div>
                    <div class="form-group">
                        <label for="memory" class="control-label">分配記憶體</label>
                        <div class="input-group">
                            <input type="text" name="memory" data-multiplicator="true" class="form-control" value="{{ old('memory', $server->memory) }}"/>
                            <span class="input-group-addon">MiB</span>
                        </div>
                        <p class="text-muted small">此伺服器允許的最大記憶體使用量。將此設置為 <code>0</code> 將不限制此伺服器記憶體使用。</p>
                    </div>
                    <div class="form-group">
                        <label for="swap" class="control-label">分配交換記憶體</label>
                        <div class="input-group">
                            <input type="text" name="swap" data-multiplicator="true" class="form-control" value="{{ old('swap', $server->swap) }}"/>
                            <span class="input-group-addon">MiB</span>
                        </div>
                        <p class="text-muted small">將此設置為 <code>0</code> 將禁用此伺服器的交換記憶體. 將此設置為 <code>-1</code> 將允許此伺服器使用無限制交換記憶體.</p>
                    </div>
                    <div class="form-group">
                        <label for="cpu" class="control-label">存儲空間限制</label>
                        <div class="input-group">
                            <input type="text" name="disk" class="form-control" value="{{ old('disk', $server->disk) }}"/>
                            <span class="input-group-addon">MiB</span>
                        </div>
                        <p class="text-muted small">如果此伺服器使用的空間超過此數量，則將不允許它啟動。如果伺服器在運行時超過此限制，它將安全停止並鎖定，直到有足夠的可用空間。調成 <code>0</code> 允許此伺服器無限制使用存儲空間.</p>
                    </div>
                    <div class="form-group">
                        <label for="io" class="control-label">IO 優先順序</label>
                        <div>
                            <input type="text" name="io" class="form-control" value="{{ old('io', $server->io) }}"/>
                        </div>
                        <p class="text-muted small"><strong>高級</strong>: 此伺服器相對於其他 <em>運行中</em> 伺服器的 IO 性能 . 此值應介於 <code>10</code> 至 <code>1000</code>.</p>
                    </div>
                    <div class="form-group">
                        <label for="cpu" class="control-label">OOM Killer</label>
                        <div>
                            <div class="radio radio-danger radio-inline">
                                <input type="radio" id="pOomKillerEnabled" value="0" name="oom_disabled" @if(!$server->oom_disabled)checked @endif>
                                <label for="pOomKillerEnabled">啟用</label>
                            </div>
                            <div class="radio radio-success radio-inline">
                                <input type="radio" id="pOomKillerDisabled" value="1" name="oom_disabled" @if($server->oom_disabled)checked @endif>
                                <label for="pOomKillerDisabled">禁用</label>
                            </div>
                            <p class="text-muted small">
                                啟用 OOM killer 可能會導致伺服器程式異常.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-sm-7">
            <div class="row">
                <div class="col-xs-12">
                    <div class="box">
                        <div class="box-header with-border">
                            <h3 class="box-title">應用程式功能限制</h3>
                        </div>
                        <div class="box-body">
                            <div class="row">
                                <div class="form-group col-xs-6">
                                    <label for="database_limit" class="control-label">資料庫限制</label>
                                    <div>
                                        <input type="text" name="database_limit" class="form-control" value="{{ old('database_limit', $server->database_limit) }}"/>
                                    </div>
                                    <p class="text-muted small">允許使用者為此伺服器創建的資料庫總數.</p>
                                </div>
                                <div class="form-group col-xs-6">
                                    <label for="allocation_limit" class="control-label">網路分配限制</label>
                                    <div>
                                        <input type="text" name="allocation_limit" class="form-control" value="{{ old('allocation_limit', $server->allocation_limit) }}"/>
                                    </div>
                                    <p class="text-muted small">允許使用者為此伺服器創建的網路分配總數。</p>
                                </div>
                                <div class="form-group col-xs-6">
                                    <label for="backup_limit" class="control-label">備份限制</label>
                                    <div>
                                        <input type="text" name="backup_limit" class="form-control" value="{{ old('backup_limit', $server->backup_limit) }}"/>
                                    </div>
                                    <p class="text-muted small">可以為此伺服器創建的備份總數。</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xs-12">
                    <div class="box">
                        <div class="box-header with-border">
                            <h3 class="box-title">網路分配</h3>
                        </div>
                        <div class="box-body">
                            <div class="form-group">
                                <label for="pAllocation" class="control-label">埠</label>
                                <select id="pAllocation" name="allocation_id" class="form-control">
                                    @foreach ($assigned as $assignment)
                                        <option value="{{ $assignment->id }}"
                                            @if($assignment->id === $server->allocation_id)
                                                selected="selected"
                                            @endif
                                        >{{ $assignment->alias }}:{{ $assignment->port }}</option>
                                    @endforeach
                                </select>
                                <p class="text-muted small">將用於此伺服器的默認連接位址。</p>
                            </div>
                            <div class="form-group">
                                <label for="pAddAllocations" class="control-label">分配額外埠</label>
                                <div>
                                    <select name="add_allocations[]" class="form-control" multiple id="pAddAllocations">
                                        @foreach ($unassigned as $assignment)
                                            <option value="{{ $assignment->id }}">{{ $assignment->alias }}:{{ $assignment->port }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <p class="text-muted small">請注意，由於軟體限制，您不能將不同 IP 上的相同埠分配給同一台伺服器.</p>
                            </div>
                            <div class="form-group">
                                <label for="pRemoveAllocations" class="control-label">移除額外埠</label>
                                <div>
                                    <select name="remove_allocations[]" class="form-control" multiple id="pRemoveAllocations">
                                        @foreach ($assigned as $assignment)
                                            <option value="{{ $assignment->id }}">{{ $assignment->alias }}:{{ $assignment->port }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <p class="text-muted small">只需從上面的列表中選擇您要刪除的埠。如果您想在已使用的不同 IP 上分配一個埠，您可以從左側選擇它並在此處將其刪除.</p>
                            </div>
                        </div>
                        <div class="box-footer">
                            {!! csrf_field() !!}
                            <button type="submit" class="btn btn-primary pull-right">更新構建配置</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>
    $('#pAddAllocations').select2();
    $('#pRemoveAllocations').select2();
    $('#pAllocation').select2();
    </script>
@endsection

