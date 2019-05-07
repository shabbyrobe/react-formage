import * as React from 'react';
import Select from 'react-select';

import { createFormBag, Field, FieldError, FormBag, FormData, FormErrors, FormUpdateEvent, validateFormBag } from 'react-formage';

type Props = {};

type Values = {
  readonly foo: string;
  readonly bar: string;
  readonly email: string;
  readonly textarea: string;
  readonly check: boolean;
  readonly reactSelect: string;
  readonly normalSelect: string;
};

type State = {
  readonly bag: FormBag<Values>;
};

const reactSelectOptions = ['a', 'b', 'c'].map((v) => ({ value: v, label: v }));

export class BasicExample extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      bag: createFormBag({
        foo: 'yeps',
        bar: 'yeppo',
        email: '',
        textarea: 'yeppers',
        check: false,
        reactSelect: 'pants',
        normalSelect: 'one',
      }),
    };
  }

  private onFormUpdate = (e: FormUpdateEvent<Values>) => {
    this.setState({ bag: e.bag });
  };

  private onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bag = validateFormBag(this.state.bag, this.validate);
    this.setState({ bag });
    if (bag.valid) {
      alert('Submit OK!');
    }
  };

  private validate = (values: Values): FormErrors<Values> => {
    const errors: FormErrors<Values> = {};

    const required: Array<keyof Values> = ['bar', 'textarea', 'reactSelect'];
    for (const key of required) {
      if (!values[key]) {
        errors[key] = 'Value is required';
      }
    }
    if (values.email.indexOf('@') < 0) {
      errors.email = 'Email invalid';
    }
    if (values.foo !== 'yep') {
      errors.foo = 'Foo must be "yep"';
    }
    if (!reactSelectOptions.find((v) => v.value === values.reactSelect)) {
      errors.reactSelect = 'Invalid value';
    }
    return errors;
  };

  public render() {
    const { errors, touched } = this.state.bag;

    return (
      <form noValidate onSubmit={this.onSubmit}>
        <FormData bag={this.state.bag} onUpdate={this.onFormUpdate} validate={this.validate}>
          <h1>Form Example</h1>

          <div>
            <label>Foo</label>
            <Field<Values> name="foo" />
            <FieldError<Values> name="foo" className="error" />
          </div>

          <div>
            <label>Bar</label>
            <Field<Values> name="bar" />
            <div className="error">{touched.bar && errors.bar}</div>
          </div>

          <div>
            <label>Email</label>
            <Field<Values> name="email" />
            <FieldError<Values> name="email" className="error" />
          </div>

          <div>
            <label>Textarea</label>
            <Field<Values> component="textarea" name="textarea" />
            <div className="error">{touched.textarea && errors.textarea}</div>
          </div>

          <div>
            <label>Check</label>
            <Field<Values> type="checkbox" name="check" />
            <div className="error">{touched.check && errors.check}</div>
          </div>

          <div>
            <label>React Select</label>
            <Field<Values> name="reactSelect" render={(props) => (
              <Select 
                options={reactSelectOptions}
                value={{ label: props.value, value: props.value }}
                onChange={(e) => props.change((e as any).value)}
                onBlur={() => props.blur()}
              />
            )}/>
            <div className="error">{touched.reactSelect && errors.reactSelect}</div>
          </div>

          <div>
            <label>Normal Select</label>
            <Field<Values> component="select" name="normalSelect">
              <option>one</option>
              <option>two</option>
              <option>three</option>
            </Field>
            <FieldError<Values> name="normalSelect" className="error" />
          </div>

          <div>
            <label>Foo again for some reason</label>
            <Field<Values> name="foo" />
            <div className="error">{touched.foo && errors.foo}</div>
          </div>

          {/* This used to set 'disabled={!this.state.bag.valid}', but that prevents submit from triggering validation of untouched fields */}
          <button onClick={this.onSubmit}>SUBMIT</button>

          <div style={{ margin: '30px 0px' }}>
            <textarea readOnly={true} style={{ width: '100%', height: '200px' }}
              value={JSON.stringify(this.state.bag.values, undefined, 2)} />
          </div>

        </FormData>
      </form>
    );
  }
}
