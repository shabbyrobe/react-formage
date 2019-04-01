import * as React from 'react';

type FormContextDef<T={}> = FormActions<T> & {
  readonly bag: FormBag<T>
};

const FormContext = React.createContext<FormContextDef>({
  bag: createFormBag<any>({}),
  handleChange: () => {},
  handleBlur: () => {},
  setFieldValue: () => { return createFormBag<any>({}); },
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

export function createFormBag<TValues>(values: TValues): FormBag<TValues> {
  return { errors: {}, touched: {}, valid: true, values: values };
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
    touched: touched,
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
  handleChange: (name: keyof TValues, value: any) => void;
  handleBlur: (name: keyof TValues) => void;
}

export class Form<TValues extends object> extends React.Component<FormProps<TValues>> {
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
    const { touched, values } = this.props.bag;
    const newValues = { ...values, [name]: value };
    const newTouched = { ...touched, [name]: true };
    return this.updateBag(newValues, newTouched, shouldValidate);
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
    const { handleBlur, handleChange, setFieldValue } = this;
    const ctx = { 
      bag: this.props.bag,
      handleBlur,
      handleChange,
      setFieldValue,
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

type FieldProps<TValues=any> = Styleable & {
  readonly name: keyof TValues;

  /**
   * If component is set to 'input', 'type' is used for the input type, i.e.
   * 'checkbox', 'radio', etc.
   */
  readonly type?: 'text' | 'number' | 'radio' | 'checkbox' | string;

  readonly component?: 'input' | 'textarea' | 'select'
    | React.ComponentType<FieldComponentProps<TValues>>;
};

export type FieldComponentProps<TValues=any, TValue=any> = React.PropsWithChildren<{
  readonly value: TValue;
  readonly change: (value: TValue) => void;
  readonly blur: () => void;
  readonly setFieldValue: (name: keyof TValues, value: TValue, shouldValidate: boolean) => FormBag<TValues>;
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
    const { component, type } = this.props;
    if (type === 'checkbox' || type === 'radio') {
      return target.checked;
    }
    return target.value;
  }

  public render(): React.ReactNode {
    const { component, name, children, ...props } = this.props;

    let extra = {};

    if (typeof component === 'string' || component instanceof String) {
      if (props.type === 'checkbox' || props.type === 'radio') {
        extra = { type: props.type, checked: this.context.bag.values[name] };
      } else if (props.type) {
        extra = { type: props.type };
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

    } else {
      const componentProps: FieldComponentProps<TValues> = {
        value: this.context.bag.values[name],
        change: (value: any) => this.context.handleChange(this.props.name, value),
        blur: () => this.context.handleBlur(this.props.name),
        setFieldValue: this.context.setFieldValue,
        children,
      };
      return React.createElement(component as any, componentProps);
    }
  }
}

