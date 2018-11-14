import React from 'react'
import { FormContext } from '../Form'

// Localisation
import { string } from '../../../utils/Utils'
import { strings } from '../resources'

const SmartFormErrorMessages = props => {
    return (
        <FormContext.Consumer>
            {({ isPosting, errors }) => (
                !isPosting && 
                errors.map(
                    (error, index) => {
                        let message, params;
                        if (Array.isArray(error)) {
                            const [Message, ...Params] = error
                            message = Message
                            params = Params
                        } else {
                            message = error
                            params = []
                        }
                        return (<span key={index} className={`error ${props.className || ''}`}>{string(strings, message, ...params)}</span>)
                    }
                )
            )}
        </FormContext.Consumer>
    )
}

export default SmartFormErrorMessages