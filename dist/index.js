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
});
const FormConsumer = FormContext.Consumer;
export function createFormBag(values) {
    return { errors: {}, touched: {}, valid: true, values: values };
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
        touched: touched,
        valid,
        values: bag.values,
    };
}
export class Form extends React.Component {
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
        const { touched, values } = this.props.bag;
        const newValues = Object.assign({}, values, { [name]: value });
        const newTouched = Object.assign({}, touched, { [name]: true });
        return this.updateBag(newValues, newTouched, shouldValidate);
    }
    render() {
        const { handleBlur, handleChange, setFieldValue } = this;
        const ctx = {
            bag: this.props.bag,
            handleBlur,
            handleChange,
            setFieldValue,
        };
        return (React.createElement(FormContext.Provider, { value: ctx }, this.props.children));
    }
}
Form.defaultProps = {
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
        const { component, type } = this.props;
        if (type === 'checkbox' || type === 'radio') {
            return target.checked;
        }
        return target.value;
    }
    render() {
        const _a = this.props, { component, name, children } = _a, props = __rest(_a, ["component", "name", "children"]);
        let extra = {};
        if (typeof component === 'string' || component instanceof String) {
            if (props.type === 'checkbox' || props.type === 'radio') {
                extra = { type: props.type, checked: this.context.bag.values[name] };
            }
            else if (props.type) {
                extra = { type: props.type };
            }
            return React.createElement(component, Object.assign({}, props, extra, { onChange: this.onChange, onBlur: this.onBlur, children, 
                // Without the '', if the key does not exist, react warns about
                // uncontrolled components:
                value: this.context.bag.values[name] || '' }));
        }
        else {
            const componentProps = {
                value: this.context.bag.values[name],
                change: (value) => this.context.handleChange(this.props.name, value),
                blur: () => this.context.handleBlur(this.props.name),
                setFieldValue: this.context.setFieldValue,
                children,
            };
            return React.createElement(component, componentProps);
        }
    }
}
Field.contextType = FormContext;
Field.defaultProps = {
    component: 'input',
};
//# sourceMappingURL=index.js.map