import * as React from 'react';

import { createFormBag, Field, FieldError, FormBag, FormData, FormErrors, FormUpdateEvent, LabelledField, validateFormBag } from 'react-formage';

type Props = {};

type ChildValues = {
  readonly baz: string;
  readonly qux: string;
};

type Values = {
  readonly foo: string;
  readonly bar: string;

  // Included to make sure the typing doesn't inhibit an object to be treated
  // as a single field:
  readonly objField: { value: string };

  readonly childValues?: ChildValues | undefined;
};

type State = {
  readonly bag: FormBag<Values>;
};

export class NestedSubformExample extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      bag: createFormBag({
        foo: 'yeps',
        bar: 'yeppo',
        objField: { value: '' },
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
    const errors: FormErrors<Values> = {};

    if (!values.foo) { errors.foo = 'foo? nah'; }
    if (!values.bar) { errors.bar = 'bar? nah'; }
    if (!values.objField.value.trim()) {
      errors.objField = 'objField is required';
    }

    errors.childValues = {};
    if (!values.childValues || !values.childValues.baz) { errors.childValues.baz = 'baz? nah'; }
    if (!values.childValues || !values.childValues.qux) { errors.childValues.qux = 'qux? nah'; }

    return errors;
  };

  public render() {
    const { errors, touched } = this.state.bag;

    return (
      <form noValidate onSubmit={this.onSubmit}>
        <FormData bag={this.state.bag} onUpdate={this.onFormUpdate} validate={this.validate}>
          <h1>Nested Subform</h1>

          <LabelledField<Values, 'foo'> label='Foo' name='foo' errorClassName='error' />
          <LabelledField<Values, 'bar'> label='Bar' name='bar' errorClassName='error' />

          <LabelledField<Values, 'objField'>
            label="ObjField"
            name="objField"
            errorClassName="error"
            render={(props) => (
              <input value={props.value.value} onBlur={props.blur}
                onChange={(e) => props.change({ value: e.target.value })}
              />
            )}
          />

          <label>Child Values</label>
          <Field<Values, "childValues"> name="childValues" render={(props) => (
            <FormData<ChildValues> bag={props.packBag({ baz: '', qux: '' })} onUpdate={(e) => props.changeBag(e.bag)}>
              <LabelledField<ChildValues, 'baz'> label='Baz' name='baz' errorClassName='error' />
              <LabelledField<ChildValues, 'qux'> label='Qux' name='qux' errorClassName='error' />
            </FormData>
          )} />

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
