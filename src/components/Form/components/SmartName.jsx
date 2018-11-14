import React from 'react'
import { FormContext } from '../Form'

// Localisation
import { string } from '../../../utils/Utils'
import { strings } from '../resources'

import { SmartInputWrapper } from './SmartInput/SmartInput'

const SmartName = props => {
    const {
        validators = {
            "required": string(strings, 'FORM_ERROR_REQUIRED_FIELD'),
        }
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

export default SmartName