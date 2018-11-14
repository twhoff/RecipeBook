import React from 'react'
import { FormContext } from '../Form'

// Localisation
import { string } from '../../../utils/Utils'
import { strings } from '../resources'

import { SmartSelectWrapper } from './SmartSelect/SmartSelect'

const SmartGender = props => {
    const {
        validators = {
            'required': string(strings, 'FORM_ERROR_REQUIRED_FIELD'),
        }
    } = props
    return (
        <FormContext.Consumer>
            {({ update, registerValidator }) => (
                <SmartSelectWrapper
                    validators={validators}
                    update={update}
                    registerValidator={registerValidator}
                    {...props}
                />
            )}
        </FormContext.Consumer>
    )
}

export default SmartGender