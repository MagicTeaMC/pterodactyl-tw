import React from 'react';
import { ServerContext } from '@/state/server';
import ScreenBlock from '@/components/elements/ScreenBlock';
import ServerInstallSvg from '@/assets/images/server_installing.svg';
import ServerErrorSvg from '@/assets/images/server_error.svg';
import ServerRestoreSvg from '@/assets/images/server_restore.svg';

export default () => {
    const status = ServerContext.useStoreState((state) => state.server.data?.status || null);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data?.isTransferring || false);
    const isNodeUnderMaintenance = ServerContext.useStoreState(
        (state) => state.server.data?.isNodeUnderMaintenance || false
    );

    return status === 'installing' || status === 'install_failed' || status === 'reinstall_failed' ? (
        <ScreenBlock
            title={'正在安裝伺服器'}
            image={ServerInstallSvg}
            message={'正在為您安裝伺服器，請稍後再試'}
        />
    ) : status === 'suspended' ? (
        <ScreenBlock
            title={'伺服器已被停權'}
            image={ServerErrorSvg}
            message={'您的伺服器被停權了'}
        />
    ) : isNodeUnderMaintenance ? (
        <ScreenBlock
            title={'主機正在維護'}
            image={ServerErrorSvg}
            message={'這台伺服器所在主機正在維護'}
        />
    ) : (
        <ScreenBlock
            title={isTransferring ? '轉移中' : '從備份恢復'}
            image={ServerRestoreSvg}
            message={
                isTransferring
                    ? '您的伺服器正在轉移到新主機，請稍後再試'
                    : '您的伺服器正在備份恢復，請稍後再試'
            }
        />
    );
};
