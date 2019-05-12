import * as React from 'react';

type FormContextDef<T=any> = FormActions<T> & {
  readonly bag: FormBag<T>;
  readonly validate?: FormValidator<T>;
  updateBag(values: T, touched: FormTouched<T>, options?: FieldUpdateOptions): FormBag<T>;
};

const FormContext = React.createContext<FormContextDef>(null as any);
const FormConsumer = FormContext.Consumer;

export type FormUpdateEvent<TValues> = {
  readonly bag: FormBag<TValues>;
  readonly name: keyof TValues;
}


export type FormErrors<TValues, TKey = keyof TValues> = {
  // This used to be a clever conditional type, switching to a nested FormErrors if the
  // equivalent key in TValues was an object. This presumes that fields only emit
  // primitives, which is not the case for something like react-select. Anything could
  // emit anything and we can't tell here whether that's a subform or simply a value.
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

export type FieldUpdateOptions = {
  readonly shouldValidate?: boolean;
};

const optionsNoValidate: FieldUpdateOptions = { shouldValidate: false };

/** FormData provides a context to one or more Field components, validates the
 *  field values and propagates updates to the parent component. */
export class FormData<TValues extends object> extends React.Component<FormProps<TValues>> {
  public static defaultProps = {
    validateOnChange: true,
    validateOnBlur: true,
  };

  public updateBag = (values: TValues, touched: FormTouched<TValues>, options?: FieldUpdateOptions): FormBag<TValues> => {
    const { bag } = this.props;
    const shouldValidate = options ? !!options.shouldValidate : false;

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

  private handleChangeBag = (name: keyof TValues, childBag: FormBag<TValues[typeof name]>, options?: FieldUpdateOptions) => {
    const { bag } = this.props;

    const shouldValidate = (options && options.shouldValidate) || true;

    const values = { ...bag.values, [name]: childBag.values };
    const touched = { ...bag.touched, [name]: childBag.touched };

    let valid = bag.valid && childBag.valid;
    let errors: typeof bag.errors = { ...bag.errors, [name]: childBag.errors };
    if (shouldValidate && this.props.validate) {
      errors = this.props.validate(values);
      valid = Object.keys(errors).length === 0;
    }

    const updated = { errors, touched, valid, values };
    this.props.onUpdate({ name, bag: updated });
    return updated;
  }

  private handleChange = (name: keyof TValues, value: any) => {
    this.setFieldValue(name, value, { shouldValidate: !!this.props.validateOnChange });
  }

  private handleBlur = (name: keyof TValues) => {
    const { bag } = this.props;
    const { touched, values } = this.props.bag;
    const newTouched = { ...touched, [name]: true };
    return this.updateBag(values, newTouched, { shouldValidate: !!this.props.validateOnBlur });
  }

  private packBag = (name: keyof TValues, initialValue: TValues[typeof name]): FormBag<TValues[typeof name]> => {
    const { bag } = this.props;
    const childBag = {
      errors: bag.errors[name] || {},
      touched: bag.touched[name] || {},
      values: bag.values[name] || initialValue,

      // FIXME: valid may need to be removed from bag; there are too many corner cases
      // around initial value
      valid: bag.valid,
    } as FormBag<any>;

    return childBag;
  }

  private setFieldValue(name: keyof TValues, value: any, options?: FieldUpdateOptions): FormBag<TValues> {
    const { bag } = this.props;
    const newValues = { ...bag.values, [name]: value };
    return this.updateBag(newValues, bag.touched, options);
  }

  private setFieldTouched(name: keyof TValues): FormBag<TValues> {
    const { bag } = this.props;
    const newTouched = { ...bag.touched, [name]: true };
    return this.updateBag(bag.values, newTouched, optionsNoValidate);
  }

  public render() {
    if (!this.props.bag) {
      throw new Error('Missing bag prop in <FormData> component');
    }

    const ctx: FormContextDef<any> = { 
      bag: this.props.bag,
      handleBlur: this.handleBlur as any,
      handleChange: this.handleChange as any,
      handleChangeBag: this.handleChangeBag as any,
      packBag: this.packBag as any,
      setFieldTouched: this.setFieldTouched,
      setFieldValue: this.setFieldValue,
      updateBag: this.updateBag,
      validate: this.props.validate,
    };

    return <FormContext.Provider value={ctx}>{this.props.children}</FormContext.Provider>;
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
//
// XXX: NonNullable is required as TypeScript 3.4 is unable to infer that TValues[TKey]
// will never be undefined if TKey is valid.
type FieldBaseProps<TValues, TKey extends keyof TValues, TValue extends NonNullable<TValues[TKey]>> =
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

type FieldProps<TValues, TKey extends keyof TValues, TValue extends NonNullable<TValues[TKey]>> =
  Styleable & FieldBaseProps<TValues, TKey, TValue>;

export type FieldComponentProps<TValues, TValue> = React.PropsWithChildren<{
  readonly value: TValue;
  readonly change: (value: TValue) => void;
  readonly changeBag: (value: FormBag<TValue>, options?: FieldUpdateOptions) => void;
  readonly packBag: (initialValue: TValue) => FormBag<TValue>;
  readonly blur: () => void;
  readonly setFieldValue: (name: keyof TValues, value: TValue, options?: FieldUpdateOptions) => FormBag<TValues>;
  readonly setFieldTouched: (name: keyof TValues) => FormBag<TValues>;
}>;


export class Field<
  TValues=any,
  TKey extends keyof TValues=any,
  TValue extends NonNullable<TValues[TKey]> = NonNullable<TValues[TKey]>,
>
  extends React.Component<FieldProps<TValues, TKey, TValue>> {

  public static contextType: React.Context<FormContextDef> = FormContext;
  public context!: FormContextDef<TValues>;

  public static defaultProps = {
    component: 'input',
  };

  public componentDidMount() {
    if (!this.context) {
      throw new Error('<Field> is not contained within a <FormData> component');
    }
  }

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
      // {{{
      // FIXME: these don't need to be created on every render, they only depend on 'name':
      blur: () => this.context.handleBlur(this.props.name),
      change: (value: TValues[typeof name]) => this.context.handleChange(this.props.name, value),
      changeBag: (value: FormBag<TValues[typeof name]>, options?: FieldUpdateOptions) => this.context.handleChangeBag(this.props.name, value, options),
      packBag: (initial: TValues[typeof name]) => this.context.packBag(this.props.name, initial),
      // }}}

      children,
      setFieldTouched: this.context.setFieldTouched,
      setFieldValue: this.context.setFieldValue,
      value: this.context.bag.values[name],
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
  TValue extends NonNullable<TValues[TKey]>,
> = Styleable & FieldBaseProps<TValues, TKey, TValue> & React.PropsWithChildren<{

  readonly label: string;
  readonly errorComponent?: React.ComponentType<FieldErrorComponentProps<TValues>>;
  readonly hideErrorIfEmpty?: boolean;
  readonly errorClassName?: string;
}>;

export function LabelledField<
  TValues = any,
  TKey extends keyof TValues = any,
  TValue extends NonNullable<TValues[TKey]> = NonNullable<TValues[TKey]>,
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
