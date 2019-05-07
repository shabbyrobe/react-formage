var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
import * as React from 'react';
const FormContext = React.createContext({
    bag: createFormBag({}),
    handleChange: () => { },
    handleBlur: () => { },
    setFieldValue: () => { return createFormBag({}); },
    setFieldTouched: () => { return createFormBag({}); },
});
const FormConsumer = FormContext.Consumer;
export function createFormBag(values, options) {
    return {
        errors: {},
        touched: {},
        valid: (options && options.initialValid !== undefined) ? options.initialValid : false,
        values: values,
    };
}
export function validateFormBag(bag, validator) {
    const errors = validator(bag.values);
    const valid = Object.keys(errors).length === 0;
    const touched = Object.assign({}, bag.touched);
    for (const key of Object.keys(errors)) {
        touched[key] = true;
    }
    return {
        errors,
        touched,
        valid,
        values: bag.values,
    };
}
/** FormData provides a context to one or more Field components, validates the
 *  field values and propagates updates to the parent component. */
export class FormData extends React.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (name, value) => {
            this.setFieldValue(name, value, !!this.props.validateOnChange);
        };
        this.handleBlur = (name) => {
            const { bag } = this.props;
            const { touched, values } = this.props.bag;
            const newTouched = Object.assign({}, touched, { [name]: true });
            return this.updateBag(values, newTouched, !!this.props.validateOnBlur);
        };
    }
    updateBag(values, touched, shouldValidate) {
        const { bag } = this.props;
        let errors = bag.errors;
        let valid = bag.valid;
        if (shouldValidate && this.props.validate) {
            errors = this.props.validate(values);
            valid = Object.keys(errors).length === 0;
        }
        const updated = {
            errors,
            touched,
            valid,
            values,
        };
        this.props.onUpdate({ name, bag: updated });
        return updated;
    }
    setFieldValue(name, value, shouldValidate) {
        const { bag } = this.props;
        const newValues = Object.assign({}, bag.values, { [name]: value });
        return this.updateBag(newValues, bag.touched, shouldValidate);
    }
    setFieldTouched(name) {
        const { bag } = this.props;
        const newTouched = Object.assign({}, bag.touched, { [name]: true });
        return this.updateBag(bag.values, newTouched, false);
    }
    render() {
        const { handleBlur, handleChange, setFieldValue, setFieldTouched } = this;
        const ctx = {
            bag: this.props.bag,
            handleBlur,
            handleChange,
            setFieldValue,
            setFieldTouched,
        };
        return (React.createElement(FormContext.Provider, { value: ctx }, this.props.children));
    }
}
FormData.defaultProps = {
    validateOnChange: true,
    validateOnBlur: true,
};
export class FieldError extends React.Component {
    render() {
        const _a = this.props, { component, name } = _a, props = __rest(_a, ["component", "name"]);
        const touched = !!this.context.bag.touched[name];
        const message = this.context.bag.errors[name];
        if (!touched || !message) {
            return null;
        }
        if (component) {
            return React.createElement(component, { touched, message: message });
        }
        else {
            return React.createElement("div", Object.assign({}, props), message);
        }
    }
}
FieldError.contextType = FormContext;
export class Field extends React.Component {
    constructor() {
        super(...arguments);
        this.onChange = (e) => {
            this.context.handleChange(this.props.name, this.extractValue(e.target));
        };
        this.onBlur = (e) => {
            this.context.handleBlur(this.props.name);
        };
    }
    extractValue(target) {
        const { type } = this.props;
        if (type === 'checkbox' || type === 'radio') {
            return target.checked;
        }
        return target.value;
    }
    componentProps(name, children) {
        return {
            value: this.context.bag.values[name],
            change: (value) => this.context.handleChange(this.props.name, value),
            blur: () => this.context.handleBlur(this.props.name),
            setFieldValue: this.context.setFieldValue,
            setFieldTouched: this.context.setFieldTouched,
            children,
        };
    }
    render() {
        const _a = this.props, { name, children } = _a, props = __rest(_a, ["name", "children"]);
        if ('render' in this.props) {
            const componentProps = this.componentProps(name, children);
            return this.props.render(componentProps);
        }
        if (!('component' in this.props)) {
            throw new Error('formage: must include render or component prop');
        }
        const { component, disabled, type } = this.props;
        const extra = { disabled, type };
        if (props.type === 'checkbox' || props.type === 'radio') {
            extra.checked = this.context.bag.values[name];
        }
        return React.createElement(component, Object.assign({}, props, extra, { onChange: this.onChange, onBlur: this.onBlur, children, 
            // Without the '', if the key does not exist, react warns about
            // uncontrolled components:
            value: this.context.bag.values[name] || '' }));
    }
}
Field.contextType = FormContext;
Field.defaultProps = {
    component: 'input',
};
//# sourceMappingURL=index.js.map