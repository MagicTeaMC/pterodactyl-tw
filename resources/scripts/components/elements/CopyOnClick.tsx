import classNames from 'classnames';
import copy from 'copy-to-clipboard';
import type { MouseEvent, ReactNode } from 'react';
import { Children, cloneElement, isValidElement, useEffect, useState } from 'react';

import Portal from '@/components/elements/Portal';
import FadeTransition from '@/components/elements/transitions/FadeTransition';

interface CopyOnClickProps {
    text: string | number | null | undefined;
    showInNotification?: boolean;
    children: ReactNode;
}

const CopyOnClick = ({ text, showInNotification = true, children }: CopyOnClickProps) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;

        const timeout = setTimeout(() => {
            setCopied(false);
        }, 2500);

        return () => {
            clearTimeout(timeout);
        };
    }, [copied]);

    if (!isValidElement(children)) {
        throw new Error('传递给 <CopyOnClick/> 的必须是有效的 React 元素。');
    }

    const child = !text
        ? Children.only(children)
        : cloneElement(Children.only(children), {
              // @ts-expect-error I don't know
              className: classNames(children.props.className || '', 'cursor-pointer'),
              onClick: (e: MouseEvent<HTMLElement>) => {
                  copy(String(text));
                  setCopied(true);
                  if (typeof children.props.onClick === 'function') {
                      children.props.onClick(e);
                  }
              },
          });

    return (
        <>
            {copied && (
                <Portal>
                    <FadeTransition show duration="duration-250" key={copied ? 'visible' : 'invisible'}>
                        <div className="fixed z-50 bottom-0 right-0 m-4">
                            <div className="rounded-md py-3 px-4 text-gray-200 bg-neutral-600/95 shadow">
                                <p>
                                    {showInNotification ? `已复制 "${String(text)}" 到剪切板.` : '已将文本复制到剪贴板'}
                                </p>
                            </div>
                        </div>
                    </FadeTransition>
                </Portal>
            )}
            {child}
        </>
    );
};

export default CopyOnClick;
