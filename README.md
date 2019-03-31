🧀 React Formage 🧀
=================

Inspired in no small part by [Formik](https://github.com/jaredpalmer/formik),
this aims to distil the bits I was actually using in such a way as to grant the
parent component 100% control over all meaningful state.

This is a very early draft, but it's sitting at around the size I'd prefer it
to stay. The name, on the other hand... would quite like to change that.

Similarities to Formik:

- Similar approach to `onChange` and `onBlur`
- The whole `touched` thing is a very nice way to express the idea, so that has
  been borrowed wholesale.
- `Context` is used behind the scenes to help minimise wiring `onBlur` and
  `onChange` to every Field.
- The API for adding custom fields is not entirely dissimilar; my integrations
  with `react-select` end up looking pretty much the same as with `Formik`.
- `FieldError` is quite similar to `formik.ErrorMessage`

Differences from Formik:

- No state retention - the parent of the `<Form>` component is completely
  responsible for state management.
- The parent of `<Form>` is completely responsible for submission.
- No support for nested value paths (like Lodash's `get` and `set`) - these
  are antithetical to typing. Flatten your form fields in to `Values` even
  if they are nested in your domain, or use multiple `<Form>` components, one
  per hierarchy, and co-ordinate the state in your parent.
- Less pseudo-typing. Formik leans on `any` too hard and strips the generics
  you provide through excessive nesting.
- Updates are pushed in their entirety to the parent component on every change
  or blur. A `FormBag` in every keypress!
- Validation happens once, once only, and for everything. There's no schema
  (unless you want to integrate one yourself), no presumption of any schema,
  you write some simple imperative code and that's it.
- No HOCs (please god, no HOCs)


Simple TypeScript example:

```typescript
import * as React from 'react';

import { createFormBag, Field, FieldError, Form, FormBag, FormErrors, FormUpdateEvent, validateFormBag } from 'react-formage';

type Values = {
  readonly foo: string;
  readonly bar: string;
};

type State = {
  readonly bag: FormBag<Values>;
};

export class BasicExample extends React.Component<{}, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      bag: createFormBag({ foo: '', bar: '' }),
    };
  }

  private onSubmit = () => {
    // Ensure you validate on submit to touch all untouched fields, otherwise
    // their validation messages will not be shown:
    const bag = validateFormBag(this.state.bag, this.validate);

    // If you don't save the bag, you won't see any new errors:
    this.setState({ bag });

    if (bag.valid) {
      alert('Submit OK!');
    }
  };

  private validate = (values: Values): FormErrors<Values> => {
    const errors: FormErrors<Values> = {};
    const required: Array<keyof Values> = ['foo', 'bar'];
    for (const key of required) {
      if (!values[key]) {
        errors[key] = 'Value is required';
      }
    }
    return errors;
  };

  public render() {
    const { errors, touched } = this.state.bag;

    return (
      <Form bag={this.state.bag} onUpdate={(e) => this.setState({ bag: e.bag })} validate={this.validate}>
        <div>
          <label>Foo</label>
          <Field<Values> name="foo" />
          <FieldError<Values> name="foo" className="error" />
        </div>

        <div>
          <label>Bar</label>
          <Field<Values> name="bar" />
          <div className="error">{touched.bar && errors.bar}</div>
        </div>

        <button onClick={this.onSubmit}>Submit</button>
      </Form>
    );
  }
}
```
