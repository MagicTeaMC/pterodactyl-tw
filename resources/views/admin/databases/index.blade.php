@extends('layouts.admin')

@section('title')
    資料庫主機
@endsection

@section('content-header')
    <h1>資料庫主機<small>伺服器可以在其上創建資料庫的資料庫主機。</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li class="active">資料庫主機</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">主機清單</h3>
                <div class="box-tools">
                    <button class="btn btn-sm btn-primary" data-toggle="modal" data-target="#newHostModal">新建</button>
                </div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <tbody>
                        <tr>
                            <th>ID</th>
                            <th>名稱</th>
                            <th>地址</th>
                            <th>埠</th>
                            <th>用戶名</th>
                            <th class="text-center">資料庫</th>
                            <th class="text-center">節點</th>
                        </tr>
                        @foreach ($hosts as $host)
                            <tr>
                                <td><code>{{ $host->id }}</code></td>
                                <td><a href="{{ route('admin.databases.view', $host->id) }}">{{ $host->name }}</a></td>
                                <td><code>{{ $host->host }}</code></td>
                                <td><code>{{ $host->port }}</code></td>
                                <td>{{ $host->username }}</td>
                                <td class="text-center">{{ $host->databases_count }}</td>
                                <td class="text-center">
                                    @if(! is_null($host->node))
                                        <a href="{{ route('admin.nodes.view', $host->node->id) }}">{{ $host->node->name }}</a>
                                    @else
                                        <span class="label label-default">無</span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="newHostModal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <form action="{{ route('admin.databases') }}" method="POST">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">新建資料庫主機</h4>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="pName" class="form-label">名稱</label>
                        <input type="text" name="name" id="pName" class="form-control" />
                        <p class="text-muted small">用於將此主機與其他主機區分開來的簡短識別字。必須介於 1 到 60 個字元之間，例如, <code>us.nyc.lvl3</code>.</p>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <label for="pHost" class="form-label">地址</label>
                            <input type="text" name="host" id="pHost" class="form-control" />
                            <p class="text-muted small">嘗試連接到此 MySQL 主機時應使用的 IP 位址或功能變數名稱.</p>
                        </div>
                        <div class="col-md-6">
                            <label for="pPort" class="form-label">埠</label>
                            <input type="text" name="port" id="pPort" class="form-control" value="3306"/>
                            <p class="text-muted small">MYSQL 主機運行開放的埠.</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <label for="pUsername" class="form-label">用戶名</label>
                            <input type="text" name="username" id="pUsername" class="form-control" />
                            <p class="text-muted small">具有足夠許可權在系統上創建新使用者和資料庫的帳戶的用戶名.</p>
                        </div>
                        <div class="col-md-6">
                            <label for="pPassword" class="form-label">密碼</label>
                            <input type="password" name="password" id="pPassword" class="form-control" />
                            <p class="text-muted small">上方閣下填寫的帳戶的密碼.</p>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="pNodeId" class="form-label">關聯的節點</label>
                        <select name="node_id" id="pNodeId" class="form-control">
                            <option value="">無</option>
                            @foreach($locations as $location)
                                <optgroup label="{{ $location->short }}">
                                    @foreach($location->nodes as $node)
                                        <option value="{{ $node->id }}">{{ $node->name }}</option>
                                    @endforeach
                                </optgroup>
                            @endforeach
                        </select>
                        <p class="text-muted small">此設置除了將資料庫預設添加到所選節點上的伺服器以外沒有任何作用.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <p class="text-danger small text-left">連接此資料庫主機所使用的帳戶 <strong>必須</strong> 具有 <code>WITH GRANT OPTION</code> 許可權. 如果帳戶沒有此許可權將 <em>無法</em> 成功建立資料庫. <strong>不要為 MySQL 使用您為此面板使用的相同帳戶詳細資訊.</strong></p>
                    {!! csrf_field() !!}
                    <button type="button" class="btn btn-default btn-sm pull-left" data-dismiss="modal">取消</button>
                    <button type="submit" class="btn btn-success btn-sm">創建</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        $('#pNodeId').select2();
    </script>
@endsection

