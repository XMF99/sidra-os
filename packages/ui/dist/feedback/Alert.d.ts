import { FC, ReactNode } from 'react';
export interface AlertProps {
    type?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    children?: ReactNode;
}
export declare const Alert: FC<AlertProps>;
//# sourceMappingURL=Alert.d.ts.map