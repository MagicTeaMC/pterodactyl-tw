@section('settings::notice')
    @if(config('pterodactyl.load_environment_only', false))
        <div class="row">
            <div class="col-xs-12">
                <div class="alert alert-danger">
                    您的面板當前配置為僅從環境中讀取設置。 您需要在環境文件中設置 <code>APP_ENVIRONMENT_ONLY=false</code> 才能動態加載設置。
                </div>
            </div>
        </div>
    @endif
@endsection
