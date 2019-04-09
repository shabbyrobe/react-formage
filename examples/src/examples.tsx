import * as React from 'react';

import { BasicExample } from './basic-example';
import { LotsaInputsExample } from './lotsa-inputs';
import { AsyncValidationExample } from './async-validation';
import { LotsaInputsFormikExample } from './lotsa-inputs-formik';

const Container = (props: any) => (
  <div style={{
    padding: '8px',
    boxSizing: 'border-box',
    display: 'grid', 
    gridTemplateColumns: '[nav] 150px [body] auto',
    gridGap: '15px 15px',
    width: '100vw',
    height: '100vh',
  }}>
    {props.children}
  </div>
);

const Nav = (props: any) => (
  <ul style={{ gridColumn: 'nav' }}>
    {props.children}
  </ul>
);

const Body = (props: any) => {
  return (
    <div style={{ gridColumn: 'body' }}>
      {props.children}
    </div>
  );
};

type Props = {};

type State = {
  readonly current: Example;
};

type Example = {
  id: string;
  component: () => React.ReactNode;
};

const examples: ReadonlyArray<Example> = [
  { id: 'Control Types', component: () => <BasicExample /> },
  { id: 'Lotsa Inputs', component: () => <LotsaInputsExample /> },
  { id: 'Async Validation', component: () => <AsyncValidationExample /> },
  { id: 'Lotsa Inputs (Formik)', component: () => <LotsaInputsFormikExample /> },
];

export class Examples extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { current: examples[0] };
  }

  public render() {
    return (
      <Container>
        <Nav>
          {examples.map((v) => (
            <li key={v.id}><a onClick={() => this.setState({ current: v })}>{v.id}</a></li>
          ))}
        </Nav>
        
        <Body>{this.state.current.component()}</Body>
      </Container>
    );
  }
}
