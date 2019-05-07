import * as React from 'react';

import { createFormBag, Field, FieldError, FormBag, FormData, FormErrors, FormUpdateEvent, SubForm, validateFormBag } from 'react-formage';

type Props = {};

type ChildValues = {
  readonly baz: string;
  readonly qux: string;
};

type Values = {
  readonly foo: string;
  readonly bar: string;
  readonly childValues?: ChildValues | undefined;
};

type State = {
  readonly bag: FormBag<Values>;
};

export class NestedObjectExample extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      bag: createFormBag({
        foo: 'yeps',
        bar: 'yeppo',
        childValues: undefined,
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
    // const errors: FormErrors<Values> = {};
    const errors: any = {}

    if (!values.foo) { errors.foo = 'foo? nah'; }
    if (!values.bar) { errors.bar = 'bar? nah'; }

    if (!errors.childValues) {
      errors.childValues = {};
    }

    if (!values.childValues || !values.childValues.baz) { errors.childValues.baz = 'baz? nah'; }
    if (!values.childValues || !values.childValues.qux) { errors.childValues.qux = 'qux? nah'; }

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
            <FieldError<Values> name="foo" />
          </div>

          <div>
            <label>Bar</label>
            <Field<Values> name="bar" />
            <FieldError<Values> name="bar" />
          </div>

          <label>Child Values</label>
          <SubForm name="childValues">
            <div>
              <label>Baz</label>
              <Field<ChildValues> name="baz" />
              <FieldError<ChildValues> name="baz" />
            </div>

            <div>
              <label>Qux</label>
              <Field<ChildValues> name="qux" />
              <FieldError<ChildValues> name="qux" />
            </div>
          </SubForm>

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
