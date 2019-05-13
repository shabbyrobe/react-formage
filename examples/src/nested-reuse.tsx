import * as React from 'react';

import * as formage from 'react-formage';
import { Field, FieldError, FormData } from 'react-formage';

function LabelledField<TValues, TKey extends keyof TValues>(props: { label: string } & formage.FieldProps<TValues, TKey>) {
  const { label, ...rest } = props;
  return (
    <div>
      <label>{props.label}</label>
      <Field<TValues, TKey> {...rest} />
      <FieldError<TValues> name={props.name} className='error' />
    </div>
  );
}

type Level3Values = {
  readonly yep: string;
};

const initialLevel3: Level3Values = { yep: '' };

const validateLevel3 = (values: Level3Values): formage.FormErrors<Level3Values> => {
  const errors: formage.FormErrors<Level3Values> = {};
  if (!values.yep.trim()) { errors.yep = 'yep is required'; }
  return errors;
};

const Level3Form = () => <>
  <LabelledField<Level3Values, 'yep'> label='Yep' name='yep' />
</>;


type Level2Values = {
  readonly baz: string;
  readonly qux: string;
  readonly level3: Level3Values;
};

const initialLevel2: Level2Values = {
  baz: '',
  qux: '',
  level3: initialLevel3,
};

const validateLevel2 = (values: Level2Values): formage.FormErrors<Level2Values> => {
  const errors: formage.FormErrors<Level2Values> = {};
  if (!values.baz.trim()) { errors.baz = 'baz is required'; }
  if (!values.qux.trim()) { errors.qux = 'qux is required'; }
  errors.level3 = validateLevel3(values.level3);
  return errors;
};

const Level2Form = () => <>
  <LabelledField<Level2Values, 'baz'> label='Baz' name='baz' />
  <LabelledField<Level2Values, 'qux'> label='Qux' name='qux' />
  <Field<Level2Values, 'level3'> name='level3' render={(props) => (
    <div style={{border: '1px solid purple', padding: '10px'}}>
      <FormData<Level3Values> bag={props.packBag({ yep: '' })} onUpdate={(e) => props.changeBag(e.bag) }>
        <Level3Form />
      </FormData>
    </div>
  )} />
</>;


type Level1Values = {
  readonly foo: string;
  readonly bar: string;
  readonly level2: Level2Values;
};

const validateLevel1 = (values: Level1Values): formage.FormErrors<Level1Values> => {
  const errors: formage.FormErrors<Level1Values> = {};
  if (!values.foo.trim()) { errors.foo = 'foo is required'; }
  if (!values.bar.trim()) { errors.bar = 'bar is required'; }

  errors.level2 = validateLevel2(values.level2);
  return errors;
};

const initialLevel1: Level1Values = {
  foo: '', bar: '',
  level2: initialLevel2,
};

const Level1Form = () => <>
  <LabelledField<Level1Values, 'foo'> label='Foo' name='foo' />
  <LabelledField<Level1Values, 'bar'> label='Bar' name='bar' />

  <Field<Level1Values, 'level2'> name='level2' render={(props) => (
    <div style={{border: '1px solid blue', padding: '10px'}}>
      <FormData<Level2Values> bag={props.packBag(initialLevel2)} onUpdate={(e) => props.changeBag(e.bag)}>
        <Level2Form />
      </FormData>
    </div>
  )} />
</>;


type Props = {};

type State = {
  readonly bag: formage.FormBag<Level1Values>;
};

export class NestedReuseExample extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      bag: formage.createFormBag(initialLevel1),
    };
  }

  public onUpdate = (e: formage.FormUpdateEvent<Level1Values>) => {
    this.setState({ bag: e.bag });
  };

  private onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bag = formage.validateFormBag(this.state.bag, validateLevel1);
    this.setState({ bag });
    if (bag.valid) {
      alert('Submit OK!');
    }
  };

  public render() {
    return (
      <form noValidate onSubmit={this.onSubmit}>
        <h1>Nested Reusable Form Components</h1>

        <div style={{border: '1px solid green', padding: '10px'}}>
          <FormData bag={this.state.bag} onUpdate={this.onUpdate} validate={validateLevel1}>
            <Level1Form />
          </FormData>
        </div>

        <button onClick={this.onSubmit}>SUBMIT</button>

        <div style={{ margin: '30px 0px' }}>
          <textarea readOnly={true} style={{ width: '100%', height: '200px' }}
            value={JSON.stringify(this.state.bag.values, undefined, 2)} />
        </div>
      </form>
    );
  }
}
