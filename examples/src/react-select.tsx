import * as React from 'react';
import Select from 'react-select';

import { createFormBag, Field, FieldError, FormBag, FormData, FormErrors, FormUpdateEvent, validateFormBag } from 'react-formage';

type Props = {};

type Values = {
  readonly withInitialEmpty: string;
  readonly withInitialInvalid: string;
  readonly withInitialValid: string;
};

type State = {
  readonly bag: FormBag<Values>;
};

const reactSelectOptions = ['a', 'b', 'c'].map((v) => ({ value: v, label: v }));

export class ReactSelectExample extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      bag: createFormBag({
        withInitialEmpty: '',
        withInitialInvalid: 'pants',
        withInitialValid: 'a',
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

    const required: Array<keyof Values> = ['withInitialEmpty', 'withInitialInvalid', 'withInitialValid'];
    for (const key of required) {
      if (!values[key]) {
        errors[key] = 'Value is required';
      } else if (!reactSelectOptions.find((v) => v.value === values[key])) {
        errors[key] = 'Invalid value';
      }
    }
    return errors;
  };

  public render() {
    const { errors, touched } = this.state.bag;

    return (
      <form noValidate onSubmit={this.onSubmit}>
        <FormData bag={this.state.bag} onUpdate={this.onFormUpdate} validate={this.validate}>
          <h1>React Select Examples</h1>

          <div>
            <label>Initially empty</label>
            <Field<Values, 'withInitialEmpty'>
              name='withInitialEmpty'
              render={(props) => (
                <Select 
                  options={reactSelectOptions}
                  value={{ label: props.value, value: props.value }}
                  onChange={(e) => props.change((e as any).value)}
                  onBlur={() => props.blur()}
                />
              )}
            />
            <FieldError<Values> name='withInitialEmpty' />
          </div>

          <div>
            <label>Initially invalid</label>
            <Field<Values, 'withInitialInvalid'>
              name='withInitialInvalid'
              render={(props) => (
                <Select 
                  options={reactSelectOptions}
                  value={{ label: props.value, value: props.value }}
                  onChange={(e) => props.change((e as any).value)}
                  onBlur={() => props.blur()}
                />
              )}
            />
            <FieldError<Values> name='withInitialInvalid' />
          </div>

          <div>
            <label>Initially valid</label>
            <Field<Values, 'withInitialValid'>
              name='withInitialValid'
              render={(props) => (
                <Select 
                  options={reactSelectOptions}
                  value={{ label: props.value, value: props.value }}
                  onChange={(e) => props.change((e as any).value)}
                  onBlur={() => props.blur()}
                />
              )}
            />
            <FieldError<Values> name='withInitialValid' />
          </div>

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
