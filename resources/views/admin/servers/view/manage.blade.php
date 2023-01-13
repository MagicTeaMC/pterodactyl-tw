@extends('layouts.admin')

@section('title')
    伺服器 — {{ $server->name }}: 管理
@endsection

@section('content-header')
    <h1>{{ $server->name }}<small>控制此伺服器的其他操作.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li><a href="{{ route('admin.servers') }}">伺服器</a></li>
        <li><a href="{{ route('admin.servers.view', $server->id) }}">{{ $server->name }}</a></li>
        <li class="active">管理</li>
    </ol>
@endsection

@section('content')
    @include('admin.servers.partials.navigation')
    <div class="row">
        <div class="col-sm-4">
            <div class="box box-danger">
                <div class="box-header with-border">
                    <h3 class="box-title">重新安裝伺服器</h3>
                </div>
                <div class="box-body">
                    <p>此操作將使用預設的安裝腳本重新安裝伺服器。<strong>危險!</strong> 這可能會覆蓋伺服器資料。</p>
                </div>
                <div class="box-footer">
                    @if($server->isInstalled())
                        <form action="{{ route('admin.servers.view.manage.reinstall', $server->id) }}" method="POST">
                            {!! csrf_field() !!}
                            <button type="submit" class="btn btn-danger">重新安裝伺服器</button>
                        </form>
                    @else
                        <button class="btn btn-danger disabled">伺服器必須正常安裝之後才可重新安裝</button>
                    @endif
                </div>
            </div>
        </div>
        <div class="col-sm-4">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">安裝狀態</h3>
                </div>
                <div class="box-body">
                    <p>如果您需要將安裝狀態從已卸載更改為已安裝，反之亦然，您可以使用下面的按鈕進行操作。</p>
                </div>
                <div class="box-footer">
                    <form action="{{ route('admin.servers.view.manage.toggle', $server->id) }}" method="POST">
                        {!! csrf_field() !!}
                        <button type="submit" class="btn btn-primary">更改安裝狀態</button>
                    </form>
                </div>
            </div>
        </div>

        @if(! $server->isSuspended())
            <div class="col-sm-4">
                <div class="box box-warning">
                    <div class="box-header with-border">
                        <h3 class="box-title">凍結伺服器</h3>
                    </div>
                    <div class="box-body">
                        <p>這將暫停伺服器，停止任何正在運行的進程，並立即阻止使用者訪問他們的檔或通過面板或 API 管理伺服器.</p>
                    </div>
                    <div class="box-footer">
                        <form action="{{ route('admin.servers.view.manage.suspension', $server->id) }}" method="POST">
                            {!! csrf_field() !!}
                            <input type="hidden" name="action" value="suspend" />
                            <button type="submit" class="btn btn-warning @if(! is_null($server->transfer)) disabled @endif">凍結伺服器</button>
                        </form>
                    </div>
                </div>
            </div>
        @else
            <div class="col-sm-4">
                <div class="box box-success">
                    <div class="box-header with-border">
                        <h3 class="box-title">撤銷凍結伺服器</h3>
                    </div>
                    <div class="box-body">
                        <p>這將撤銷伺服器的凍結，且用戶將有許可權管理此伺服器.</p>
                    </div>
                    <div class="box-footer">
                        <form action="{{ route('admin.servers.view.manage.suspension', $server->id) }}" method="POST">
                            {!! csrf_field() !!}
                            <input type="hidden" name="action" value="unsuspend" />
                            <button type="submit" class="btn btn-success">撤銷凍結伺服器</button>
                        </form>
                    </div>
                </div>
            </div>
        @endif

        @if(is_null($server->transfer))
            <div class="col-sm-4">
                <div class="box box-success">
                    <div class="box-header with-border">
                        <h3 class="box-title">轉移伺服器</h3>
                    </div>
                    <div class="box-body">
                        <p>
                            將此伺服器轉移到連接到此面板的另一個節點.
                            <strong>警告!</strong> 此功能未完全測試可能有BUG.
                        </p>
                    </div>

                    <div class="box-footer">
                        @if($canTransfer)
                            <button class="btn btn-success" data-toggle="modal" data-target="#transferServerModal">轉移伺服器</button>
                        @else
                            <button class="btn btn-success disabled">轉移伺服器</button>
                            <p style="padding-top: 1rem;">轉移一台伺服器需要在您的面板上配置多個節點。</p>
                        @endif
                    </div>
                </div>
            </div>
        @else
            <div class="col-sm-4">
                <div class="box box-success">
                    <div class="box-header with-border">
                        <h3 class="box-title">轉移伺服器</h3>
                    </div>
                    <div class="box-body">
                        <p>
                            此伺服器正在轉移至另一個節點.
                            轉移開始於 <strong>{{ $server->transfer->created_at }}</strong>
                        </p>
                    </div>

                    <div class="box-footer">
                        <button class="btn btn-success disabled">轉移伺服器</button>
                    </div>
                </div>
            </div>
        @endif
    </div>

    <div class="modal fade" id="transferServerModal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <form action="{{ route('admin.servers.view.manage.transfer', $server->id) }}" method="POST">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title">轉移伺服器</h4>
                    </div>

                    <div class="modal-body">
                        <div class="row">
                            <div class="form-group col-md-12">
                                <label for="pNodeId">節點</label>
                                <select name="node_id" id="pNodeId" class="form-control">
                                    @foreach($locations as $location)
                                        <optgroup label="{{ $location->long }} ({{ $location->short }})">
                                            @foreach($location->nodes as $node)

                                                @if($node->id != $server->node_id)
                                                    <option value="{{ $node->id }}"
                                                            @if($location->id === old('location_id')) selected @endif
                                                    >{{ $node->name }}</option>
                                                @endif

                                            @endforeach
                                        </optgroup>
                                    @endforeach
                                </select>
                                <p class="small text-muted no-margin">該伺服器將被轉移到的節點.</p>
                            </div>

                            <div class="form-group col-md-12">
                                <label for="pAllocation">默認分配</label>
                                <select name="allocation_id" id="pAllocation" class="form-control"></select>
                                <p class="small text-muted no-margin">將分配給此伺服器的主要分配。</p>
                            </div>

                            <div class="form-group col-md-12">
                                <label for="pAllocationAdditional">額外分配</label>
                                <select name="allocation_additional[]" id="pAllocationAdditional" class="form-control" multiple></select>
                                <p class="small text-muted no-margin">將分配給此伺服器的額外分配。</p>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        {!! csrf_field() !!}
                        <button type="button" class="btn btn-default btn-sm pull-left" data-dismiss="modal">取消</button>
                        <button type="submit" class="btn btn-success btn-sm">確定</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection

@section('footer-scripts')
    @parent
    {!! Theme::js('vendor/lodash/lodash.js') !!}

    @if($canTransfer)
        {!! Theme::js('js/admin/server/transfer.js') !!}
    @endif
@endsection

