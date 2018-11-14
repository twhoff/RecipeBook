import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

// Localisation
import { strings } from './resources'
import { string, validators } from '../../utils/Utils'

// Styles
import css from './styles/Form.scss'

class Form extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isFormValid: false,
            isPosting: false,
            status: false,
            errors: [],
        }

        this.validators = []
        this.formElements = {}

        this.registerValidator = this.registerValidator.bind(this)
        this.callAllValidators = this.callAllValidators.bind(this)
        this.updateInput = this.updateInput.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }

    registerValidator(validatorFn) {
        this.validators.push(validatorFn)
    }

    callAllValidators() {
        let isFormValid = true

        this.validators.forEach(validatorFn => {
            isFormValid = validatorFn() && isFormValid
        })

        return isFormValid
    }

    updateInput(name, value, isValid, validateForm = true) {
        this.formElements[name] = { value, isValid }
        validateForm && this.isFormValid()
    }

    isFormValid(callback = () => { }) {
        const isFormValid = this.callAllValidators()
        this.setState({ isFormValid }, callback)
    }

    onSubmit(e) {
        e.preventDefault()
        this.setState({ isPosting: true }, () => {
            // Emulate a bit of server response time
            this.isFormValid(
                () => {
                    if (this.state.isFormValid) {
                        this.state.errors = []
                        let result = this.props.onSubmit(this.formElements)
                        result.then((data) => {
                            this.setState({ isPosting: false, ...data })
                        })
                    }
                }
            )
        })
    }

    render() {

        if (this.state.status) {
            return <Redirect to={this.props.redirectTo} />
        }

        return (
            <FormContext.Provider
                value={{
                    update: this.updateInput,
                    registerValidator: this.registerValidator,
                    isFormValid: this.state.isFormValid,
                    onSubmit: this.onSubmit,
                    isPosting: this.state.isPosting,
                    errors: this.state.errors,
                }}
            >
                <form className={"Form " + this.props.className}>
                    {this.props.children}
                </form>
            </FormContext.Provider>
        )
    }
}

export const FormContext = React.createContext()

export default Form