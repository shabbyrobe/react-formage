import * as React from 'react';

import { AsyncValidationExample } from './async-validation';
import { BasicExample } from './basic-example';
import { LotsaInputsExample } from './lotsa-inputs';
import { LotsaInputsFormikExample } from './lotsa-inputs-formik';
import { NestedObjectExample } from './nested-object';
import { NestedReuseExample } from './nested-reuse';
import { ReactSelectExample } from './react-select';

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

const NavLink = (props: any) => (
  <a style={{
    ...(props.style || {}),
    display: 'block',
    margin: '10px',
    borderBottom: '1px dotted #ccc',
    }} {...props} />
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
  readonly url: string;
  readonly name: string;
  readonly component: () => React.ReactNode;
};

const examples: ReadonlyArray<Example> = [
  { url: 'basic-input'         , name: 'Basic Input Types'     , component: () => <BasicExample /> }             ,
  { url: 'react-select'        , name: 'React Select'          , component: () => <ReactSelectExample /> }       ,
  { url: 'async-validation'    , name: 'Async Validation'      , component: () => <AsyncValidationExample /> }   ,
  { url: 'nested-object'       , name: 'Nested Object'         , component: () => <NestedObjectExample /> }      ,
  { url: 'nested-reuse'        , name: 'Nested Reuse'          , component: () => <NestedReuseExample /> }       ,
  { url: 'lotsa-inputs'        , name: 'Lotsa Inputs'          , component: () => <LotsaInputsExample /> }       ,
  { url: 'lotsa-inputs-formik' , name: 'Lotsa Inputs (Formik)' , component: () => <LotsaInputsFormikExample /> } ,
];

export class Examples extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const path = window.location.pathname.replace(/(^\/|\/$)/, '');
    this.state = {
      current: examples.find((v) => v.url === path) || examples[0],
    };
  }

  public render() {
    return (
      <Container>
        <Nav>
          {examples.map((v) => (
            <li key={v.url}>
              <NavLink
                onClick={() => {
                  window.history.pushState({}, '', v.url);
                  this.setState({ current: v });
                }}>{v.name}</NavLink>
            </li>
          ))}
        </Nav>
        
        <Body>{this.state.current.component()}</Body>
      </Container>
    );
  }
}
