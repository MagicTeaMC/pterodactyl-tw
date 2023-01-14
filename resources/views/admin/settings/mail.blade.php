@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'mail'])

@section('title')
    郵件設置
@endsection

@section('content-header')
    <h1>郵件設置<small>配置翼龍面板如何發送郵件.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li class="active">設置</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')
    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">郵件設置</h3>
                </div>
                @if($disabled)
                    <div class="box-body">
                        <div class="row">
                            <div class="col-xs-12">
                                <div class="alert alert-info no-margin-bottom">
                                    此介面僅限於使用 SMTP 作為郵件驅動程式的實例。請使用 <code>php artisan p:environment:mail</code> 指令更新你的郵件設置, 或更改 <code>MAIL_DRIVER=smtp</code> 於你的 .env 環境檔內.
                                </div>
                            </div>
                        </div>
                    </div>
                @else
                    <form>
                        <div class="box-body">
                            <div class="row">
                                <div class="form-group col-md-6">
                                    <label class="control-label">SMTP 主機</label>
                                    <div>
                                        <input required type="text" class="form-control" name="mail:mailers:smtp:host" value="{{ old('mail:mailers:smtp:host', config('mail.mailers.smtp.host')) }}" />
                                        <p class="text-muted small">輸入發送郵件的 SMTP 伺服器位址.</p>
                                    </div>
                                </div>
                                <div class="form-group col-md-2">
                                    <label class="control-label">SMTP 主機埠</label>
                                    <div>
                                        <input required type="number" class="form-control" name="mail:mailers:smtp:port" value="{{ old('mail:mailers:smtp:port', config('mail.mailers.smtp.port')) }}" />
                                        <p class="text-muted small">輸入發送郵件的 SMTP 伺服器埠.</p>
                                    </div>
                                </div>
                                <div class="form-group col-md-4">
                                    <label class="control-label">加密方式</label>
                                    <div>
                                        @php
                                            $encryption = old('mail:mailers:smtp:encryption', config('mail.mailers.smtp.encryption'));
                                        @endphp
                                        <select name="mail:mailers:smtp:encryption" class="form-control">
                                            <option value="" @if($encryption === '') selected @endif>無</option>
                                            <option value="tls" @if($encryption === 'tls') selected @endif>傳輸層安全 (TLS)</option>
                                            <option value="ssl" @if($encryption === 'ssl') selected @endif>安全鏈路層 (SSL)</option>
                                        </select>
                                        <p class="text-muted small">選擇發送郵件時使用的加密類型.</p>
                                    </div>
                                </div>
                                <div class="form-group col-md-6">
                                    <label class="control-label">用戶名 <span class="field-optional"></span></label>
                                    <div>
                                        <input type="text" class="form-control" name="mail:mailers:smtp:username" value="{{ old('mail:mailers:smtp:username', config('mail.mailers.smtp.username')) }}" />
                                        <p class="text-muted small">連接到 SMTP 伺服器時使用的用戶名.</p>
                                    </div>
                                </div>
                                <div class="form-group col-md-6">
                                    <label class="control-label">密碼 <span class="field-optional"></span></label>
                                    <div>
                                        <input type="password" class="form-control" name="mail:mailers:smtp:password"/>
                                        <p class="text-muted small">與 SMTP 用戶名一起使用的密碼。留空以繼續使用現有密碼。要將密碼設置為空值，請輸入 <code>!e</code> .</p>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <hr />
                                <div class="form-group col-md-6">
                                    <label class="control-label">郵件寄件者</label>
                                    <div>
                                        <input required type="email" class="form-control" name="mail:from:address" value="{{ old('mail:from:address', config('mail.from.address')) }}" />
                                        <p class="text-muted small">輸入所有外發電子郵件都來自的電子郵箱位址.</p>
                                    </div>
                                </div>
                                <div class="form-group col-md-6">
                                    <label class="control-label">寄件者名稱 <span class="field-optional"></span></label>
                                    <div>
                                        <input type="text" class="form-control" name="mail:from:name" value="{{ old('mail:from:name', config('mail.from.name')) }}" />
                                        <p class="text-muted small">郵件寄件者名稱.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="box-footer">
                            {{ csrf_field() }}
                            <div class="pull-right">
                                <button type="button" id="testButton" class="btn btn-sm btn-success">測試</button>
                                <button type="button" id="saveButton" class="btn btn-sm btn-primary">保存</button>
                            </div>
                        </div>
                    </form>
                @endif
            </div>
        </div>
    </div>
@endsection

@section('footer-scripts')
    @parent

    <script>
        function saveSettings() {
            return $.ajax({
                method: 'PATCH',
                url: '/admin/settings/mail',
                contentType: 'application/json',
                data: JSON.stringify({
                    'mail:mailers:smtp:host': $('input[name="mail:mailers:smtp:host"]').val(),
                    'mail:mailers:smtp:port': $('input[name="mail:mailers:smtp:port"]').val(),
                    'mail:mailers:smtp:encryption': $('select[name="mail:mailers:smtp:encryption"]').val(),
                    'mail:mailers:smtp:username': $('input[name="mail:mailers:smtp:username"]').val(),
                    'mail:mailers:smtp:password': $('input[name="mail:mailers:smtp:password"]').val(),
                    'mail:from:address': $('input[name="mail:from:address"]').val(),
                    'mail:from:name': $('input[name="mail:from:name"]').val()
                }),
                headers: { 'X-CSRF-Token': $('input[name="_token"]').val() }
            }).fail(function (jqXHR) {
                showErrorDialog(jqXHR, 'save');
            });
        }

        function testSettings() {
            swal({
                type: 'info',
                title: '測試郵件設置',
                text: '點擊 "測試" 開始測試.',
                showCancelButton: true,
                confirmButtonText: '測試',
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            }, function () {
                $.ajax({
                    method: 'POST',
                    url: '/admin/settings/mail/test',
                    headers: { 'X-CSRF-TOKEN': $('input[name="_token"]').val() }
                }).fail(function (jqXHR) {
                    showErrorDialog(jqXHR, 'test');
                }).done(function () {
                    swal({
                        title: '成功',
                        text: '測試資訊已發送成功.',
                        type: 'success'
                    });
                });
            });
        }

        function saveAndTestSettings() {
            saveSettings().done(testSettings);
        }

        function showErrorDialog(jqXHR, verb) {
            console.error(jqXHR);
            var errorText = '';
            if (!jqXHR.responseJSON) {
                errorText = jqXHR.responseText;
            } else if (jqXHR.responseJSON.error) {
                errorText = jqXHR.responseJSON.error;
            } else if (jqXHR.responseJSON.errors) {
                $.each(jqXHR.responseJSON.errors, function (i, v) {
                    if (v.detail) {
                        errorText += v.detail + ' ';
                    }
                });
            }

            swal({
                title: 'Whoops!',
                text: '嘗試執行時出錯 ' + verb + ' 郵箱設置: ' + errorText,
                type: 'error'
            });
        }

        $(document).ready(function () {
            $('#testButton').on('click', saveAndTestSettings);
            $('#saveButton').on('click', function () {
                saveSettings().done(function () {
                    swal({
                        title: '成功',
                        text: '郵件設置已成功更新，佇列工作器已重新開機以應用這些更改.',
                        type: 'success'
                    });
                });
            });
        });
    </script>
@endsection

