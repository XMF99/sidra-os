import { FC, ReactNode, CSSProperties } from 'react';
export interface HeadingProps {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    color?: string;
    style?: CSSProperties;
    children?: ReactNode;
}
export declare const Heading: FC<HeadingProps>;
//# sourceMappingURL=Heading.d.ts.map