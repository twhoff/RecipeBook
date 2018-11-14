import React, { Component } from 'react'
import PropTypes from 'prop-types'

// Form context for vanilla use
import { FormContext } from '../../Form'

// Validators
import { validate } from '../Validators'

// Styles
import css from './styles/SmartSelect.scss'

class SmartSelectWrapper extends Component {
    constructor(props) {
        super(props)

        this.state = {
            value: props.value || '',
            isValid: false,
            touched: false,
            errors: [],
        }

        this.handleChange = this.handleChange.bind(this)
        this.validate = this.validate.bind(this)

        props.update(props.name, this.state.value, this.state.isValid, false)
    }

    componentDidMount() {
        if (this.props.registerValidator) {
            this.props.registerValidator(this.validate)
        }
    }

    validate() {
        // Use the default validator function
        return validate.call(this)
    }

    handleChange(e) {
        this.setState(
            {
                touched: true,
                value: e.target.value
            },
            () => {
                const isValid = this.validate()
                this.props.update(this.props.name, this.state.value, isValid)
            }
        )
    }

    render() {
        const {
            className = '',
            name = '',
            placeholder = '',
            options = [],
            update = () => {},
            registerValidator = () => {},
            ...props
        } = this.props
        return (
            <React.Fragment>
                <select
                    {...props}
                    className={`Select ${className || ''}`}
                    name={name}
                    placeholder={placeholder}
                    value={this.state.value}
                    onChange={this.handleChange}
                >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
                </select>
                {!this.state.isValid &&
                    this.state.errors.map((error, index) => (
                        <span key={index} className={`error`}>{error}</span>
                    ))
                }
            </React.Fragment>
        )
    }
}

SmartSelectWrapper.propTypes = {
    validators: PropTypes.object,
    update: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.object).isRequired,
    className: PropTypes.string,
}

export default props => {
    return (
        <FormContext.Consumer>
            {({ update, registerValidator }) => (
                <SmartSelectWrapper
                    update={update}
                    registerValidator={registerValidator}
                    {...props}
                />
            )}
        </FormContext.Consumer>
    )
}

// For use in custom implementations
export {
    SmartSelectWrapper
}