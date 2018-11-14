import React, { Component } from 'react'
import { Link } from 'react-router-dom'

// Resources
import { images } from './resources'

// Components
import NavMenu from './components/NavMenu'
import ToolsMenu from './components/ToolsMenu'

// Styles
import css from "./styles/Header.scss"

// Context
import { AppContext } from '../../pages/App'

// Images
const {
    DesktopLogo,
    MobileLogo,
    MobileNavButton,
    ShoppingCartButton
} = images

export default () => (
    <AppContext.Consumer>
        {({ authenticated, country, locale, setLocale, user, logout }) => (
            <header className="Header l-s">
                <div className="cont c-c full">
                    <div className="g headerGrid v-c">
                        <div className="c-1-3 c-hidden-m">
                            <MobileNavButton className="mobileNavButton" />
                        </div>
                        <div className="c-1-3 c-hidden-m colMobileLogo">
                            <Link to="/">
                                <MobileLogo className="mobileLogo" />
                            </Link>
                        </div>
                        <div className="c-1-3 c-hidden-m t-r colMobileSignIn">
                            <Link to="/signup">
                                <ShoppingCartButton className="shoppingCartButton" />
                            </Link>
                        </div>
                        <div className="c-hidden c-auto-m colDesktopLogo">
                            <Link to="/">
                                <DesktopLogo className="desktopLogo" />
                            </Link>
                        </div>
                        <nav className="c-hidden c-auto-m colDesktopNav">
                            <NavMenu locale={locale} />
                        </nav>
                        <div className="c-hidden c-auto-m colTools">
                            <ToolsMenu
                                authenticated={authenticated}
                                country={country}
                                locale={locale}
                                setLocale={setLocale}
                                user={user}
                                logout={logout}
                            />
                        </div>
                    </div>
                </div>
            </header>
        )}
    </AppContext.Consumer>
)