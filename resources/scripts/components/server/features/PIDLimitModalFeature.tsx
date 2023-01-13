import { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import Modal from '@/components/elements/Modal';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import { SocketEvent } from '@/components/server/events';
import { useStoreState } from 'easy-peasy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const PIDLimitModalFeature = () => {
    const [visible, setVisible] = useState(false);
    const [loading] = useState(false);

    const status = ServerContext.useStoreState(state => state.status.value);
    const { clearFlashes } = useFlash();
    const { connected, instance } = ServerContext.useStoreState(state => state.socket);
    const isAdmin = useStoreState(state => state.user.data!.rootAdmin);

    useEffect(() => {
        if (!connected || !instance || status === 'running') return;

        const errors = [
            'pthread_create failed',
            'failed to create thread',
            'unable to create thread',
            'unable to create native thread',
            'unable to create new native thread',
            'exception in thread "craft async scheduler management thread"',
        ];

        const listener = (line: string) => {
            if (errors.some(p => line.toLowerCase().includes(p))) {
                setVisible(true);
            }
        };

        instance.addListener(SocketEvent.CONSOLE_OUTPUT, listener);

        return () => {
            instance.removeListener(SocketEvent.CONSOLE_OUTPUT, listener);
        };
    }, [connected, instance, status]);

    useEffect(() => {
        clearFlashes('feature:pidLimit');
    }, []);

    return (
        <Modal
            visible={visible}
            onDismissed={() => setVisible(false)}
            closeOnBackground={false}
            showSpinnerOverlay={loading}
        >
            <FlashMessageRender key={'feature:pidLimit'} css={tw`mb-4`} />
            {isAdmin ? (
                <>
                    <div css={tw`mt-4 sm:flex items-center`}>
                        <FontAwesomeIcon css={tw`pr-4`} icon={faExclamationTriangle} color={'orange'} size={'4x'} />
                        <h2 css={tw`text-2xl mb-4 text-neutral-100 `}>已達到記憶體或進程限制...</h2>
                    </div>
                    <p css={tw`mt-4`}>此伺服器已達到最大進程或記憶體限制。</p>
                    <p css={tw`mt-4`}>
                        在wings配置中增加 <code css={tw`font-mono bg-neutral-900`}>container_pid_limit</code> ,{' '}
                        <code css={tw`font-mono bg-neutral-900`}>config.yml</code>, 可能有助於解決這個問題。
                    </p>
                    <p css={tw`mt-4`}>
                        <b>注意：必須重新啟動 Wings 才能使設定檔更改生效</b>
                    </p>
                    <div css={tw`mt-8 sm:flex items-center justify-end`}>
                        <Button onClick={() => setVisible(false)} css={tw`w-full sm:w-auto border-transparent`}>
                            關閉
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <div css={tw`mt-4 sm:flex items-center`}>
                        <FontAwesomeIcon css={tw`pr-4`} icon={faExclamationTriangle} color={'orange'} size={'4x'} />
                        <h2 css={tw`text-2xl mb-4 text-neutral-100`}>可能達到資源限制...</h2>
                    </div>
                    <p css={tw`mt-4`}>此伺服器嘗試使用的資源多於分配的資源。請聯繫管理員，並在下面給他們錯誤資訊。</p>
                    <p css={tw`mt-4`}>
                        <code css={tw`font-mono bg-neutral-900`}>
                            pthread_create 失敗，可能記憶體不足或已達到進程/資源限制
                        </code>
                    </p>
                    <div css={tw`mt-8 sm:flex items-center justify-end`}>
                        <Button onClick={() => setVisible(false)} css={tw`w-full sm:w-auto border-transparent`}>
                            關閉
                        </Button>
                    </div>
                </>
            )}
        </Modal>
    );
};

export default PIDLimitModalFeature;

