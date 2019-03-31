import * as React from 'react';
import Select from 'react-select';

import { createFormBag, Field, FieldError, Form, FormBag, FormErrors, FormUpdateEvent, validateFormBag } from 'react-formage';

type Props = {};

type Values = {
  readonly foo: string;
  readonly bar: string;
  readonly baz: string;
  readonly qux: boolean;
  readonly pants: string;
};

type State = {
  readonly bag: FormBag<Values>;
};

const pantsSelectOptions = ['a', 'b', 'c'].map((v) => ({ value: v, label: v }));

export class BasicExample extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      bag: createFormBag({ foo: 'yeps', bar: 'yeppo', baz: 'yeppers', qux: false, pants: 'pants' }),
    };
  }

  private onFormUpdate = (e: FormUpdateEvent<Values>) => {
    this.setState({ bag: e.bag });
  };

  private onSubmit = () => {
    const bag = validateFormBag(this.state.bag, this.validate);
    this.setState({ bag });
    if (bag.valid) {
      alert('Submit OK!');
    }
  };

  private validate = (values: Values): FormErrors<Values> => {
    const errors: FormErrors<Values> = {};

    const required: Array<keyof Values> = ['bar', 'baz', 'pants'];
    for (const key of required) {
      if (!values[key]) {
        errors[key] = 'Value is required';
      }
    }

    if (values.foo !== 'yep') {
      errors.foo = 'Foo must be "yep"';
    }
    if (!pantsSelectOptions.find((v) => v.value === values.pants)) {
      errors.pants = 'Invalid value';
    }
    return errors;
  };

  public render() {
    const { errors, touched } = this.state.bag;

    return (
      <Form bag={this.state.bag} onUpdate={this.onFormUpdate} validate={this.validate}>
        <h1>Silly Form Example</h1>

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
          <label>Baz</label>
          <Field<Values> name="baz" />
          <div className="error">{touched.baz && errors.baz}</div>
        </div>

        <div>
          <label>Qux</label>
          <Field<Values> type="checkbox" name="qux" />
          <div className="error">{touched.qux && errors.qux}</div>
        </div>

        <div>
          <label>Pants</label>
          <Field<Values> name="pants" component={(props) => {
            return (
              <Select 
                options={pantsSelectOptions}
                value={{ label: props.value, value: props.value }}
                onChange={(e) => props.change((e as any).value)}
                onBlur={() => props.blur()}
              />
            );
          }}/>
          <div className="error">{touched.pants && errors.pants}</div>
        </div>

        <div>
          <label>Foo again for some reason</label>
          <Field<Values> name="foo" />
          <div className="error">{touched.foo && errors.foo}</div>
        </div>

        {/* This used to set 'disabled={!this.state.bag.valid}', but that prevents submit from triggering validation of untouched fields */}
        <button onClick={this.onSubmit}>SUBMITTTTTT</button>

        <div style={{ margin: '30px 0px' }}>
          <textarea readOnly={true} style={{ width: '100%', height: '200px' }}
            value={JSON.stringify(this.state.bag.values, undefined, 2)} />
        </div>

      </Form>
    );
  }
}
