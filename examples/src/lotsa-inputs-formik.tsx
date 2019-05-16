import { ErrorMessage, FastField, Field, Formik, FormikActions, Form } from 'formik';
import * as React from 'react';
import Select from 'react-select';

type Props = {};

type Values = { [key: string]: string };

type State = {
  readonly inputs: number;
  readonly inputsText: string;
  readonly fastField: boolean;
};

const defaultInputs = 100;

export class LotsaInputsFormikExample extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      inputs: defaultInputs,
      inputsText: defaultInputs + '',
      fastField: true,
    };
  }

  private onSubmit = async (values: Values, formikActions: FormikActions<Values>) => {
    const errors = await formikActions.validateForm(values);
    if (!errors) {
      alert('Submit OK!');
    }
    return;
  };

  private validate = (values: Values): object => {
    const errors: { [key: string]: string } = {};
    for (let i = 0; i < this.state.inputs; i++) {
      const key = 'field'+i;
      if (!values['field'+i]) {
        errors[key] = `${key} must be set`;
      }
    }
    return errors;
  };

  public render() {
    return (
      <Formik<Values>
        initialValues={{}}
        validate={this.validate}
        onSubmit={this.onSubmit}
        render={(formProps) => (
          <Form>
            <h1>Lotsa Inputs using Formik</h1>

            <div>
              <label>Use Fast Field?</label>
              <input type='checkbox' checked={this.state.fastField} onChange={(e) => {
                this.setState({ fastField: e.currentTarget.checked });
              }} />
            </div>

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
            
            <button type='submit'>Submit</button>

            {Array.from({length: this.state.inputs}, (x,i) => (
              <div key={i}>
                <label>{`field${i}`}</label>
                {this.state.fastField
                  ? <FastField name={`field${i}`} disabled={formProps.isSubmitting} />
                  : <Field name={`field${i}`} disabled={formProps.isSubmitting} />
                }
                <ErrorMessage name={`field${i}`} />
              </div>
            ))}

            <button type='submit'>Submit</button>
          </Form>
        )}
      />
    );
  }
}
