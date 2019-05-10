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
const FormContext = React.createContext(null);
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
    const valid = isValid(errors);
    const touched = touchAll(errors, Object.assign({}, bag.touched));
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
        this.updateBag = (values, touched, shouldValidate) => {
            const { bag } = this.props;
            let errors = bag.errors;
            let valid = bag.valid;
            if (shouldValidate && this.props.validate) {
                errors = this.props.validate(values);
                valid = Object.keys(errors).length === 0;
            }
            const updated = { errors, touched, valid, values };
            this.props.onUpdate({ name, bag: updated });
            return updated;
        };
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
        const { handleBlur, handleChange, setFieldValue, setFieldTouched, updateBag } = this;
        const ctx = {
            bag: this.props.bag,
            validate: this.props.validate,
            handleBlur: handleBlur,
            handleChange: handleChange,
            setFieldValue,
            setFieldTouched,
            updateBag,
        };
        return React.createElement(FormContext.Provider, { value: ctx }, this.props.children);
    }
}
FormData.defaultProps = {
    validateOnChange: true,
    validateOnBlur: true,
};
export class SubForm extends React.Component {
    constructor() {
        super(...arguments);
        this.updateBag = (values, touched, shouldValidate) => {
            const updated = this.context.updateBag(Object.assign({}, this.context.bag.values, { [this.props.name]: values }), Object.assign({}, this.context.bag.touched, { [this.props.name]: touched }), shouldValidate);
            return {
                valid: updated.valid,
                errors: updated.errors[this.props.name],
                touched: updated.touched[this.props.name],
                values: updated.values[this.props.name],
            };
        };
        this.handleChange = (name, value) => {
            this.setFieldValue(name, value, !!this.props.validateOnChange);
        };
        this.handleBlur = (name) => {
            const touched = this.context.bag.touched[this.props.name];
            const values = this.context.bag.values[this.props.name];
            const newTouched = Object.assign({}, touched, { [name]: true });
            return this.updateBag(values, newTouched, !!this.props.validateOnBlur);
        };
    }
    setFieldValue(name, value, shouldValidate) {
        const newValues = Object.assign({}, this.context.bag.values[this.props.name], { [name]: value });
        return this.updateBag(newValues, this.context.bag.touched[this.props.name], shouldValidate);
    }
    setFieldTouched(name) {
        const newTouched = Object.assign({}, this.context.bag.touched[this.props.name], { [name]: true });
        return this.updateBag(this.context.bag.values[this.props.name], newTouched, false);
    }
    render() {
        const { handleBlur, handleChange, setFieldValue, setFieldTouched, updateBag } = this;
        const ctx = {
            bag: {
                valid: true,
                errors: this.context.bag.errors[this.props.name] || {},
                touched: this.context.bag.touched[this.props.name] || {},
                values: this.context.bag.values[this.props.name] || {},
            },
            handleBlur: handleBlur,
            handleChange: handleChange,
            setFieldValue,
            setFieldTouched,
            updateBag,
        };
        return React.createElement(FormContext.Provider, { value: ctx }, this.props.children);
    }
}
SubForm.defaultProps = {
    validateOnChange: true,
    validateOnBlur: true,
};
SubForm.contextType = FormContext;
export class FieldError extends React.Component {
    render() {
        const _a = this.props, { component, hideIfEmpty, name } = _a, props = __rest(_a, ["component", "hideIfEmpty", "name"]);
        const touched = !!this.context.bag.touched[name];
        const message = (touched && this.context.bag.errors[name]) || '';
        if (typeof message !== 'string') {
            throw new Error(); // FIXME: improve error
        }
        if (!message && hideIfEmpty) {
            return null;
        }
        if (component) {
            return React.createElement(component, { touched, message: message });
        }
        else {
            return React.createElement('div', props, message);
        }
    }
}
FieldError.contextType = FormContext;
export class Field extends React.PureComponent {
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
    renderProps(name, children) {
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
        const { name, children } = this.props;
        if ('render' in this.props) {
            const renderProps = this.renderProps(name, children);
            return this.props.render(renderProps);
        }
        if (!('component' in this.props)) {
            throw new Error('formage: must include render or component prop');
        }
        const componentProps = Object.assign({}, this.props, { onChange: this.onChange, onBlur: this.onBlur, 
            // Without the '', if the key does not exist, react warns about
            // uncontrolled components:
            value: this.context.bag.values[name] || '' });
        const { component } = this.props;
        if (this.props.type === 'checkbox' || this.props.type === 'radio') {
            componentProps.checked = this.context.bag.values[name];
        }
        return React.createElement(component, componentProps);
    }
}
Field.contextType = FormContext;
Field.defaultProps = {
    component: 'input',
};
export function LabelledField(props) {
    const { errorClassName, errorComponent, hideErrorIfEmpty, label } = props, rest = __rest(props, ["errorClassName", "errorComponent", "hideErrorIfEmpty", "label"]);
    return (React.createElement("div", { className: props.className, style: props.style },
        React.createElement("label", null, label),
        React.createElement(Field, Object.assign({}, rest)),
        React.createElement(FieldError, { name: props.name, className: errorClassName, component: errorComponent, hideIfEmpty: hideErrorIfEmpty })));
}
function touchAll(errors, touched) {
    if (!touched) {
        touched = {};
    }
    for (const key of Object.keys(errors)) {
        if (typeof errors[key] === 'string') {
            touched[key] = true;
        }
        else {
            touched[key] = touchAll(errors[key], touched[key]);
        }
    }
    return touched;
}
function isValid(errors) {
    for (const key of Object.keys(errors)) {
        if (typeof errors[key] === 'string') {
            return false;
        }
        else {
            if (!isValid(errors[key])) {
                return false;
            }
        }
    }
    return true;
}
//# sourceMappingURL=index.js.map