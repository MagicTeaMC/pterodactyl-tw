import type { ReactNode } from 'react';

import Can from '@/components/elements/Can';
import { ServerError } from '@/components/elements/ScreenBlock';

export interface RequireServerPermissionProps {
    children?: ReactNode;

    permissions: string | string[];
}

function RequireServerPermission({ children, permissions }: RequireServerPermissionProps) {
    return (
        <Can action={permissions} renderOnError={<ServerError title={'拒绝访问'} message={'您没有权限访问此页面。'} />}>
            {children}
        </Can>
    );
}

export default RequireServerPermission;
