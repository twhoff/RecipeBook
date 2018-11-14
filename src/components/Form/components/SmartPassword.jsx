import React from 'react'
import { FormContext } from '../Form'

// Localisation
import { string } from '../../../utils/Utils'
import { strings } from '../resources'

import { SmartInputWrapper } from './SmartInput/SmartInput'

const SmartPassword = props => {
    const {
        validators = {
            'required': string(strings, 'FORM_ERROR_REQUIRED_FIELD'),
            'strongPassword': string(strings, 'FORM_ERROR_PASSWORD_STRENGTH', 8, 1)
        }
    } = props
    return (
        <FormContext.Consumer>
            {({ update, registerValidator }) => (
                <SmartInputWrapper
                    validators={validators}
                    update={update}
                    registerValidator={registerValidator}
                    setClasses={function () {
                        if ('strongPassword' in this.props.validators)
                            switch (this.state.isValid) {
                                case 2:
                                    this.setState({ 'classes': [...this.baseClasses, 'strong'] })
                                    break;
                                case 1:
                                    this.setState({ 'classes': [...this.baseClasses, 'medium'] })
                                    break;
                                default:
                                    this.setState({ 'classes': [...this.baseClasses, 'weak'] })
                                    break;
                            }
                    }}
                    {...props}
                />
            )}
        </FormContext.Consumer>
    )
}

export default SmartPassword