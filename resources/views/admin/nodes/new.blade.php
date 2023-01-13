@extends('layouts.admin')

@section('title')
    節點 &rarr; 新建
@endsection

@section('content-header')
    <h1>新節點<small>在本地或遠端主機創建面板使用的新節點.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li><a href="{{ route('admin.nodes') }}">節點</a></li>
        <li class="active">新建</li>
    </ol>
@endsection

@section('content')
<form action="{{ route('admin.nodes.new') }}" method="POST">
    <div class="row">
        <div class="col-sm-6">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">基礎資訊</h3>
                </div>
                <div class="box-body">
                    <div class="form-group">
                        <label for="pName" class="form-label">名稱</label>
                        <input type="text" name="name" id="pName" class="form-control" value="{{ old('name') }}"/>
                        <p class="text-muted small">字元限制: <code>a-zA-Z0-9_.-</code> 與 <code>[空格]</code> (最少 1, 最多 100 字元).</p>
                    </div>
                    <div class="form-group">
                        <label for="pDescription" class="form-label">描述</label>
                        <textarea name="description" id="pDescription" rows="4" class="form-control">{{ old('description') }}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="pLocationId" class="form-label">地域</label>
                        <select name="location_id" id="pLocationId">
                            @foreach($locations as $location)
                                <option value="{{ $location->id }}" {{ $location->id != old('location_id') ?: 'selected' }}>{{ $location->short }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">節點可見性</label>
                        <div>
                            <div class="radio radio-success radio-inline">

                                <input type="radio" id="pPublicTrue" value="1" name="public" checked>
                                <label for="pPublicTrue"> 公開 </label>
                            </div>
                            <div class="radio radio-danger radio-inline">
                                <input type="radio" id="pPublicFalse" value="0" name="public">
                                <label for="pPublicFalse"> 私人 </label>
                            </div>
                        </div>
                        <p class="text-muted small">將節點設為 <code>私人</code> 將無法使用節點自動部署的功能.
                    </div>
                    <div class="form-group">
                        <label for="pFQDN" class="form-label">功能變數名稱</label>
                        <input type="text" name="fqdn" id="pFQDN" class="form-control" value="{{ old('fqdn') }}"/>
                        <p class="text-muted small">請輸入用於連接守護程式的功能變數名稱 (例如 <code>node.example.com</code>)。<em>僅在</em> 您沒有為此節點使用 SSL 連接的情況下才可以使用 IP 位址。</p>
                    </div>
                    <div class="form-group">
                        <label class="form-label">與面板前端以 SSL 通信</label>
                        <div>
                            <div class="radio radio-success radio-inline">
                                <input type="radio" id="pSSLTrue" value="https" name="scheme" checked>
                                <label for="pSSLTrue"> 使用 SSL 通信</label>
                            </div>
                            <div class="radio radio-danger radio-inline">
                                <input type="radio" id="pSSLFalse" value="http" name="scheme" @if(request()->isSecure()) disabled @endif>
                                <label for="pSSLFalse"> 使用 HTTP 通信 (無 SSL)</label>
                            </div>
                        </div>
                        @if(request()->isSecure())
                            <p class="text-danger small">您的面板當前配置為使用 SSL 安全連接。為了讓流覽器連接到您的節點，其 <strong>必須</strong> 使用 SSL 連接.</p>
                        @else
                            <p class="text-muted small">在大多數情況下，您應該選擇使用 SSL 連接。如果使用 IP 位址或者您根本不想使用 SSL，請選擇 HTTP 連接。( 不安全 )</p>
                        @endif
                    </div>
                    <div class="form-group">
                        <label class="form-label">通過代理</label>
                        <div>
                            <div class="radio radio-success radio-inline">
                                <input type="radio" id="pProxyFalse" value="0" name="behind_proxy" checked>
                                <label for="pProxyFalse"> 不通過代理 </label>
                            </div>
                            <div class="radio radio-info radio-inline">
                                <input type="radio" id="pProxyTrue" value="1" name="behind_proxy">
                                <label for="pProxyTrue"> 通過代理 </label>
                            </div>
                        </div>
                        <p class="text-muted small">如果您在 Cloudflare 等代理CDN運行守護程式，請選擇此選項以使守護程式在啟動時跳過查找證書。</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-sm-6">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">設置</h3>
                </div>
                <div class="box-body">
                    <div class="row">
                        <div class="form-group col-md-6">
                            <label for="pDaemonBase" class="form-label">守護程式伺服器檔目錄</label>
                            <input type="text" name="daemonBase" id="pDaemonBase" class="form-control" value="/var/lib/pterodactyl/volumes" />
                            <p class="text-muted small">輸入存儲伺服器使用的檔目錄. <strong>如果您使用 OVH，您應該檢查您的分區方案。你可能需要讓 <code>/home/daemon-data</code> 有足夠的空間.</strong></p>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="pMemory" class="form-label">總記憶體容量</label>
                            <div class="input-group">
                                <input type="text" name="memory" data-multiplicator="true" class="form-control" id="pMemory" value="{{ old('memory') }}"/>
                                <span class="input-group-addon">MiB</span>
                            </div>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="pMemoryOverallocate" class="form-label">記憶體過額分配</label>
                            <div class="input-group">
                                <input type="text" name="memory_overallocate" class="form-control" id="pMemoryOverallocate" value="{{ old('memory_overallocate') }}"/>
                                <span class="input-group-addon">%</span>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <p class="text-muted small">輸入可用於新伺服器的記憶體總量。如果您希望允許過度分配記憶體，請輸入您希望允許的百分比。要禁用檢查過度分配，請輸入 <code>-1</code> 於此處. 如果輸入 <code>0</code> 這將在可能超出節點的最大記憶體總量時阻止創建新伺服器.</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group col-md-6">
                            <label for="pDisk" class="form-label">總存儲容量</label>
                            <div class="input-group">
                                <input type="text" name="disk" data-multiplicator="true" class="form-control" id="pDisk" value="{{ old('disk') }}"/>
                                <span class="input-group-addon">MiB</span>
                            </div>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="pDiskOverallocate" class="form-label">存儲空間過額分配</label>
                            <div class="input-group">
                                <input type="text" name="disk_overallocate" class="form-control" id="pDiskOverallocate" value="{{ old('disk_overallocate') }}"/>
                                <span class="input-group-addon">%</span>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <p class="text-muted small">輸入可用於新伺服器的存儲空間總量。如果您希望允許過度分配存儲空間，請輸入您希望允許的百分比。要禁用檢查過度分配，請輸入 <code>-1</code> 於此處. 如果輸入 <code>0</code> 這將在可能超出節點的最大存儲空間總量時阻止創建新伺服器.(請注意,備份檔案並不計入)</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group col-md-6">
                            <label for="pDaemonListen" class="form-label">守護進程埠</label>
                            <input type="text" name="daemonListen" class="form-control" id="pDaemonListen" value="8080" />
                        </div>
                        <div class="form-group col-md-6">
                            <label for="pDaemonSFTP" class="form-label">守護進程 SFTP 埠</label>
                            <input type="text" name="daemonSFTP" class="form-control" id="pDaemonSFTP" value="2022" />
                        </div>
                        <div class="col-md-12">
                            <p class="text-muted small">守護進程運行自己的 SFTP 管理容器，並且不使用主物理伺服器上的 SSHd 進程。<Strong>不要使用為物理伺服器的 SSH 進程分配的相同埠。</strong> 如果您將在 CloudFlare 後面運行守護程式&reg; 您應該將守護程式埠設置為 <code>8443</code> 允許通過 SSL 進行 websocket 代理.</p>
                        </div>
                    </div>
                </div>
                <div class="box-footer">
                    {!! csrf_field() !!}
                    <button type="submit" class="btn btn-success pull-right">創建節點</button>
                </div>
            </div>
        </div>
    </div>
</form>
@endsection

@section('footer-scripts')
    @parent
    <script>
        $('#pLocationId').select2();
    </script>
@endsection

