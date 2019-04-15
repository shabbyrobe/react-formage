import * as React from 'react';
import Select from 'react-select';

import { createFormBag, Field, FieldError, FormBag, FormData, FormErrors, FormUpdateEvent, validateFormBag } from 'react-formage';

type Props = {};

type Values = { [key: string]: string };

type State = {
  readonly bag: FormBag<Values>;
  readonly inputs: number;
  readonly inputsText: string;
};

const defaultInputs = 100;

export class LotsaInputsExample extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      bag: createFormBag({}),
      inputs: defaultInputs,
      inputsText: defaultInputs + '',
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
    for (let i = 0; i < this.state.inputs; i++) {
      const key = 'field'+i;
      if (!values['field'+i]) {
        errors[key] = `${key} must be set`;
      }
    }
    return errors;
  };

  public render() {
    const { errors, touched } = this.state.bag;

    return (
      <form noValidate onSubmit={this.onSubmit}>
        <FormData bag={this.state.bag} onUpdate={this.onFormUpdate} validate={this.validate}>
          <h1>Lotsa Inputs</h1>

          <div>
            <label>Inputs</label>
            <input value={this.state.inputsText} onChange={(e) => {
              const inputs = Number(e.currentTarget.value);
              this.setState({
                inputs: isNaN(inputs) ? this.state.inputs : inputs,
                inputsText: e.currentTarget.value,
              })
            }} />
          </div>
          
          <hr />
          <button type="submit">Submit</button>
            
          {Array.from({length: this.state.inputs}, (x,i) => (
            <div key={i}>
              <label>{`field${i}`}</label>
              <Field<Values> name={`field${i}`} />
              <FieldError<Values> name={`field${i}`} className='error' />
            </div>
          ))}

          <button onClick={this.onSubmit}>Submit</button>

          <div style={{ margin: '30px 0px' }}>
            <textarea readOnly={true} style={{ width: '100%', height: '200px' }}
              value={JSON.stringify(this.state.bag.values, undefined, 2)} />
          </div>

        </FormData>
      </form>
    );
  }
}
