import React, { Component } from 'react'
import { FormContext } from '../Form'

// Validators
import { validators } from './Validators'

// Localisation
import { string } from '../../../utils/Utils'
import { strings } from '../resources'

class SmartCheckboxWrapper extends Component {
    constructor(props) {
        super(props)

        this.state = {
            value: props.value || '',
            isChecked: props.isChecked || false,
            isValid: false,
            touched: false,
            errors: [],
        }

        this.handleChange = this.handleChange.bind(this)
        this.validate = this.validate.bind(this)

        // Register initial value with Form component
        const initialValue = this.getValue()
        props.update(props.name, initialValue, this.state.isValid, false)
        
    }

    getValue() {
        return (this.state.isChecked && this.state.value !== '')
            ? this.state.value
            : (this.state.isChecked)
                ? true
                : false
    }

    componentDidMount() {
        if (this.props.registerValidator) {
            this.props.registerValidator(this.validate)
        }
    }

    validate() {
        // If no validators were specified, there is no validation - return
        if (!this.props.validators) return true

        if (!this.state.touched) return false

        let errors = []
        let isValidValue = true

        Object.keys(this.props.validators).map((validator) => {
            if (!validators[validator](this.getValue())) {
                errors.push(this.props.validators[validator])
                isValidValue = false
            }
        })

        this.setState({
            isValid: isValidValue,
            errors: [...errors]
        })
        return isValidValue
    }

    handleChange(e) {
        this.setState(
            {
                touched: true,
                isChecked: !this.state.isChecked
            },
            () => {
                const isValid = this.validate()
                this.props.update(this.props.name, this.getValue(), isValid)
            }
        )
    }

    render() {
        return (
            <React.Fragment>
                <label className="inline" htmlFor={this.props.id}>
                    <input
                        type="checkbox"
                        className={`Checkbox ${this.props.className || ''}`}
                        id={this.props.id}
                        name={this.props.name}
                        placeholder={this.props.placeholder}
                        value={this.state.value}
                        checked={this.state.isChecked}
                        onChange={this.handleChange}
                    />
                    {this.props.label}
                </label>
                {!this.state.isValid &&
                    this.state.errors.map((error, index) => (
                        <span key={index} className={`error`}>{error}</span>
                    ))
                }
            </React.Fragment>
        )
    }
}

const SmartCheckbox = (props) => {
    return (
        <FormContext.Consumer>
            {({ update, registerValidator }) => (
                <SmartCheckboxWrapper
                    update={update}
                    registerValidator={registerValidator}
                    {...props}
                />
            )}
        </FormContext.Consumer>
    )

}

export default SmartCheckbox