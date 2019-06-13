import * as React from 'react';
import * as formage from 'react-formage';

function LabelledField<
  TValues,
  TKey extends keyof TValues,
>(props: { label: string } & formage.FieldProps<TValues, TKey>) {
  const { label, ...rest } = props;
  return (
    <div>
      <label>{props.label}</label>
      <formage.Field<TValues, TKey> {...rest} />
      <formage.FieldError<TValues> name={props.name} className='error' />
    </div>
  );
}

