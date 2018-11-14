import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'

// Config
import config from '../../config'

// Context
import { AppContext } from '../App'

// Styles
import css from './styles/SignIn.scss'

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
    SmartPassword,
    SmartSubmitButton
} from '../../components'

class SignInWrapper extends Component {
    constructor(props) {
        super(props)

        this.onSubmit = this.onSubmit.bind(this)

        this.state = {
            hasErrors: false,
            redirectToReferer: false,
        }
    }

    clearErrors() {
        this.setState({ hasErrors: false })
    }

    onSubmit(fields) {
        this.clearErrors()
        return fetch(`${config.apiUrl}/signin`, {
            method: 'POST',
            body: JSON.stringify({
                email: fields.email.value,
                password: fields.password.value,
                rememberMe: Boolean(fields.rememberMe.value)
            }),
            credentials: 'include'
        }).then((response) => {
            return response.json()
        }).then((data) => {
            if (data.status) {
                // Set up session cookie for user validation
                this.props.cookies.set('clientId', data.user.id, {
                    path: '/',
                    maxAge: data.cookieExpires
                })
                this.props.cookies.set('user', data.user.firstName, {
                    path: '/',
                    maxAge: data.cookieExpires
                })
                this.props.setUser(true, data.user)
                return data
            } else {
                this.setState({ hasErrors: true })
                return data
            }
        }).catch(e => console.log("Error", e))
    }

    render() {
        if (this.props.authenticated) {
            return <Redirect to="/" />
        }

        return (
            <Form className="cont SignIn c-c s-hf-sign" onSubmit={this.onSubmit} redirectTo={this.props.from}>
                <p className="heroLabel">{string(strings, 'SIGN_HERO_LABEL')}</p>
                <Card className="primaryCard signInFormCont c-c">
                    <div className="g signInFormGrid">
                        <h3 className="c">
                            {(this.props.user && 'firstName' in this.props.user) && string(strings, 'SIGNIN_PERSONAL_LOG_IN_LABEL', this.props.user.firstName)}
                            {!(this.props.user && 'firstName' in this.props.user) && string(strings, 'SIGN_LOG_IN_LABEL')}
                        </h3>
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
                            {/* setting setClasses to null causes the component to use the default
                                setClass method from the SmartInput component (as we do not need strength)
                                checking for login
                             */}
                            <SmartPassword
                                type="password"
                                id="password"
                                name="password"
                                className="primaryTextInput"
                                validators={{
                                    'required': string(strings, 'FORM_ERROR_REQUIRED_FIELD'),
                                }}
                                setClasses={null}
                            />
                        </div>
                        <div className="c">
                            <SmartCheckbox
                                id="rememberMe"
                                name="rememberMe"
                                label={string(strings, 'SIGNIN_REMEMBER_ME_LABEL')}
                                value="true"
                                className="rememberMeCheckbox"
                            />
                        </div>
                        <div className="c">
                            {/* This button was deliberately left tall */}
                            <SmartSubmitButton className="primaryButtonInverted">
                                {string(strings, 'SIGN_LOG_IN_LABEL')}
                            </SmartSubmitButton>
                        </div>
                        {this.state.hasErrors &&
                            <div className="c">
                                <SmartFormErrorMessages className="t-c n-m-t" />
                            </div>}
                    </div>
                </Card>
                <div className="g signInFormCont c-c">
                    <div className="c t-r">
                        {string(strings, 'SIGNIN_DONT_HAVE_ACCOUNT_LABEL')} <Link className="t-s" to="/signup">{string(strings, 'SIGN_SIGN_UP_LABEL')}</Link>
                    </div>
                </div>
            </Form>

        )
    }
}

class SignIn extends Component {

    render() {
        // Used to redirect the user back to the page they arrived from once authenticated
        const { from } = this.props.location.state || { from: { pathname: "/" } }
        return (
            <AppContext.Consumer>
                {({ authenticated, cookies, user, setUser }) => <SignInWrapper from={from} authenticated={authenticated} cookies={cookies} user={user} setUser={setUser} />}
            </AppContext.Consumer>
        )
    }

}

export default SignIn