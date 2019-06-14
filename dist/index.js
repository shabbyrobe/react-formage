var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from 'react';
// We set no default here - FormContext is not exported, and all our uses in here are
// guaranteed to set one.
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
const optionsNoValidate = { shouldValidate: false };
class FormContextDef {
    constructor(bag, onUpdate, validate, options) {
        this.updateBag = (values, touched, options) => {
            const bag = this._bag;
            const shouldValidate = options ? !!options.shouldValidate : false;
            let errors = bag.errors;
            let valid = bag.valid;
            if (shouldValidate && this.validate) {
                errors = this.validate(values);
                valid = Object.keys(errors).length === 0;
            }
            this._bag = { errors, touched, valid, values };
            this.onUpdate({ name, bag: this._bag });
            return this._bag;
        };
        this.setFieldValue = (name, value, options) => {
            const bag = this._bag;
            const newValues = Object.assign({}, bag.values, { [name]: value });
            return this.updateBag(newValues, bag.touched, options);
        };
        this.setFieldTouched = (name) => {
            const bag = this._bag;
            const newTouched = Object.assign({}, bag.touched, { [name]: true });
            return this.updateBag(bag.values, newTouched, optionsNoValidate);
        };
        this._bag = bag;
        this.validate = validate;
        this.onUpdate = onUpdate;
        this.options = options;
    }
    get bag() { return this._bag; }
    handleChangeBag(name, childBag, options) {
        const bag = this._bag;
        const shouldValidate = (options && options.shouldValidate) || true;
        const values = Object.assign({}, bag.values, { [name]: childBag.values });
        const touched = Object.assign({}, bag.touched, { [name]: childBag.touched });
        let valid = bag.valid && childBag.valid;
        let errors = Object.assign({}, bag.errors, { [name]: childBag.errors });
        if (shouldValidate && this.validate) {
            errors = this.validate(values);
            valid = Object.keys(errors).length === 0;
        }
        this._bag = { errors, touched, valid, values };
        this.onUpdate({ name, bag: this._bag });
        return this._bag;
    }
    handleChange(name, value) {
        this.setFieldValue(name, value, { shouldValidate: !!this.options.validateOnChange });
    }
    handleBlur(name) {
        const bag = this._bag;
        const { touched, values } = bag;
        const newTouched = Object.assign({}, touched, { [name]: true });
        return this.updateBag(values, newTouched, { shouldValidate: !!this.options.validateOnBlur });
    }
    packBag(name, initialValue) {
        const bag = this._bag;
        const childBag = {
            errors: bag.errors[name] || {},
            touched: bag.touched[name] || {},
            values: bag.values[name] || initialValue,
            // FIXME: valid may need to be removed from bag; there are too many corner cases
            // around initial value
            valid: bag.valid,
        };
        return childBag;
    }
}
;
/** FormData provides a context to one or more Field components, validates the
 *  field values and propagates updates to the parent component. */
export class FormData extends React.Component {
    render() {
        if (!this.props.bag) {
            throw new Error('Missing bag prop in <FormData> component');
        }
        const ctx = new FormContextDef(this.props.bag, this.props.onUpdate, this.props.validate, this.props);
        return React.createElement(FormContext.Provider, { value: ctx }, this.props.children);
    }
}
FormData.defaultProps = {
    validateOnChange: true,
    validateOnBlur: true,
};
export class FieldError extends React.Component {
    render() {
        if (!this.context) {
            throw new Error('<Field> is not contained within a <FormData> component');
        }
        if (!this.context.bag) {
            throw new Error('<FormData> bag prop not set');
        }
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
export class Field extends React.Component {
    constructor() {
        super(...arguments);
        this.onComponentChange = (e) => {
            this.context.handleChange(this.props.name, this.extractValue(e.target));
        };
        this.onComponentBlur = (e) => {
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
            // {{{
            // FIXME: these don't need to be created on every render, they only depend on 'name':
            blur: () => this.context.handleBlur(this.props.name),
            change: (value) => this.context.handleChange(this.props.name, value),
            changeBag: (value, options) => this.context.handleChangeBag(this.props.name, value, options),
            packBag: (initial) => this.context.packBag(this.props.name, initial),
            // }}}
            children,
            setFieldTouched: this.context.setFieldTouched,
            setFieldValue: this.context.setFieldValue,
            value: this.context.bag.values[name],
        };
    }
    render() {
        const { name, children } = this.props;
        if (!this.context) {
            throw new Error('<Field> is not contained within a <FormData> component');
        }
        if (!this.context.bag) {
            throw new Error('<FormData> bag prop not set');
        }
        if ('render' in this.props) {
            const renderProps = this.renderProps(name, children);
            return this.props.render(renderProps);
        }
        if (!('component' in this.props)) {
            throw new Error('formage: must include render or component prop');
        }
        const componentProps = Object.assign({}, this.props, { onChange: this.onComponentChange, onBlur: this.onComponentBlur, 
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