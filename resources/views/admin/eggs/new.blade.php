@extends('layouts.admin')

@section('title')
預設配置
@endsection

@section('content-header')
<h1>新預設<small>為伺服器創建新預設.</small></h1>
<ol class="breadcrumb">
    <li><a href="{{ route('admin.index') }}">管理</a></li>
    <li><a href="{{ route('admin.nests') }}">預設組</a></li>
    <li class="active">新預設</li>
</ol>
@endsection

@section('content')
<form action="{{ route('admin.nests.egg.new') }}" method="POST">
    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">配置</h3>
                </div>
                <div class="box-body">
                    <div class="row">
                        <div class="col-sm-6">
                            <div class="form-group">
                                <label for="pNestId" class="form-label">所屬預設組</label>
                                <div>
                                    <select name="nest_id" id="pNestId">
                                        @foreach($nests as $nest)
                                        <option value="{{ $nest->id }}" {{ old('nest_id') != $nest->id ?: 'selected' }}>{{ $nest->name }} &lt;{{ $nest->author }}&gt;</option>
                                        @endforeach
                                    </select>
                                    <p class="text-muted small">官方將此功能定義為 Nest 和 Egg，為了中文語境下更方便理解，將其翻譯為預設組和預設。</p>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="pName" class="form-label">預設名</label>
                                <input type="text" id="pName" name="name" value="{{ old('name') }}" class="form-control" />
                                <p class="text-muted small">一個簡單的、易讀的，用作此預設的識別字。這是用戶將看到的遊戲伺服器類型.</p>
                            </div>
                            <div class="form-group">
                                <label for="pDescription" class="form-label">描述</label>
                                <textarea id="pDescription" name="description" class="form-control" rows="8">{{ old('description') }}</textarea>
                                <p class="text-muted small">預設的描述.</p>
                            </div>
                            <div class="form-group">
                                <div class="checkbox checkbox-primary no-margin-bottom">
                                    <input id="pForceOutgoingIp" name="force_outgoing_ip" type="checkbox" value="1" {{ \Pterodactyl\Helpers\Utilities::checked('force_outgoing_ip', 0) }} />
                                    <label for="pForceOutgoingIp" class="strong">強制傳出 IP</label>
                                    <p class="text-muted small">
                                        強制所有傳出的網路流量將其源 IP位址轉換(NAT) 到伺服器首選IP 的 IP地址。
                                        當節點具有多個公共IP位址時，某些遊戲需要它才能正常運行。
                                        <br>
                                        <strong>
                                            啟用此選項將禁用任何使用此預設的伺服器內網，這將導致它們無法從內部訪問同一節點上的其他伺服器。
                                        </strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-6">
                            <div class="form-group">
                                <label for="pDockerImage" class="control-label">Docker 鏡像</label>
                                <textarea id="pDockerImages" name="docker_images" rows="4" placeholder="quay.io/pterodactyl/service" class="form-control">{{ old('docker_images') }}</textarea>
                                <p class="text-muted small">使用這個預設的伺服器可用的 Docker 鏡像。每行輸入一個。如果提供了多個值，使用者將能夠從此圖像清單中自行選擇。</p>
                            </div>
                            <div class="form-group">
                                <label for="pStartup" class="control-label">啟動命令</label>
                                <textarea id="pStartup" name="startup" class="form-control" rows="10">{{ old('startup') }}</textarea>
                                <p class="text-muted small">用於此預設創建的新伺服器的默認啟動命令。您可以根據需要更改每個伺服器。</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">進程管理識別</h3>
                </div>
                <div class="box-body">
                    <div class="row">
                        <div class="col-xs-12">
                            <div class="alert alert-warning">
                                <p>除非您從“複製設置自”下拉式功能表中選擇單獨的選項，否則下方所有框框都是必填的，在使用複製設置情況下，框框可以留空以使用原預設中的值。</p>
                            </div>
                        </div>
                        <div class="col-sm-6">
                            <div class="form-group">
                                <label for="pConfigFrom" class="form-label">複製設置自</label>
                                <select name="config_from" id="pConfigFrom" class="form-control">
                                    <option value="">無</option>
                                </select>
                                <p class="text-muted small">如果您想默認使用另一個預設的設置，請從上面的下拉清單中選擇它。</p>
                            </div>
                            <div class="form-group">
                                <label for="pConfigStop" class="form-label">關機命令</label>
                                <input type="text" id="pConfigStop" name="config_stop" class="form-control" value="{{ old('config_stop') }}" />
                                <p class="text-muted small">應該發送到伺服器進程以正常停止它們的命令。如果你需要輸出 <code>SIGINT</code> 你應該填入 <code>^C</code> 於此。</p>
                            </div>
                            <div class="form-group">
                                <label for="pConfigLogs" class="form-label">日誌設置</label>
                                <textarea data-action="handle-tabs" id="pConfigLogs" name="config_logs" class="form-control" rows="6">{{ old('config_logs') }}</textarea>
                                <p class="text-muted small">這裡應該用 JSON 格式語法來讓系統判斷是否進行日誌記錄並指定日誌存儲的位置。</p>
                            </div>
                        </div>
                        <div class="col-sm-6">
                            <div class="form-group">
                                <label for="pConfigFiles" class="form-label">設定檔</label>
                                <textarea data-action="handle-tabs" id="pConfigFiles" name="config_files" class="form-control" rows="6">{{ old('config_files') }}</textarea>
                                <p class="text-muted small">這裡應該使用 JSON 格式語法來讓系統判斷更改那些設定檔以及更改何處。</p>
                            </div>
                            <div class="form-group">
                                <label for="pConfigStartup" class="form-label">啟動識別</label>
                                <textarea data-action="handle-tabs" id="pConfigStartup" name="config_startup" class="form-control" rows="6">{{ old('config_startup') }}</textarea>
                                <p class="text-muted small">這裡應該使用 JSON 格式語法來讓系統判斷服務端程式是否已正常啟動完成。</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="box-footer">
                    {!! csrf_field() !!}
                    <button type="submit" class="btn btn-success btn-sm pull-right">創建</button>
                </div>
            </div>
        </div>
    </div>
</form>
@endsection

@section('footer-scripts')
@parent
{!! Theme::js('vendor/lodash/lodash.js') !!}
<script>
    $(document).ready(function() {
        $('#pNestId').select2().change();
        $('#pConfigFrom').select2();
    });
    $('#pNestId').on('change', function(event) {
        $('#pConfigFrom').html('<option value="">None</option>').select2({
            data: $.map(_.get(Pterodactyl.nests, $(this).val() + '.eggs', []), function(item) {
                return {
                    id: item.id,
                    text: item.name + ' <' + item.author + '>',
                };
            }),
        });
    });
    $('textarea[data-action="handle-tabs"]').on('keydown', function(event) {
        if (event.keyCode === 9) {
            event.preventDefault();

            var curPos = $(this)[0].selectionStart;
            var prepend = $(this).val().substr(0, curPos);
            var append = $(this).val().substr(curPos);

            $(this).val(prepend + '    ' + append);
        }
    });
</script>
@endsection

