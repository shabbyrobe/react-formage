import * as React from 'react';
declare type FormContextDef<T = any> = FormActions<T> & {
    readonly bag: FormBag<T>;
    readonly validate?: FormValidator<T>;
    updateBag(values: T, touched: FormTouched<T>, options?: FieldUpdateOptions): FormBag<T>;
};
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
interface FormActions<TValues> {
    handleBlur: (name: keyof TValues) => void;
    handleChange: (name: keyof TValues, value: any) => void;
    handleChangeBag: (name: keyof TValues, value: any, options?: FieldUpdateOptions) => void;
    packBag: (name: keyof TValues, initialValue: any) => FormBag<any>;
    setFieldTouched(name: keyof TValues): FormBag<TValues>;
    setFieldValue(name: keyof TValues, value: any, options?: FieldUpdateOptions): FormBag<TValues>;
}
export declare type FieldUpdateOptions = {
    readonly shouldValidate?: boolean;
};
/** FormData provides a context to one or more Field components, validates the
 *  field values and propagates updates to the parent component. */
export declare class FormData<TValues extends object> extends React.Component<FormProps<TValues>> {
    static defaultProps: {
        validateOnChange: boolean;
        validateOnBlur: boolean;
    };
    updateBag: (values: TValues, touched: FormTouched<TValues, keyof TValues>, options?: FieldUpdateOptions | undefined) => FormBag<TValues>;
    private handleChangeBag;
    private handleChange;
    private handleBlur;
    private packBag;
    private setFieldValue;
    private setFieldTouched;
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
    componentDidMount(): void;
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
