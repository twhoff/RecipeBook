import React, { Component } from 'react'
import PropTypes from 'prop-types'

// Form context for vanilla use
import { FormContext } from '../../Form'

// Validators
import { validate } from '../Validators'

// Styles
import css from './styles/SmartInput.scss'

class SmartInputWrapper extends Component {
    constructor(props) {
        super(props)

        // Classes for the text input are kept in an array, so that they are
        // easy to change
        this.baseClasses = (props.className)
            ? ['TextInput', ...props.className.split(' ')]
            : ['TextInput']

        this.state = {
            classes: this.baseClasses,
            setClasses: this.setClasses,
            value: props.value || '',
            isValid: false,
            touched: false,
            errors: [],
        }

        this.setClasses = this.setClasses.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.validate = this.validate.bind(this)

        props.update(props.name, this.state.value, this.state.isValid, false)
    }

    componentDidMount() {
        if (this.props.registerValidator) {
            this.props.registerValidator(validate.bind(this))
        }
    }

    validate() {
        // Use the default validator function
        return validate.call(this)
    }

    setClasses() {
        if (this.props.setClasses) {
            this.props.setClasses.call(this)
        } else {
            if (!this.state.isValid) {
                this.setState({ 'classes': [...this.baseClasses, 'hasError'] })
            } else {
                this.setState({ 'classes': [...this.baseClasses] })
            }
        }
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
        return (
            <React.Fragment>
                <input
                    type={this.props.type}
                    className={this.state.classes.join(' ')}
                    name={this.props.name}
                    placeholder={this.props.placeholder}
                    value={this.state.value}
                    onChange={this.handleChange}
                />
                {(!this.state.isValid && this.state.errors.length > 0 && this.props.multiError) &&
                    this.state.errors.map((error, index) => (
                        <span key={index} className={`error`}>{error}</span>
                    ))
                }
                {(!this.state.isValid && this.state.errors.length > 0 && !this.props.multiError) &&
                    <span className={`error`}>{this.state.errors[0]}</span>
                }
            </React.Fragment>
        )
    }
}

SmartInputWrapper.propTypes = {
    validators: PropTypes.object,
    update: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    id: PropTypes.string,
    className: PropTypes.string,
}

const SmartInput = props => {
    const {
        validators = {}
    } = props
    return (
        <FormContext.Consumer>
            {({ update, registerValidator }) => (
                <SmartInputWrapper
                    validators={validators}
                    update={update}
                    registerValidator={registerValidator}
                    {...props}
                />
            )}
        </FormContext.Consumer>
    )
}
export default SmartInput

// For use in custom implementations
export {
    SmartInputWrapper
}