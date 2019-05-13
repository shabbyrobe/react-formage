import * as React from 'react';
import Select from 'react-select';

import { createFormBag, Field, FieldError, FieldProps, FormBag, FormData, FormErrors, FormUpdateEvent, validateFormBag } from 'react-formage';

type Props = {};

type Values = {
  readonly foo: string;
  readonly bar: string;
  readonly email: string;
  readonly multiline: string;
  readonly check: boolean;
  readonly normalSelect: string;
};

type State = {
  readonly bag: FormBag<Values>;
};

export class BasicExample extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      bag: createFormBag({
        foo: 'yeps',
        bar: 'yeppo',
        email: '',
        multiline: 'yeppers',
        check: false,
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

    const required: Array<keyof Values> = ['bar', 'multiline'];
    for (const key of required) {
      if (!values[key]) {
        errors[key] = 'Value is required';
      }
    }
    if (values.email.indexOf('@') < 0) {
      errors.email = 'Email invalid';
    }
    if (values.foo !== 'yep') {
      errors.foo = 'Foo must contain the string "yep"';
    }
    return errors;
  };

  public render() {
    const { errors, touched } = this.state.bag;

    return (
      <form noValidate onSubmit={this.onSubmit}>
        <FormData bag={this.state.bag} onUpdate={this.onFormUpdate} validate={this.validate}>
          <h1>Basic Input Types</h1>

          <div>
            <label>Foo</label>
            <Field<Values, 'foo'> name='foo' />
            <FieldError<Values> name='foo' className='error' />
          </div>

          <div>
            <label>Bar</label>
            <Field<Values, 'bar'> name='bar' />

            {/* <FieldError> is basically just this: */}
            <div className='error'>{touched.bar && errors.bar}</div>
          </div>

          <div>
            <label>Email</label>
            <Field<Values, 'email'> name='email' />
            <FieldError<Values> name='email' className='error' />
          </div>

          <div>
            <label>Multiline</label>
            <Field<Values, 'multiline'> name='multiline' component='textarea' />
            <FieldError<Values> name='multiline' className='error' />
          </div>

          <div>
            <label>Check</label>
            <Field<Values, 'check'> type='checkbox' name='check' />
            <FieldError<Values> name='check' className='error' />
          </div>

          <div>
            <label>Normal Select</label>
            <Field<Values, 'normalSelect'> name='normalSelect' component='select'>
              <option>one</option>
              <option>two</option>
              <option>three</option>
            </Field>
            <FieldError<Values> name='normalSelect' className='error' />
          </div>

          <div>
            <label>Foo again for some reason</label>
            <Field<Values, 'foo'> name='foo' />
            <FieldError<Values> name='foo' className='error' />
          </div>

          {/* This used to set 'disabled={!this.state.bag.valid}', but that prevents 
              submit from triggering validation of untouched fields */}
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
