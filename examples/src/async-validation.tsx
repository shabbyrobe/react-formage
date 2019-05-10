import * as React from 'react';
import Select from 'react-select';

import { createFormBag, Field, FieldError, FormBag, FormData, FormErrors, FormUpdateEvent, validateFormBag } from 'react-formage';

type Props = {};

type Values = {
  readonly fast: string;
  readonly slow: string;
  readonly slowSpeedMs: string;
};

type State = {
  readonly bag: FormBag<Values>;
  readonly slowIsValidating?: boolean;
  readonly slowLastValidated?: string;
  readonly slowSpeedMs: number;
  readonly slowValidationCnt: number;
};

function bagSetError<TValues>(bag: FormBag<TValues>, field: keyof TValues, error: any): FormBag<TValues> {
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
      slowSpeedMs: 2000,
      slowValidationCnt: 0,
      bag: createFormBag({
        fast: '',
        slow: '',
        slowSpeedMs: 2000+'',
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

    if (isNaN(parseInt(values.slowSpeedMs)) || parseInt(values.slowSpeedMs) < 0) {
      errors.slowSpeedMs = 'invalid speed';
    } else {
      this.setState({ slowSpeedMs: parseInt(values.slowSpeedMs) });
    }

    if (values.slow !== this.state.slowLastValidated) {
      delete(errors.slow);
      this.setState({
        slowIsValidating: true, 
        slowValidationCnt: this.state.slowValidationCnt + 1,
        slowLastValidated: values.slow,
      });
      this.validateSlow(values.slow);
    }

    return errors;
  };

  private timeout: any;

  private async validateSlow(v: string) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      const bag = bagSetError(this.state.bag, 'slow', !v ? 'Required' : undefined);
      this.setState({
        slowIsValidating: false,
        bag,
      });
    }, this.state.slowSpeedMs);
  }

  public render() {
    const { errors, touched } = this.state.bag;

    return (
      <form noValidate onSubmit={this.onSubmit}>
        <FormData bag={this.state.bag} onUpdate={this.onFormUpdate} validate={this.validate}>
          <h1>Form Example</h1>

          <div>
            <label>Slow speed (ms)</label>
            <Field<Values> name="slowSpeedMs" />
            <FieldError<Values> name="slowSpeedMs" className="error" />
          </div>

          <div>
            <label>Fast</label>
            <Field<Values> name="fast" />
            <FieldError<Values> name="fast" className="error" />
          </div>

          <div>
            <label>Slow</label>
            <Field<Values> name="slow" />
            <div className="error">{touched.slow && errors.slow}</div>
            {this.state.slowIsValidating ? 'Loading... ' + this.state.slowValidationCnt : null}
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
