import * as React from 'react';
export declare type FormUpdateEvent<TValues> = {
    readonly bag: FormBag<TValues>;
    readonly name: keyof TValues;
};
export declare type FormErrors<TValues, TKey = keyof TValues> = {
    -readonly [TKey in keyof TValues]?: FormErrors<TValues[TKey], TKey> | string;
};
export declare type FormTouched<TValues, TKey = keyof TValues> = {
    -readonly [TKey in keyof TValues]?: FormTouched<TValues[TKey], TKey> | boolean;
};
export declare type FormBag<TValues> = {
    readonly errors: FormErrors<TValues>;
    readonly touched: FormTouched<TValues>;
    readonly valid: boolean;
    readonly values: TValues;
};
export declare function createFormBag<TValues>(values: TValues, options?: {
    initialValid?: boolean;
}): FormBag<TValues>;
export declare function validateFormBag<TValues>(bag: FormBag<TValues>, validator: FormValidator<TValues>): FormBag<TValues>;
export declare type FormValidator<TValues> = (values: TValues) => FormErrors<TValues>;
declare type FormProps<TValues> = {
    readonly bag: FormBag<TValues>;
    readonly onUpdate: (e: FormUpdateEvent<TValues>) => void;
    readonly validate?: FormValidator<TValues>;
    readonly validateOnChange?: boolean;
    readonly validateOnBlur?: boolean;
};
export declare type FieldUpdateOptions = {
    readonly shouldValidate?: boolean;
};
declare class FormContextDef<TValues = any> {
    private _bag;
    private validate?;
    private onUpdate;
    private options;
    constructor(bag: FormBag<TValues>, onUpdate: (e: FormUpdateEvent<TValues>) => void, validate: FormValidator<TValues> | undefined, options: {
        validateOnChange?: boolean;
        validateOnBlur?: boolean;
    });
    readonly bag: FormBag<TValues>;
    updateBag: (values: TValues, touched: FormTouched<TValues, keyof TValues>, options?: FieldUpdateOptions | undefined) => FormBag<TValues>;
    handleChangeBag(name: keyof TValues, childBag: FormBag<TValues[typeof name]>, options?: FieldUpdateOptions): FormBag<TValues>;
    handleChange(name: keyof TValues, value: any): void;
    handleBlur(name: keyof TValues): FormBag<TValues>;
    packBag(name: keyof TValues, initialValue: TValues[typeof name]): FormBag<NonNullable<TValues[typeof name]>>;
    setFieldValue(name: keyof TValues, value: any, options?: FieldUpdateOptions): FormBag<TValues>;
    setFieldTouched(name: keyof TValues): FormBag<TValues>;
}
/** FormData provides a context to one or more Field components, validates the
 *  field values and propagates updates to the parent component. */
export declare class FormData<TValues extends object> extends React.Component<FormProps<TValues>> {
    static defaultProps: {
        validateOnChange: boolean;
        validateOnBlur: boolean;
    };
    render(): JSX.Element;
}
export declare type FieldErrorComponentProps<TValues> = React.PropsWithChildren<{
    readonly touched: boolean;
    readonly message: string;
}>;
declare type FieldErrorProps<TValues> = Styleable & {
    readonly name: keyof TValues;
    /** Optional component to use instead of a <div> */
    readonly component?: React.ComponentType<FieldErrorComponentProps<TValues>>;
    /** By default, FieldError is rendered even if there is no message so you can
      * set a fixed height and expect your layout to be preserved. Set this to true
      * if you don't want an element in the DOM even if there is no message. */
    readonly hideIfEmpty?: boolean;
};
export declare class FieldError<TValues = any> extends React.Component<FieldErrorProps<TValues>> {
    static contextType: React.Context<FormContextDef>;
    context: FormContextDef<TValues>;
    render(): React.ReactElement<React.PropsWithChildren<{
        readonly touched: boolean;
        readonly message: string;
    }>, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.DetailedReactHTMLElement<{
        className?: string | undefined;
        style?: React.CSSProperties | undefined;
        children?: React.ReactNode;
    }, HTMLElement> | null;
}
declare type Styleable = {
    /** 'className' is ignored if 'component' is used */
    readonly className?: string;
    /** 'style' is ignored if 'component' is used */
    readonly style?: React.CSSProperties;
};
declare type FieldBaseProps<TValues, TKey extends keyof TValues, TValue extends TValues[TKey]> = FieldRenderProps<TValues, TValue> & {
    readonly name: TKey;
    /** If component is set to 'input', 'type' is used for the input type, i.e.
     *  'checkbox', 'radio', etc. */
    readonly type?: 'text' | 'number' | 'radio' | 'checkbox' | string;
};
declare type FieldRenderProps<TValues, TValue> = {
    readonly render: ((props: FieldComponentProps<TValues, TValue>) => React.ReactNode);
} | {
    readonly component?: 'input' | 'textarea' | 'select';
    readonly disabled?: boolean;
};
declare type FieldProps<TValues, TKey extends keyof TValues, TValue extends TValues[TKey]> = Styleable & FieldBaseProps<TValues, TKey, TValue>;
export declare type FieldComponentProps<TValues, TValue> = React.PropsWithChildren<{
    readonly value: TValue;
    readonly change: (value: TValue) => void;
    readonly changeBag: (value: FormBag<TValue>, options?: FieldUpdateOptions) => void;
    readonly packBag: (initialValue: TValue) => FormBag<NonNullable<TValue>>;
    readonly blur: () => void;
    readonly setFieldValue: (name: keyof TValues, value: TValues[typeof name], options?: FieldUpdateOptions) => FormBag<TValues>;
    readonly setFieldTouched: (name: keyof TValues) => FormBag<TValues>;
}>;
export declare class Field<TValues = any, TKey extends keyof TValues = any, TValue extends TValues[TKey] = TValues[TKey]> extends React.Component<FieldProps<TValues, TKey, TValue>> {
    static contextType: React.Context<FormContextDef>;
    context: FormContextDef<TValues>;
    static defaultProps: {
        component: string;
    };
    private onChange;
    private onBlur;
    private extractValue;
    private renderProps;
    render(): React.ReactNode;
}
export declare type LabelledFieldProps<TValues, TKey extends keyof TValues, TValue extends TValues[TKey]> = Styleable & FieldBaseProps<TValues, TKey, TValue> & React.PropsWithChildren<{
    readonly label: string;
    readonly errorComponent?: React.ComponentType<FieldErrorComponentProps<TValues>>;
    readonly hideErrorIfEmpty?: boolean;
    readonly errorClassName?: string;
}>;
export declare function LabelledField<TValues = any, TKey extends keyof TValues = any, TValue extends TValues[TKey] = TValues[TKey]>(props: LabelledFieldProps<TValues, TKey, TValue>): JSX.Element;
export {};
