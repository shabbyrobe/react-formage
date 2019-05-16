import * as React from 'react';
import Select from 'react-select';

import * as formage from 'react-formage';

type Props = {};

type Values = {
  readonly foo1: string;
  readonly foo2: string;
};

type State = {
  readonly bag: formage.FormBag<Values>;
};

export class MultiUpdateExample extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      bag: formage.createFormBag({
        foo1: '',
        foo2: '',
      }),
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
    return errors;
  };

  public render() {
    const { errors, touched } = this.state.bag;

    return (
      <form noValidate onSubmit={this.onSubmit}>
        <formage.FormData bag={this.state.bag} onUpdate={this.onFormUpdate} validate={this.validate}>
          <h1>Multiple Updates</h1>

          <p>
            Multiple fields can be updated simultaneously when a field is changed
            using <code>props.setFieldValue(name, value)</code> in your Field's <code>render()</code>
          </p>

          <div>
            <label>Foo 1</label>
            <formage.Field<Values, 'foo1'> name='foo1' render={(props) => (
              <input type='text' value={props.value} onBlur={props.blur} onChange={(e) => {
                props.change(e.target.value);
                props.setFieldValue('foo2', e.target.value + ' yep');
              }} />
            )} />
            <formage.FieldError<Values> name='foo1' className='error' />
          </div>

          <div>
            <label>Foo 2</label>
            <formage.Field<Values, 'foo2'> name='foo2' />
            <formage.FieldError<Values> name='foo2' className='error' />
          </div>

          {/* This used to set 'disabled={!this.state.bag.valid}', but that prevents 
              submit from triggering validation of untouched fields */}
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

