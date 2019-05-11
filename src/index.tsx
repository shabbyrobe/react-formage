import * as React from 'react';

type FormContextDef<T=any> = FormActions<T> & {
  readonly bag: FormBag<T>;
  readonly validate?: FormValidator<T>;
  updateBag(values: T, touched: FormTouched<T>, shouldValidate: boolean): FormBag<T>;
};

const FormContext = React.createContext<FormContextDef>(null as any);
const FormConsumer = FormContext.Consumer;

export type FormUpdateEvent<TValues> = {
  readonly bag: FormBag<TValues>;
  readonly name: keyof TValues;
}


export type FormErrors<TValues, TKey = keyof TValues> = {
  // This used to be a clever conditional type, switching to a nested
  // FormErrors if the equivalent key in TValues was an object, but this
  // presumes that fields only emit primitives, which is not the case
  // for something like react-select. Anything could emit anything and
  // we can't tell here whether that's a subform or simply a value.
  -readonly [TKey in keyof TValues]?:
    FormErrors<TValues[TKey], TKey> |
    string
};

export type FormTouched<TValues, TKey = keyof TValues> = {
  -readonly [TKey in keyof TValues]?: 
    FormTouched<TValues[TKey], TKey> |
    boolean
};


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
  const valid = isValid(errors);
  const touched = touchAll(errors, { ...bag.touched});

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

  public updateBag = (values: TValues, touched: FormTouched<TValues>, shouldValidate: boolean): FormBag<TValues> => {
    const { bag } = this.props;

    let errors = bag.errors;
    let valid = bag.valid;
    if (shouldValidate && this.props.validate) {
      errors = this.props.validate(values);
      valid = Object.keys(errors).length === 0;
    }

    const updated = { errors, touched, valid, values };
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
    const { handleBlur, handleChange, setFieldValue, setFieldTouched, updateBag } = this;
    const ctx: FormContextDef<any> = { 
      bag: this.props.bag,
      validate: this.props.validate,
      handleBlur: handleBlur as any,
      handleChange: handleChange as any,
      setFieldValue,
      setFieldTouched,
      updateBag,
    };

    return <FormContext.Provider value={ctx}>{this.props.children}</FormContext.Provider>;
  }
}

type SubFormProps<TParentValues, TKey> = {
  readonly name: TKey;
  readonly validateOnChange?: boolean;
  readonly validateOnBlur?: boolean;
};

export class SubForm<
  TParentValues = any,
  TKey extends keyof TParentValues = any,
  TValues extends TParentValues[TKey] = TParentValues[TKey],
> extends React.Component<SubFormProps<TParentValues, TKey>> {

  public static defaultProps: Partial<SubFormProps<any, any>> = {
    validateOnChange: true,
    validateOnBlur: true,
  };

  public static contextType: React.Context<FormContextDef> = FormContext;
  public context!: FormContextDef<TParentValues>;

  public updateBag = (values: TValues, touched: FormTouched<TValues>, shouldValidate: boolean): FormBag<TValues> => {
    const updated = this.context.updateBag(
      { ...this.context.bag.values, [this.props.name]: values },
      { ...this.context.bag.touched, [this.props.name]: touched },
      shouldValidate,
    );

    return {
      valid: updated.valid,
      errors: updated.errors[this.props.name],
      touched: updated.touched[this.props.name],
      values: updated.values[this.props.name],
    } as any;
  }

  private setFieldValue(name: keyof TValues, value: any, shouldValidate: boolean): FormBag<TValues> {
    const newValues: TValues = { ...this.context.bag.values[this.props.name], [name]: value } as any;
    return this.updateBag(newValues, this.context.bag.touched[this.props.name] as any, shouldValidate);
  }

  private setFieldTouched(name: keyof TValues): FormBag<TValues> {
    const newTouched  = { ...this.context.bag.touched[this.props.name], [name]: true } as any;
    return this.updateBag(this.context.bag.values[this.props.name] as any, newTouched as any, false);
  }

  private handleChange = (name: keyof TValues, value: any) => {
    this.setFieldValue(name, value, !!this.props.validateOnChange);
  }

  private handleBlur = (name: keyof TValues) => {
    const touched = this.context.bag.touched[this.props.name];
    const values = this.context.bag.values[this.props.name];
    const newTouched = { ...touched, [name]: true } as any;
    return this.updateBag(values as any, newTouched as any, !!this.props.validateOnBlur);
  }

  public render() {
    const { handleBlur, handleChange, setFieldValue, setFieldTouched, updateBag } = this;
    const ctx: FormContextDef<any> = { 
      bag: {
        valid: true,
        errors: this.context.bag.errors[this.props.name] || {} as any,
        touched: this.context.bag.touched[this.props.name] || {} as any,
        values: this.context.bag.values[this.props.name] || {},
      },
      handleBlur: handleBlur as any,
      handleChange: handleChange as any,
      setFieldValue,
      setFieldTouched,
      updateBag,
    };

    return <FormContext.Provider value={ctx as any}>{this.props.children}</FormContext.Provider>;
  }
}

// FieldErrorComponentProps are passed in to the component rendered by a FieldError.
export type FieldErrorComponentProps<TValues> = React.PropsWithChildren<{
  readonly touched: boolean;
  readonly message: string;
}>;

type FieldErrorProps<TValues> = Styleable & {
  readonly name: keyof TValues;

  /** Optional component to use instead of a <div> */
  readonly component?: React.ComponentType<FieldErrorComponentProps<TValues>>;

  /** By default, FieldError is rendered even if there is no message so you can
    * set a fixed height and expect your layout to be preserved. Set this to true
    * if you don't want an element in the DOM even if there is no message. */
  readonly hideIfEmpty?: boolean;
};

