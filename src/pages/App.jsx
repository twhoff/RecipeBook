import React, { Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import PropTypes, { instanceOf } from 'prop-types'
import { withCookies, Cookies } from 'react-cookie'

// Config
import config from '../config'

// Global Styles
import css from '../styles/app.scss'

// Components
import { Header } from '../components'

// Routes
import Recipes from './Recipes/Recipes'
import SignUp from './SignUp/SignUp'
import SignIn from './SignIn/SignIn'

class App extends Component {
    constructor(props) {
        super(props)

        this.setLocale = this.setLocale.bind(this)
        this.setUser = this.setUser.bind(this)
        this.logout = this.logout.bind(this)

        const { cookies } = props

        this.state = {
            country: localStorage.getItem('recipebook_country') || 'us',
            locale: localStorage.getItem('recipebook_locale') || 'en_EN',
            setLocale: this.setLocale,
            cookies: cookies,
            authenticated: Boolean(this.props.cookies.get('clientId')) || false,
            user: (this.props.cookies.get('user'))
                ? { firstName: this.props.cookies.get('user') }
                : null,
            setUser: this.setUser,
            logout: this.logout,
            recipes: [],
            recipePage: 1,
            recipePageSize: 16
        }

    }

    componentDidMount() {
        // Check user session is authenticated every 5 seconds
        this.checkUser()
        setInterval(() => this.checkUser(), 5000)
    }

    setLocale(country, locale) {
        localStorage.setItem('recipebook_country', country)
        localStorage.setItem('recipebook_locale', locale)
        // Changing countries causes recipe data to be reloaded server-side
        // so it needs to be updated client-side
        this.setState({ country, locale }, () => {
            fetch(`${config.apiUrl}/setlocale/${this.state.country}/${locale}`, {
                method: 'GET',
                credentials: 'include'
            }).then((response) => {
                return response.json()
            }).then((data) => {
                if (data.status) {
                    this.setState({ recipes: [] }, () => this.checkUser())
                }
            })
        })
    }

    setUser(authenticated, user) {
        this.setState({ authenticated, user })
    }

    checkUser() {
        const clientId = this.props.cookies.get('clientId')
        if (clientId) {
            return fetch(`${config.apiUrl}/whoami`, {
                method: 'GET',
                credentials: 'include'
            }).then((response) => {
                return response.json()
            }).then((data) => {
                if (data.status) {
                    this.setUser(true, data.user)
    
                    // If recipies haven't already been loaded, now is the time to do it
                    if (!this.state.recipes.length) {
                        this.loadRecipes()
                    }
                }

                if (!data.status || clientId != data.user.id) {
                    this.logout()
                }
            })
        }
        this.logout()
        return false
    }

    logout() {
        if (this.state.authenticated) {
            this.setUser(false, null)
            this.state.cookies.set('clientId', 0, {
                path: '/',
                maxAge: 0
            })
            this.state.cookies.set('user', 0, {
                path: '/',
                maxAge: 0
            })
        }
    }

    loadRecipes() {
        // This can only happen once the user is authenticated
        if (this.state.authenticated) {
            const {
                country,
                recipePage,
                recipePageSize
            } = this.state
            fetch(`${config.apiUrl}/recipes/${recipePage}/${recipePageSize}`, {
                method: 'GET',
                credentials: 'include'
            }).then((response) => {
                return response.json()
            }).then((data) => {
                if (data.status) {
                    this.setState({ recipes: [ ...this.state.recipes, ...data.recipes ]})
                } else {
                    throw "Couldn't load recipes"
                }
            }).catch((error) => console.log(error))
        }
    }

    render() {
        return (
            <AppContext.Provider value={this.state}>
                <div className="pageWrapper">
                    <Header />
                    <Switch>
                        <AuthenticatedRoute authenticated={this.state.authenticated} path='/' exact component={Recipes} />
                        <Route path='/signup' component={SignUp} />
                        <Route path='/signin' component={SignIn} />
                    </Switch>
                </div>
            </AppContext.Provider>
        )
    }
}

const AuthenticatedRoute = ({ component: Component, authenticated, ...rest }) => {
    return (
        <Route {...rest} render={(props) => authenticated
            ? (<Component {...props} />)
            : (<Redirect to={{
                pathname: "/signin",
                state: { from: props.location }
            }}
            />)}
        />
    )
}

App.propTypes = {
    cookies: instanceOf(Cookies).isRequired
}

export const AppContext = React.createContext()

export default withCookies(App)
