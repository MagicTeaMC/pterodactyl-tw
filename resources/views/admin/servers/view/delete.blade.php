@extends('layouts.admin')

@section('title')
    伺服器 — {{ $server->name }}: 刪除
@endsection

@section('content-header')
    <h1>{{ $server->name }}<small>將此伺服器從面板上刪除.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li><a href="{{ route('admin.servers') }}">伺服器</a></li>
        <li><a href="{{ route('admin.servers.view', $server->id) }}">{{ $server->name }}</a></li>
        <li class="active">刪除</li>
    </ol>
@endsection

@section('content')
@include('admin.servers.partials.navigation')
<div class="row">
    <div class="col-md-6">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title">安全刪除伺服器</h3>
            </div>
            <div class="box-body">
                <p>此操作將嘗試從面板和守護程式中刪除伺服器。如果其中任何流程一個報告錯誤，則該操作將被取消.</p>
                <p class="text-danger small">刪除伺服器是不可逆的操作. <strong>所有伺服器資料</strong> (包括檔和使用者) 都會被刪除.</p>
            </div>
            <div class="box-footer">
                <form id="deleteform" action="{{ route('admin.servers.view.delete', $server->id) }}" method="POST">
                    {!! csrf_field() !!}
                    <button id="deletebtn" class="btn btn-danger">安全刪除此伺服器</button>
                </form>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="box box-danger">
            <div class="box-header with-border">
                <h3 class="box-title">強制刪除伺服器</h3>
            </div>
            <div class="box-body">
                <p>此操作將嘗試從面板和守護程式中刪除伺服器。如果守護進程沒有回應，或報告錯誤，刪除操作將繼續.</p>
                <p class="text-danger small">刪除伺服器是不可逆的操作. <strong>所有伺服器資料</strong> (包括檔和使用者) 都會被刪除. 如果出現錯誤報告，此方法可能會在您的守護程式伺服器上留下垃圾檔.</p>
            </div>
            <div class="box-footer">
                <form id="forcedeleteform" action="{{ route('admin.servers.view.delete', $server->id) }}" method="POST">
                    {!! csrf_field() !!}
                    <input type="hidden" name="force_delete" value="1" />
                    <button id="forcedeletebtn"" class="btn btn-danger">強制刪除此伺服器</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>
    $('#deletebtn').click(function (event) {
        event.preventDefault();
        swal({
            title: '',
            type: 'warning',
            text: '您確定要刪除此伺服器嗎？ 沒有回頭路，所有資料將立即被刪除。',
            showCancelButton: true,
            confirmButtonText: '刪除',
            confirmButtonColor: '#d9534f',
            closeOnConfirm: false
        }, function () {
            $('#deleteform').submit()
        });
    });

    $('#forcedeletebtn').click(function (event) {
        event.preventDefault();
        swal({
            title: '',
            type: 'warning',
            text: '您確定要刪除此伺服器嗎？ 沒有回頭路，所有資料將立即被刪除。',
            showCancelButton: true,
            confirmButtonText: '刪除',
            confirmButtonColor: '#d9534f',
            closeOnConfirm: false
        }, function () {
            $('#forcedeleteform').submit()
        });
    });
    </script>
@endsection

