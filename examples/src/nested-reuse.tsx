import * as React from 'react';

import * as formage from 'react-formage';

type BaseValues = {
  readonly foo: string;
  readonly bar: string;

  // Included to make sure the typing doesn't inhibit an object to be treated
  // as a single field:
  readonly objField: { value: string };

  readonly child: ChildValues;
};

type ChildValues = {
  readonly baz: string;
  readonly qux: string;
  readonly more: MoreValues;
};

type MoreValues = {
  readonly yep: string;
};


type Props = {};

type State = {
  readonly bag: formage.FormBag<BaseValues>;
};

const validateMoreForm = (values: MoreValues): formage.FormErrors<MoreValues> => {
  const errors: formage.FormErrors<MoreValues> = {};
  if (!values.yep.trim()) { errors.yep = 'yep is required'; }
  return errors;
};

const validateChildForm = (values: ChildValues): formage.FormErrors<ChildValues> => {
  const errors: formage.FormErrors<ChildValues> = {};
  if (!values.baz.trim()) { errors.baz = 'baz is required'; }
  if (!values.qux.trim()) { errors.qux = 'qux is required'; }
  errors.more = validateMoreForm(values.more);
  return errors;
};

const validateBaseForm = (values: BaseValues): formage.FormErrors<BaseValues> => {
  const errors: formage.FormErrors<BaseValues> = {};
  if (!values.foo.trim()) { errors.foo = 'foo is required'; }
  if (!values.bar.trim()) { errors.bar = 'bar is required'; }

  if (!values.objField.value.trim()) {
    errors.objField = 'objField is required';
  }

  errors.child = validateChildForm(values.child);
  return errors;
};

const MoreForm = () => <>
  <formage.LabelledField<MoreValues> label="Yep" name="yep" errorClassName="error" />
</>;

const ChildForm = () => <>
  <formage.LabelledField<ChildValues> label="Baz" name="baz" errorClassName="error" />
  <formage.LabelledField<ChildValues> label="Qux" name="qux" errorClassName="error" />
  <formage.SubForm<ChildValues, "more"> name="more">
    <MoreForm />
  </formage.SubForm>
</>;

const BaseForm = () => <>
  <formage.LabelledField<BaseValues> label="Foo" name="foo" errorClassName="error" />
  <formage.LabelledField<BaseValues> label="Bar" name="bar" errorClassName="error" />

  <formage.LabelledField<BaseValues, 'objField'>
    label="ObjField"
    name="objField"
    errorClassName="error"
    render={(props) => (
      <input value={props.value.value} onBlur={props.blur}
        onChange={(e) => props.change({ value: e.target.value })}
      />
    )}
  />

  <formage.SubForm<BaseValues, "child"> name="child">
    <ChildForm />
  </formage.SubForm>
</>;


export class NestedReuseExample extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      bag: formage.createFormBag({
        foo: '', bar: '',
        objField: { value: '' },
        child: {
          baz: '',
          qux: '',
          more: { yep: '' },
        },
      }),
    };
  }

  public onUpdate = (e: formage.FormUpdateEvent<BaseValues>) => {
    this.setState({ bag: e.bag });
  };

  private onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bag = formage.validateFormBag(this.state.bag, validateBaseForm);
    this.setState({ bag });
    if (bag.valid) {
      alert('Submit OK!');
    }
  };

  public render() {
    return (
      <form noValidate onSubmit={this.onSubmit}>
        <formage.FormData bag={this.state.bag} onUpdate={this.onUpdate} validate={validateBaseForm}>
          <BaseForm />
        </formage.FormData>

        <button onClick={this.onSubmit}>SUBMIT</button>

        <div style={{ margin: '30px 0px' }}>
          <textarea readOnly={true} style={{ width: '100%', height: '200px' }}
            value={JSON.stringify(this.state.bag.values, undefined, 2)} />
        </div>
      </form>
    );
  }
}
