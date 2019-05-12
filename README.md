🧀 React Formage 🧀
=================

Inspired in no small part by [Formik](https://github.com/jaredpalmer/formik),
this aims to distil the bits I was actually using in such a way as to grant the
parent component 100% control over all meaningful state.

This is an early draft, but it's sitting at around the size I'd prefer it to
stay.

Formage is TypeScript-first. I don't use it or test it using vanilla JS, but
will make any modification necessary to improve the experience for vanilla JS
use-cases as long as it doesn't detract from the TypeScript experience.


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

- No state retention inside `react-formage`- the parent of the `<FormData>`
  component is completely responsible for state management.
- The parent of `<FormData>` is also completely responsible for submission.
- No support for nested value paths (like Lodash's `get` and `set`) - these
  are antithetical to typing. Flatten your form fields in to `Values` even if
  they are nested in your domain, or use multiple `<FormData>` components, one
  per hierarchy, and co-ordinate the state in your parent.
- Less pseudo-typing. Formik leans on `any` too hard and strips the generics
  you provide through excessive nesting.
- Updates are pushed in their entirety to the parent component on every change
  or blur. A `FormBag` in every keypress!
- Validation happens in one place and one place only, for everything. There's
  no schema (unless you want to integrate one yourself), no presumption of any
  schema, you write some simple imperative code and that's it.

TODO:

- Decide on whether `valid` should remain in `bag` (there are some under-explored
  corner cases here)
- Test-drive and assess current assumptions about `shouldValidate`
- Publish to NPM


Performance
-----------

Performance is not the focus of Formage, but it seems to work fine with lots of
fields when you disable the React DevTools extension and use the production
build of React.

Formage is overall a bit faster than Formik in the tests I ran on my old dual
core 2015 MacBook Pro using Chrome, especially in development mode. As this is
an internet pseudo-benchmark, all usual disclaimers about flawed methodologies
apply, YMMV, etc etc. It is not intended to say "Formik slow Formage fast blah
blah blah", it's intended to say "this is probably not slower than what you
can expect from the alternative".

The time column is the total time to taken handle a single keypress on a form
with 1,000 fields, as reported by Chrome's devtools:

| Test | Build | Time |
| ---- | ----- | ----:|
| Formage | prod | 18ms |
| Formik FastField | prod | 20ms |
| Formik Field | prod | 38ms |
| Formage | dev | 140ms |
| Formik FastField | dev | 300ms |
| Formik Field | dev | 330ms |

This library favours brutal simplicity over performance. I'm investigating ways
to speed it up, but if those improvements don't fit in with the ultimate goal
of retaining that simplicity, limitations on the number of fields will probably
remain.


Simple TypeScript example
-------------------------

More examples can be found in the `examples/` directory. They're a bit rubbish
at the moment (and they aren't styled - I leave CSS to the professionals!) but
they're serviceable. Run `npm run localdemo` to run them in a local web server.

```typescript
import * as React from 'react';

import { createFormBag, FormBag, FormData, FormErrors, LabelledField, validateFormBag } from 'react-formage';

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

  private onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
    const required: ReadonlyArray<keyof Values> = ['foo', 'bar'];
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
      <form noValidate onSubmit={this.onSubmit}>
        <FormData bag={this.state.bag} onUpdate={(e) => this.setState({ bag: e.bag })} validate={this.validate}>
          <LabelledField<Values, "foo"> name="foo" errorClassName="error" />
          <LabelledField<Values, "bar"> name="bar" errorClassName="error" />

          <button onClick={this.onSubmit}>Submit</button>
        </FormData>
      </form>
    );
  }
}
```
