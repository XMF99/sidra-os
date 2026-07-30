import { FC, ReactNode, CSSProperties } from 'react';
export interface StackProps {
    direction?: 'column' | 'row';
    gap?: string | number;
    align?: CSSProperties['alignItems'];
    justify?: CSSProperties['justifyContent'];
    wrap?: boolean;
    style?: CSSProperties;
    children?: ReactNode;
}
export declare const Stack: FC<StackProps>;
//# sourceMappingURL=Stack.d.ts.map