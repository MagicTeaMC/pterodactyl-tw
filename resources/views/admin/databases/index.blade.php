@extends('layouts.admin')

@section('title')
    資料庫主機
@endsection

@section('content-header')
    <h1>資料庫主機<small>伺服器可以在其上建立資料庫的資料庫主機</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理員</a></li>
        <li class="active">資料庫主機</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">主機列表</h3>
                <div class="box-tools">
                    <button class="btn btn-sm btn-primary" data-toggle="modal" data-target="#newHostModal">建立新的w</button>
                </div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <tbody>
                        <tr>
                            <th>ID</th>
                            <th>名稱</th>
                            <th>主機</th>
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
                                        <span class="label label-default">None</span>
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
                    <h4 class="modal-title">建立新的資料庫主機</h4>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="pName" class="form-label">Name</label>
                        <input type="text" name="name" id="pName" class="form-control" />
                        <p class="text-muted small">用於區分此位置與其他位置的簡短標識。必須在1到60個字符之間，例：<code>us.nyc.lvl3</code></p>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <label for="pHost" class="form-label">主機</label>
                            <input type="text" name="host" id="pHost" class="form-control" />
                            <p class="text-muted small">在嘗試從面板連接到此MySQL主機時應使用的 IP 地址或FQDN以添加新資料庫</p>
                        </div>
                        <div class="col-md-6">
                            <label for="pPort" class="form-label">埠</label>
                            <input type="text" name="port" id="pPort" class="form-control" value="3306"/>
                            <p class="text-muted small">MySQL在此主機上運行的端口</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <label for="pUsername" class="form-label">用戶名</label>
                            <input type="text" name="username" id="pUsername" class="form-control" />
                            <p class="text-muted small">具有足夠權限在系統上創建新使用者和資料庫的帳戶的使用者名稱</p>
                        </div>
                        <div class="col-md-6">
                            <label for="pPassword" class="form-label">密碼</label>
                            <input type="password" name="password" id="pPassword" class="form-control" />
                            <p class="text-muted small">帳號的密碼</p>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="pNodeId" class="form-label">已綁定節點</label>
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
                        <p class="text-muted small">此設定除了在選定節點上將資料庫新增到伺服器時預設為此資料庫主機外，不起任何作用</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <p class="text-danger small text-left">為此資料庫主機定義的帳戶<strong>必須</strong>具有<code>WITH GRANT OPTION</code>權限。如果所定義的帳戶沒有此權限，則創建資料庫的請求<strong>將</strong>失敗。<strong>請勿使用您為此面板定義的 MySQL 相同帳戶詳細資料。</strong></p>
                    {!! csrf_field() !!}
                    <button type="button" class="btn btn-default btn-sm pull-left" data-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-success btn-sm">建立</button>
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
