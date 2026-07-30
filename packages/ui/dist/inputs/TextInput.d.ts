import { FC, InputHTMLAttributes, ReactNode } from 'react';
export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}
export declare const TextInput: FC<TextInputProps>;
//# sourceMappingURL=TextInput.d.ts.map