export class FieldError<TValues=any> extends React.Component<FieldErrorProps<TValues>> {
  public static contextType: React.Context<FormContextDef> = FormContext;
  public context!: FormContextDef<TValues>;

  public render() {
    const { component, hideIfEmpty, name, ...props } = this.props;

    const touched = !!this.context.bag.touched[name];
    const message = (touched && this.context.bag.errors[name]) || '';
    if (typeof message !== 'string') {
      throw new Error(); // FIXME: improve error
    }
    if (!message && hideIfEmpty) {
      return null;
    }

    if (component) {
      return React.createElement(component, { touched, message: message! });
    } else {
      return React.createElement('div', props, message);
    }
  }
}

type Styleable = {
  /** 'className' is ignored if 'component' is used */
  readonly className?: string;

  /** 'style' is ignored if 'component' is used */
  readonly style?: React.CSSProperties;
};

// FieldBaseProps is needed so we can derive without styling.
type FieldBaseProps<TValues, TKey extends keyof TValues, TValue extends TValues[TKey]> =
  FieldRenderProps<TValues, TValue> &
  {
    readonly name: TKey;

    /** If component is set to 'input', 'type' is used for the input type, i.e.
     *  'checkbox', 'radio', etc. */
    readonly type?: 'text' | 'number' | 'radio' | 'checkbox' | string;
  };

type FieldRenderProps<TValues, TValue> = 
  { readonly render: ((props: FieldComponentProps<TValues, TValue>) => React.ReactNode) } |
  {
    readonly component?: 'input' | 'textarea' | 'select';
    readonly disabled?: boolean;
  }
;

type FieldProps<TValues, TKey extends keyof TValues, TValue extends TValues[TKey]> =
  Styleable & FieldBaseProps<TValues, TKey, TValue>;

export type FieldComponentProps<TValues, TValue> = React.PropsWithChildren<{
  readonly value: TValue;
  readonly change: (value: TValue) => void;
  readonly blur: () => void;
  readonly setFieldValue: (name: keyof TValues, value: TValue, shouldValidate: boolean) => FormBag<TValues>;
  readonly setFieldTouched: (name: keyof TValues) => FormBag<TValues>;
}>;


export class Field<TValues=any, TKey extends keyof TValues=any, TValue extends TValues[TKey]=TValues[TKey]>
  extends React.Component<FieldProps<TValues, TKey, TValue>> {

  public static contextType: React.Context<FormContextDef> = FormContext;
  public context!: FormContextDef<TValues>;

  public static defaultProps: Partial<FieldProps<any, any, any>> = {
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

  private renderProps(name: keyof TValues, children?: React.ReactNode): FieldComponentProps<TValues, TValues[typeof name]> {
    return {
      value: this.context.bag.values[name],
      change: (value: TValues[typeof name]) => this.context.handleChange(this.props.name, value),
      blur: () => this.context.handleBlur(this.props.name),
      setFieldValue: this.context.setFieldValue,
      setFieldTouched: this.context.setFieldTouched,
      children,
    };
  }

  public render(): React.ReactNode {
    const { name, children } = this.props;

    if ('render' in this.props) {
      const renderProps = this.renderProps(name, children);
      return this.props.render(renderProps as any);
    }

    if (! ('component' in this.props)) {
      throw new Error('formage: must include render or component prop')
    }
    
    const componentProps: any = {
      ...this.props,
      onChange: this.onChange,
      onBlur: this.onBlur,

      // Without the '', if the key does not exist, react warns about
      // uncontrolled components:
      value: this.context.bag.values[name] || '',
    };

    const { component } = this.props;
    if (this.props.type === 'checkbox' || this.props.type === 'radio') {
      componentProps.checked = this.context.bag.values[name];
    }

    return React.createElement(component as any, componentProps);
  }
}


export type LabelledFieldProps<
  TValues,
  TKey extends keyof TValues,
  TValue extends TValues[TKey],
> = Styleable & FieldBaseProps<TValues, TKey, TValue> & React.PropsWithChildren<{

  readonly label: string;
  readonly errorComponent?: React.ComponentType<FieldErrorComponentProps<TValues>>;
  readonly hideErrorIfEmpty?: boolean;
  readonly errorClassName?: string;
}>;

export function LabelledField<
  TValues = any,
  TKey extends keyof TValues = any,
  TValue extends TValues[TKey] = TValues[TKey],
>(props: LabelledFieldProps<TValues, TKey, TValue>) {

  const { errorClassName, errorComponent, hideErrorIfEmpty, label, ...rest } = props;

  return (
    <div className={props.className} style={props.style}>
      <label>{label}</label>
      <Field<TValues, TKey, TValue> {...rest} />
      <FieldError<TValues>
        name={props.name}
        className={errorClassName}
        component={errorComponent}
        hideIfEmpty={hideErrorIfEmpty}
      />
    </div>
  );
}

function touchAll(errors: any, touched: any): any {
  if (!touched) {
    touched = {};
  }
  for (const key of Object.keys(errors)) {
    if (typeof errors[key] === 'string') {
      touched[key] = true;
    } else {
      touched[key] = touchAll(errors[key], touched[key]);
    }
  }
  return touched;
}

function isValid(errors: any): boolean {
  for (const key of Object.keys(errors)) {
    if (typeof (errors as any)[key] === 'string') {
      return false;
    } else {
      if (!isValid(errors[key])) {
        return false;
      }
    }
  }
  return true;
}
