import * as React from 'react';
import Select from 'react-select';

import * as formage from 'react-formage';

type Props = {};

type Values = {
  readonly foo: string;
  readonly bar: string;
};

type State = {
  readonly bag: formage.FormBag<Values>;
};

export class FieldLayoutExample extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      bag: formage.createFormBag({ foo: '', bar: '' }),
    };
  }

  private onFormUpdate = (e: formage.FormUpdateEvent<Values>) => {
    this.setState({ bag: e.bag });
  };

  private onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bag = formage.validateFormBag(this.state.bag, this.validate);
    this.setState({ bag });
    if (bag.valid) {
      alert('Submit OK!');
    }
  };

  private validate = (values: Values): formage.FormErrors<Values> => {
    const errors: formage.FormErrors<Values> = {};
    if (!values.foo.trim()) {
      errors.foo = 'Foo is required';
    }
    if (!values.bar.trim()) {
      errors.bar = 'Bar is required';
    }
    return errors;
  };

  public render() {
    const { errors, touched } = this.state.bag;

    return (
      <form noValidate onSubmit={this.onSubmit}>
        <formage.FormData bag={this.state.bag} onUpdate={this.onFormUpdate} validate={this.validate}>
          <h1>Reusable Field Layout</h1>

          <p>
            This pattern shows how easy it is to condense some of the boilerplate and repetition
            into a reusable layout component. These are not included with formage as they are
            very project-specific.
          </p>

          <pre>{labelledFieldString}</pre>

          <LabelledField<Values, 'foo'> label='Foo' name='foo' />
          <LabelledField<Values, 'bar'> label='Bar' name='bar' />

          <button onClick={this.onSubmit}>SUBMIT</button>

          <div style={{ margin: '30px 0px' }}>
            <textarea readOnly={true} style={{ width: '100%', height: '200px' }}
              value={JSON.stringify(this.state.bag.values, undefined, 2)} />
          </div>

        </formage.FormData>
      </form>
    );
  }
}

// LabelledField provides a custom layout pattern for each field in the form. This is not
// provided by formage because your field layout may be quite different and there isn't a
// generalisation that doesn't involve a boatload of config and corner-cases.
function LabelledField<TValues, TKey extends keyof TValues>(props: { label: string } & formage.FieldProps<TValues, TKey>) {
  const { label, ...rest } = props;
  return (
    <div>
      <label>{props.label}</label>
      <formage.Field<TValues, TKey> {...rest} />
      <formage.FieldError<TValues> name={props.name} className='error' />
    </div>
  );
}

const labelledFieldString = `
function LabelledField<TValues, TKey extends keyof TValues>
 (props: { label: string } & formage.FieldProps<TValues, TKey>) {

 const { label, ...rest } = props;
 return (
   <div>
     <label>{props.label}</label>
     <formage.Field<TValues, TKey> {...rest} />
     <formage.FieldError<TValues> name={props.name} className='error' />
   </div>
 );
}
`;

