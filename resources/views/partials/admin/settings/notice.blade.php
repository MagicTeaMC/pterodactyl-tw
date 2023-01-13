@section('settings::notice')
    @if(config('pterodactyl.load_environment_only', false))
        <div class="row">
            <div class="col-xs-12">
                <div class="alert alert-danger">
                    您的面板当前配置为仅从环境中读取设置。您需要在环境文件中设置 <code>APP_ENVIRONMENT_ONLY=false</code> 才能动态加载设置。
                </div>
            </div>
        </div>
    @endif
@endsection
