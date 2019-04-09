import * as React from 'react';
import Select from 'react-select';

import { createFormBag, Field, FieldError, FormBag, FormData, FormErrors, FormUpdateEvent, validateFormBag } from 'react-formage';

type Props = {};

type Values = {
  readonly fast: string;
  readonly slow: string;
};

type State = {
  readonly bag: FormBag<Values>;
  readonly slowIsValidating?: boolean;
  readonly slowLastValidated?: string;
};

function bagSetError<TValues>(bag: FormBag<TValues>, field: keyof TValues, error: string | undefined): FormBag<TValues> {
  const errors = { ...bag.errors };
  if (error) {
    errors[field] = error;
  } else {
    delete(errors[field]);
  }
  return { ...bag, errors };
}

// So far this is a bit painful and fiddly, but the concept works.
export class AsyncValidationExample extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      bag: createFormBag({
        fast: '',
        slow: '',
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
    if (bag.valid && !this.state.slowIsValidating) {
      alert('Submit OK!');
    }
  };

  private validate = (values: Values): FormErrors<Values> => {
    const errors: FormErrors<Values> = { ...this.state.bag.errors };

    if (!values.fast) {
      errors.fast = 'Required';
    } else {
      delete(errors.fast);
    }

    if (!this.state.slowIsValidating && values.slow !== this.state.slowLastValidated) {
      delete(errors.slow);
      this.setState({ slowIsValidating: true, slowLastValidated: values.slow });
      this.validateSlow(values.slow);
    }
    return errors;
  };

  private async validateSlow(v: string) {
    setTimeout(() => {
      const bag = bagSetError(this.state.bag, 'slow', !v ? 'Required' : undefined);
      this.setState({ slowIsValidating: false, bag });
    }, 1000);
  }

  public render() {
    const { errors, touched } = this.state.bag;

    return (
      <form noValidate onSubmit={this.onSubmit}>
        <FormData bag={this.state.bag} onUpdate={this.onFormUpdate} validate={this.validate}>
          <h1>Form Example</h1>

          <div>
            <label>Fast</label>
            <Field<Values> name="fast" />
            <FieldError<Values> name="fast" className="error" />
          </div>

          <div>
            <label>Slow</label>
            <Field<Values> name="slow" />
            <div className="error">{touched.slow && errors.slow}</div>
            {this.state.slowIsValidating ? 'Loading...' : null}
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
