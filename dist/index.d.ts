import * as React from 'react';
declare type FormContextDef<T = any> = FormActions<T> & {
    readonly bag: FormBag<T>;
    readonly validate?: FormValidator<T>;
    updateBag(values: T, touched: FormTouched<T>, shouldValidate: boolean): FormBag<T>;
};
export declare type FormUpdateEvent<TValues> = {
    readonly bag: FormBag<TValues>;
    readonly name: keyof TValues;
};
export declare type FormErrors<TValues, TKey = keyof TValues> = {
    -readonly [TKey in keyof TValues]?: TValues[TKey] extends object ? FormErrors<TValues[TKey], TKey> : string;
};
export declare type FormTouched<TValues, TKey = keyof TValues> = {
    -readonly [TKey in keyof TValues]?: TValues[TKey] extends object ? FormTouched<TValues[TKey], TKey> : boolean;
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
    readonly onUpdate: (e: FormUpdateEvent<TValues>) => void;
    readonly validate?: FormValidator<TValues>;
    readonly bag: FormBag<TValues>;
    readonly validateOnChange?: boolean;
    readonly validateOnBlur?: boolean;
};
interface FormActions<TValues> {
    setFieldValue(name: keyof TValues, value: any, shouldValidate: boolean): FormBag<TValues>;
    setFieldTouched(name: keyof TValues): FormBag<TValues>;
    handleChange: (name: keyof TValues, value: any) => void;
    handleBlur: (name: keyof TValues) => void;
}
/** FormData provides a context to one or more Field components, validates the
 *  field values and propagates updates to the parent component. */
export declare class FormData<TValues extends object> extends React.Component<FormProps<TValues>> {
    static defaultProps: Partial<FormProps<any>>;
    updateBag: (values: TValues, touched: FormTouched<TValues, keyof TValues>, shouldValidate: boolean) => FormBag<TValues>;
    private setFieldValue;
    private setFieldTouched;
    private handleChange;
    private handleBlur;
    render(): JSX.Element;
}
declare type SubFormProps<TParentValues> = {
    readonly name: keyof TParentValues;
    readonly validateOnChange?: boolean;
    readonly validateOnBlur?: boolean;
};
export declare class SubForm<TParentValues extends object, TValues extends object> extends React.Component<SubFormProps<TParentValues>> {
    static defaultProps: Partial<SubFormProps<any>>;
    static contextType: React.Context<FormContextDef>;
    context: FormContextDef<TParentValues>;
    updateBag: (values: TValues, touched: FormTouched<TValues, keyof TValues>, shouldValidate: boolean) => FormBag<TValues>;
    private setFieldValue;
    private setFieldTouched;
    private handleChange;
    private handleBlur;
    render(): JSX.Element;
}
export declare type FieldErrorComponentProps<TValues = any> = React.PropsWithChildren<{
    readonly touched: boolean;
    readonly message: string;
}>;
declare type FieldErrorProps<TValues = any> = Styleable & {
    readonly name: keyof TValues;
    /** Optional component to use instead of a <div> */
    readonly component?: React.ComponentType<FieldErrorComponentProps<TValues>>;
    /** By default, FieldError is rendered even if there is no message so you can
      * set a fixed height and expect your layout to be preserved. Set this to true
      * if you don't want an element in the DOM even if there is no message. */
    readonly hideIfEmpty?: boolean;
};
export declare class FieldError<TValues = object> extends React.Component<FieldErrorProps<TValues>> {
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
declare type FieldBaseProps<TValues = any> = FieldRenderProps<TValues> & {
    readonly name: keyof TValues;
    /** If component is set to 'input', 'type' is used for the input type, i.e.
     *  'checkbox', 'radio', etc. */
    readonly type?: 'text' | 'number' | 'radio' | 'checkbox' | string;
};
declare type FieldProps<TValues = any> = Styleable & FieldBaseProps<TValues>;
declare type FieldRenderProps<TValues> = {
    readonly render: ((props: FieldComponentProps<TValues>) => React.ReactNode);
} | {
    readonly component?: 'input' | 'textarea' | 'select';
    readonly disabled?: boolean;
};
export declare type FieldComponentProps<TValues = any, TValue = any> = React.PropsWithChildren<{
    readonly value: TValue;
    readonly change: (value: TValue) => void;
    readonly blur: () => void;
    readonly setFieldValue: (name: keyof TValues, value: TValue, shouldValidate: boolean) => FormBag<TValues>;
    readonly setFieldTouched: (name: keyof TValues) => FormBag<TValues>;
}>;
export declare class Field<TValues = object> extends React.PureComponent<FieldProps<TValues>> {
    static contextType: React.Context<FormContextDef>;
    context: FormContextDef<TValues>;
    static defaultProps: Partial<FieldProps<any>>;
    private onChange;
    private onBlur;
    private extractValue;
    private renderProps;
    render(): React.ReactNode;
}
export declare type LabelledFieldProps<TValues = any> = Styleable & FieldBaseProps<TValues> & {
    readonly label: string;
    readonly errorComponent?: React.ComponentType<FieldErrorComponentProps<TValues>>;
    readonly hideErrorIfEmpty?: boolean;
    readonly errorClassName?: string;
};
export declare function LabelledField<TValues>(props: LabelledFieldProps<TValues>): JSX.Element;
export {};
