import React from 'react'
import { FormContext } from '../Form'

import css from "../../Button/styles/Button.scss"

const FormSubmitButton = props => (
    <FormContext.Consumer>
        {({ onSubmit, isFormValid, isPosting }) => (
            <button type="submit" disabled={!isFormValid||isPosting} onClick={onSubmit} {...props} className={"Button " + props.className}>
                {props.children}
            </button>
        )}
    </FormContext.Consumer>
)

export default FormSubmitButton