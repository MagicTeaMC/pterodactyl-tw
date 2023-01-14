import ServerInstallSvg from '@/assets/images/server_installing.svg';
import ServerErrorSvg from '@/assets/images/server_error.svg';
import ServerRestoreSvg from '@/assets/images/server_restore.svg';
import ScreenBlock from '@/components/elements/ScreenBlock';
import { ServerContext } from '@/state/server';

export default () => {
    const status = ServerContext.useStoreState(state => state.server.data?.status || null);
    const isTransferring = ServerContext.useStoreState(state => state.server.data?.isTransferring || false);
    const isNodeUnderMaintenance = ServerContext.useStoreState(
        state => state.server.data?.isNodeUnderMaintenance || false,
    );

    return status === 'installing' || status === 'install_failed' ? (
        <ScreenBlock
            title={'正在運行安裝程式'}
            image={ServerInstallSvg}
            message={'此伺服器應該很快就準備好了，請幾分鐘後再試。'}
        />
    ) : status === 'suspended' ? (
        <ScreenBlock
            title={'伺服器已凍結'}
            image={ServerErrorSvg}
            message={'此伺服器已被凍結，您目前無法訪問此伺服器。'}
        />
    ) : isNodeUnderMaintenance ? (
        <ScreenBlock title={'節點維護中'} image={ServerErrorSvg} message={'此伺服器的節點目前正在維護中。'} />
    ) : (
        <ScreenBlock
            title={isTransferring ? '轉移中' : '回檔中'}
            image={ServerRestoreSvg}
            message={
                isTransferring
                    ? '您的伺服器正在轉移到新節點，請稍後再回來查看。'
                    : '您的伺服器當前正在從備份中恢復，請過幾分鐘再來查看。'
            }
        />
    );
};

