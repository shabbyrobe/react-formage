import * as React from 'react';
declare type FormContextDef<T = {}> = FormActions<T> & {
    readonly bag: FormBag<T>;
};
export declare type FormUpdateEvent<TValues> = {
    readonly bag: FormBag<TValues>;
    readonly name: keyof TValues;
};
export declare type FormErrors<TValues> = {
    -readonly [K in keyof TValues]?: string;
};
export declare type FormTouched<TValues> = {
    -readonly [K in keyof TValues]?: boolean;
};
export declare type FormBag<TValues> = {
    readonly errors: FormErrors<TValues>;
    readonly touched: FormTouched<TValues>;
    readonly valid: boolean;
    readonly values: TValues;
};
export declare function createFormBag<TValues>(values: TValues): FormBag<TValues>;
export declare function validateFormBag<TValues>(bag: FormBag<TValues>, validator: FormValidator<TValues>): FormBag<TValues>;
export declare type FormValidator<TValues> = (values: TValues) => FormErrors<TValues>;
declare type FormProps<TValues> = {
    readonly onUpdate: (e: FormUpdateEvent<TValues>) => void;
    readonly validate?: FormValidator<TValues>;
    readonly bag: FormBag<TValues>;
    readonly validateOnChange?: boolean;
    readonly validateOnBlur?: boolean;
};
interface FormActions<TValues> {
    setFieldValue(name: keyof TValues, value: any, shouldValidate: boolean): FormBag<TValues>;
    handleChange: (name: keyof TValues, value: any) => void;
    handleBlur: (name: keyof TValues) => void;
}
export declare class Form<TValues extends object> extends React.Component<FormProps<TValues>> {
    static defaultProps: Partial<FormProps<any>>;
    private updateBag;
    private setFieldValue;
    private handleChange;
    private handleBlur;
    render(): JSX.Element;
}
declare type FieldErrorProps<TValues = any> = {
    readonly name: keyof TValues;
    /** Optional component to use instead of a <div> */
    readonly component?: React.ComponentType<{
        touched: boolean;
        message: string;
    }>;
    /** 'className' is ignored if 'component' is used */
    readonly className?: string;
    /** 'style' is ignored if 'component' is used */
    readonly style?: React.CSSProperties;
};
export declare class FieldError<TValues = object> extends React.Component<FieldErrorProps<TValues>> {
    static contextType: React.Context<FormContextDef>;
    context: FormContextDef<TValues>;
    render(): JSX.Element | null;
}
declare type FieldProps<TValues = any> = {
    readonly name: keyof TValues;
    /**
     * If component is set to 'input', 'type' is used for the input type, i.e.
     * 'checkbox', 'radio', etc.
     */
    readonly type?: 'text' | 'number' | 'radio' | 'checkbox' | string;
    readonly component?: 'input' | 'textarea' | 'select' | React.ComponentType<TValues> | React.ComponentType<void>;
};
export declare class Field<TValues = object> extends React.Component<FieldProps<TValues>> {
    static contextType: React.Context<FormContextDef>;
    context: FormContextDef<TValues>;
    static defaultProps: Partial<FieldProps<any>>;
    private onChange;
    private onBlur;
    private extractValue;
    render(): React.ComponentElement<{
        value: TValues[keyof TValues];
        onChange: (e: any) => void;
        onBlur: (e: any) => void;
        children: React.ReactNode;
        type?: string | undefined;
    }, React.Component<{
        value: TValues[keyof TValues];
        onChange: (e: any) => void;
        onBlur: (e: any) => void;
        children: React.ReactNode;
        type?: string | undefined;
    }, any, any>> | React.ComponentElement<{
        value: TValues[keyof TValues];
        change: (value: any) => void;
        blur: () => void;
        setFieldValue: (name: keyof TValues, value: any, shouldValidate: boolean) => FormBag<TValues>;
        children: React.ReactNode;
    }, React.Component<{
        value: TValues[keyof TValues];
        change: (value: any) => void;
        blur: () => void;
        setFieldValue: (name: keyof TValues, value: any, shouldValidate: boolean) => FormBag<TValues>;
        children: React.ReactNode;
    }, any, any>>;
}
export {};
