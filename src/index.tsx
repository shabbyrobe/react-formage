import * as React from 'react';

type FormContextDef<T={}> = FormActions<T> & {
  readonly bag: FormBag<T>
};

const FormContext = React.createContext<FormContextDef>({
  bag: createFormBag<any>({}),
  handleChange: () => {},
  handleBlur: () => {},
  setFieldValue: () => { return createFormBag<any>({}); },
  setFieldTouched: () => { return createFormBag<any>({}); },
});

const FormConsumer = FormContext.Consumer;

export type FormUpdateEvent<TValues> = {
  readonly bag: FormBag<TValues>;
  readonly name: keyof TValues;
}

export type FormErrors<TValues> = { -readonly [K in keyof TValues]?: string };
export type FormTouched<TValues> = { -readonly [K in keyof TValues]?: boolean };

export type FormBag<TValues> = {
  readonly errors: FormErrors<TValues>;
  readonly touched: FormTouched<TValues>;
  readonly valid: boolean;
  readonly values: TValues;
};

export function createFormBag<TValues>(
  values: TValues,
  options?: { initialValid?: boolean; }
): FormBag<TValues> {

  return {
    errors: {},
    touched: {},
    valid: (options && options.initialValid !== undefined) ? options.initialValid : false,
    values: values,
  };
}

export function validateFormBag<TValues>(bag: FormBag<TValues>, validator: FormValidator<TValues>): FormBag<TValues> {
  const errors = validator(bag.values);
  const valid = Object.keys(errors).length === 0;

  const touched = { ...bag.touched};
  for (const key of Object.keys(errors)) {
    touched[key as keyof TValues] = true;
  }

  return {
    errors,
    touched,
    valid,
    values: bag.values,
  };
}

export type FormValidator<TValues> = (values: TValues) => FormErrors<TValues>;

