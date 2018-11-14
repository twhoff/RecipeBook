import React, { Component } from 'react'
import { Link } from 'react-router-dom'

// Config
import config from '../../config'

// Context
import { AppContext } from '../App'

// Styles
import css from './styles/SignUp.scss'

// Localisation
import { strings } from './resources'
import { string } from '../../utils/Utils'

// Components
import {
    Card,
    Form,
    SmartCheckbox,
    SmartEmail,
    SmartFormErrorMessages,
    SmartGender,
    SmartInput,
    SmartName,
    SmartPassword,
    SmartSubmitButton,
} from '../../components'

class SignUpWrapper extends Component {

    constructor(props) {
        super(props)

        this.onSubmit = this.onSubmit.bind(this)

        this.state = {
            hasErrors: false,
        }
    }

    clearErrors() {
        this.setState({ hasErrors: false })
    }

    onSubmit(fields) {
        this.clearErrors()
        return fetch(`${config.apiUrl}/signup`, {
            method: 'POST',
            body: JSON.stringify({
                gender: fields.gender.value,
                firstName: fields.firstName.value,
                lastName: fields.lastName.value,
                email: fields.email.value,
                password: fields.password.value,
                birthday: new Date(
                    fields.birthdayYear.value,
                    fields.birthdayMonth.value - 1,
                    fields.birthdayDay.value,
                    0, 0, 0, 0
                ),
                newsletter: Boolean(fields.newsletter.value)
            }),
            credentials: 'include'
        }).then((response) => {
            return response.json()
        }).then((data) => {
            if (data.status) {
                this.props.setUser(false, data.user)
                return data
            } else {
                this.setState({ hasErrors: true })
                return data
            }
        }).catch(e => console.log("Error", e))
    }

    render() {
        return (
            <Form className="cont SignUp c-c s-hf-sign" onSubmit={this.onSubmit} redirectTo="/signin">
                <p className="heroLabel">{string(strings, 'SIGN_HERO_LABEL')}</p>
                <Card className="primaryCard signUpFormCont c-c">
                    <div className="g signUpFormGrid">
                        <h3 className="c">{string(strings, 'SIGNUP_SIGN_UP_LABEL')}</h3>
                        <div className="c">
                            <label htmlFor="sex">{string(strings, 'SIGNUP_GENDER_LABEL')}</label>
                            <SmartGender
                                id="gender"
                                name="gender"
                                className="primarySelect"
                                options={[
                                    { value: '', label: string(strings, 'SIGNUP_GENDER_OPTION_SELECT') },
                                    { value: 'f', label: string(strings, 'SIGNUP_GENDER_OPTION_MRS_MISS_MS') },
                                    { value: 'm', label: string(strings, 'SIGNUP_GENDER_OPTION_MR') },
                                ]}
                            />
                        </div>
                        <div className="c">
                            <label htmlFor="firstName">{string(strings, 'SIGNUP_FIRSTNAME_LABEL')}</label>
                            <SmartName
                                type="text"
                                id="firstName"
                                name="firstName"
                                className="primaryTextInput"
                                validators={{
                                    'required': string(strings, 'FORM_ERROR_REQUIRED_FIELD'),
                                    'minLength': {
                                        'minLength': 2,
                                        'message': string(strings, 'SIGNUP_FIRSTNAME_ERROR', 2)
                                    }
                                }}
                            />
                        </div>
                        <div className="c">
                            <label htmlFor="lastName">{string(strings, 'SIGNUP_LASTNAME_LABEL')}</label>
                            <SmartName
                                type="text"
                                id="lastName"
                                name="lastName"
                                className="primaryTextInput"
                                validators={{
                                    'required': string(strings, 'FORM_ERROR_REQUIRED_FIELD'),
                                    'minLength': {
                                        'minLength': 2,
                                        'message': string(strings, 'SIGNUP_LASTNAME_ERROR', 2)
                                    }
                                }}
                            />
                        </div>
                        <div className="c">
                            <label htmlFor="email">{string(strings, 'SIGN_EMAIL_LABEL')}</label>
                            <SmartEmail
                                type="text"
                                id="email"
                                name="email"
                                className="primaryTextInput"
                            />
                        </div>
                        <div className="c">
                            <label htmlFor="password">{string(strings, 'SIGN_PASSWORD_LABEL')}</label>
                            <SmartPassword
                                type="password"
                                id="password"
                                name="password"
                                className="primaryTextInput"
                            />
                        </div>
                        <div className="c">
                            <label htmlFor="birthday">{string(strings, 'SIGNUP_BIRTHDAY_LABEL')}</label>
                            <fieldset id="birthday">
                                <div className="g signUpBirthdayGrid">
                                    <div className="c-1-3">
                                        <SmartInput
                                            type="text"
                                            name="birthdayDay"
                                            id="birthdayDay"
                                            className="primaryTextInput"
                                            placeholder={string(strings, 'SIGNUP_BIRTHDAY_DAY')}
                                            validators={{
                                                'required': string(strings, 'FORM_ERROR_REQUIRED_FIELD'),
                                                'number': string(strings, 'FORM_ERROR_NUMERIC'),
                                            }}
                                        />
                                    </div>
                                    <div className="c-1-3">
                                        <SmartInput
                                            type="text"
                                            name="birthdayMonth"
                                            id="birthdayMonth"
                                            className="primaryTextInput"
                                            placeholder={string(strings, 'SIGNUP_BIRTHDAY_MONTH')}
                                            validators={{
                                                'required': string(strings, 'FORM_ERROR_REQUIRED_FIELD'),
                                                'number': string(strings, 'FORM_ERROR_NUMERIC'),
                                            }}
                                        />
                                    </div>
                                    <div className="c-1-3">
                                        <SmartInput
                                            type="text"
                                            name="birthdayYear"
                                            id="birthdayYear"
                                            className="primaryTextInput"
                                            placeholder={string(strings, 'SIGNUP_BIRTHDAY_YEAR')}
                                            validators={{
                                                'required': string(strings, 'FORM_ERROR_REQUIRED_FIELD'),
                                                'number': string(strings, 'FORM_ERROR_NUMERIC'),
                                                'minLength': {
                                                    'minLength': 4,
                                                    'message': string(strings, 'SIGNUP_BIRTHDAY_YEAR_ERROR')
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                        <div className="c">
                            <SmartCheckbox
                                id="newsletter"
                                name="newsletter"
                                label={string(strings, 'SIGNUP_NEWSLETTER_LABEL')}
                                value="true"
                                className="newsletterCheckbox"
                            />
                        </div>
                        <div className="c">
                            {/* This button was deliberately left tall */}
                            <SmartSubmitButton className="primaryButtonInverted">
                                {string(strings, 'SIGN_SIGN_UP_LABEL')}
                            </SmartSubmitButton>
                        </div>
                        {this.state.hasErrors &&
                            <div className="c">
                                <SmartFormErrorMessages className="t-c n-m-t" />
                            </div>}
                    </div>
                </Card>
                <div className="g signUpFormCont c-c">
                    <div className="c t-r">
                        {string(strings, 'SIGNUP_ALREADY_HAVE_ACCOUNT_LABEL')} <Link className="t-s" to="/signin">{string(strings, 'SIGN_LOG_IN_LABEL')}</Link>
                    </div>
                </div>
            </Form>
        )
    }
}

class SignUp extends Component {

    render() {
        // Used to redirect the user back to the page they arrived from once authenticated
        return (
            <AppContext.Consumer>
                {({ setUser }) => <SignUpWrapper setUser={setUser} />}
            </AppContext.Consumer>
        )
    }

}


export default SignUp