@section('settings::notice')
    @if(config('pterodactyl.load_environment_only', false))
        <div class="row">
            <div class="col-xs-12">
                <div class="alert alert-danger">
                    您的面板目前設定為僅從環境中讀取設定。您需要在環境文件中設定<code>APP_ENVIRONMENT_ONLY=false</code>以動態載入設定
                </div>
            </div>
        </div>
    @endif
@endsection