type FormProps<TValues> = {
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
export class FormData<TValues extends object> extends React.Component<FormProps<TValues>> {
  public static defaultProps: Partial<FormProps<any>> = {
    validateOnChange: true,
    validateOnBlur: true,
  };

  private updateBag(values: TValues, touched: FormTouched<TValues>, shouldValidate: boolean): FormBag<TValues> {
    const { bag } = this.props;

    let errors = bag.errors;
    let valid = bag.valid;
    if (shouldValidate && this.props.validate) {
      errors = this.props.validate(values);
      valid = Object.keys(errors).length === 0;
    }

    const updated = {
      errors,
      touched,
      valid,
      values,
    };

    this.props.onUpdate({ name, bag: updated });

    return updated;
  }

  private setFieldValue(name: keyof TValues, value: any, shouldValidate: boolean): FormBag<TValues> {
    const { bag } = this.props;
    const newValues = { ...bag.values, [name]: value };
    return this.updateBag(newValues, bag.touched, shouldValidate);
  }

  private setFieldTouched(name: keyof TValues): FormBag<TValues> {
    const { bag } = this.props;
    const newTouched = { ...bag.touched, [name]: true };
    return this.updateBag(bag.values, newTouched, false);
  }

  private handleChange = (name: keyof TValues, value: any) => {
    this.setFieldValue(name, value, !!this.props.validateOnChange);
  }

  private handleBlur = (name: keyof TValues) => {
    const { bag } = this.props;
    const { touched, values } = this.props.bag;
    const newTouched = { ...touched, [name]: true };
    return this.updateBag(values, newTouched, !!this.props.validateOnBlur);
  }

  public render() {
    const { handleBlur, handleChange, setFieldValue, setFieldTouched } = this;
    const ctx = { 
      bag: this.props.bag,
      handleBlur,
      handleChange,
      setFieldValue,
      setFieldTouched,
    };

    return (
      <FormContext.Provider value={ctx}>
        {this.props.children}
      </FormContext.Provider>
    )
  }
}

export type FieldErrorComponentProps<TValues=any> = React.PropsWithChildren<{
  readonly touched: boolean;
  readonly message: string;
}>;

type FieldErrorProps<TValues=any> = Styleable & {
  readonly name: keyof TValues;

  /** Optional component to use instead of a <div> */
  readonly component?: React.ComponentType<FieldErrorComponentProps<TValues>>;
};

export class FieldError<TValues=object> extends React.Component<FieldErrorProps<TValues>> {
  public static contextType: React.Context<FormContextDef> = FormContext;
  public context!: FormContextDef<TValues>;

  public render() {
    const { component, name, ...props } = this.props;

    const touched = !!this.context.bag.touched[name];
    const message = this.context.bag.errors[name];
    if (!touched || !message) {
      return null;
    }

    if (component) {
      return React.createElement(component, { touched, message: message! });
    } else {
      return <div {...props}>{message}</div>;
    }
  }
}

type Styleable = {
  /** 'className' is ignored if 'component' is used */
  readonly className?: string;

  /** 'style' is ignored if 'component' is used */
  readonly style?: React.CSSProperties;
};

type FieldProps<TValues=any> = Styleable & FieldRenderProps<TValues> & {
  readonly name: keyof TValues;

  /** If component is set to 'input', 'type' is used for the input type, i.e.
   *  'checkbox', 'radio', etc. */
  readonly type?: 'text' | 'number' | 'radio' | 'checkbox' | string;
};

type FieldRenderProps<TValues> = 
  { readonly render: ((props: FieldComponentProps<TValues>) => React.ReactNode) } |
  {
    readonly component?: 'input' | 'textarea' | 'select';
    readonly disabled?: boolean;
  }
;

export type FieldComponentProps<TValues=any, TValue=any> = React.PropsWithChildren<{
  readonly value: TValue;
  readonly change: (value: TValue) => void;
  readonly blur: () => void;
  readonly setFieldValue: (name: keyof TValues, value: TValue, shouldValidate: boolean) => FormBag<TValues>;
  readonly setFieldTouched: (name: keyof TValues) => FormBag<TValues>;
}>;

export class Field<TValues=object> extends React.Component<FieldProps<TValues>> {
  public static contextType: React.Context<FormContextDef> = FormContext;
  public context!: FormContextDef<TValues>;

  public static defaultProps: Partial<FieldProps<any>> = {
    component: 'input',
  };

  private onChange = (e: any) => {
    this.context.handleChange(this.props.name, this.extractValue(e.target));
  };

  private onBlur = (e: any) => {
    this.context.handleBlur(this.props.name);
  };

  private extractValue(target: HTMLInputElement): any {
    const { type } = this.props;
    if (type === 'checkbox' || type === 'radio') {
      return target.checked;
    }
    return target.value;
  }

  private componentProps(name: keyof TValues, children?: React.ReactNode): FieldComponentProps<TValues> {
    return {
      value: this.context.bag.values[name],
      change: (value: any) => this.context.handleChange(this.props.name, value),
      blur: () => this.context.handleBlur(this.props.name),
      setFieldValue: this.context.setFieldValue,
      setFieldTouched: this.context.setFieldTouched,
      children,
    };
  }

  public render(): React.ReactNode {
    const { name, children, ...props } = this.props;

    if ('render' in this.props) {
      const componentProps = this.componentProps(name, children);
      return this.props.render(componentProps);
    }

    if (! ('component' in this.props)) {
      throw new Error('formage: must include render or component prop')
    }

    const { component, disabled, type } = this.props;
    const extra: any = { disabled, type };
    if (props.type === 'checkbox' || props.type === 'radio') {
      extra.checked = this.context.bag.values[name];
    }

    return React.createElement(component as any, {
      ...props,
      ...extra,
      onChange: this.onChange,
      onBlur: this.onBlur,
      children,

      // Without the '', if the key does not exist, react warns about
      // uncontrolled components:
      value: this.context.bag.values[name] || '',
    });
  }
}
