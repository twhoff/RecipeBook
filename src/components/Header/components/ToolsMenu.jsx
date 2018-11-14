import React, { Component } from 'react';
import { Link } from 'react-router-dom'

// Resources
import { images } from '../resources'

// Localisation
import { strings } from '../resources'
import { string } from '../../../utils/Utils'

// Components
import Button from '../../Button/Button'
import LocaleSwitcher from './LocaleSwitcher'

// Images
const {
    UserIcon
} = images

export default (props) => {
    switch (props.locale) {
        case 'fr_FR':
            return (
                <div className="g desktopToolsGrid v-c">
                    <div className="c-hidden c-auto-l colDesktopLocale">
                        <LocaleSwitcher country={props.country} locale={props.locale} setLocale={props.setLocale} />
                    </div>
                    <div className="c-hidden c-auto-m colDesktopSignIn">
                        {!props.authenticated &&
                            <Link to="/signin">
                                <Button className="secondaryButton">{string(strings, 'BUTTON_LABEL_LOG_IN')}</Button>
                            </Link>}
                        {props.authenticated &&
                            <div className="g userMenuGrid v-c">
                                <div className="c-auto"><UserIcon className="userIcon" /></div>
                                <div className="c-auto">{props.user && props.user.firstName} ( <a href="javascript:void(0)" onClick={props.logout}>{string(strings, 'BUTTON_LABEL_LOG_OUT')}</a> )</div>
                            </div>
                        }
                    </div>
                </div>
            )
        default:
            return (
                <div className="g desktopToolsGrid v-c">
                    <div className="c-hidden c-auto-l colDesktopLocale">
                        <LocaleSwitcher country={props.country} locale={props.locale} setLocale={props.setLocale} />
                    </div>
                    {!props.authenticated &&
                        <div className="c-hidden c-auto-m colDesktopSignIn">
                            <Link to="/signup">
                                <Button className="primaryButton">{string(strings, 'BUTTON_LABEL_GET_STARTED')}</Button>
                            </Link>
                        </div>}
                    <div className="c-hidden c-auto-m colDesktopSignIn">
                        {!props.authenticated &&
                            <Link to="/signin">
                                <Button className="secondaryButton">{string(strings, 'BUTTON_LABEL_LOG_IN')}</Button>
                            </Link>}
                        {props.authenticated &&
                            <div className="g userMenuGrid v-c">
                                <div className="c-auto"><UserIcon className="userIcon" /></div>
                                <div className="c-auto">{props.user && props.user.firstName} ( <a href="javascript:void(0)" onClick={props.logout}>{string(strings, 'BUTTON_LABEL_LOG_OUT')}</a> )</div>
                            </div>
                        }
                    </div>
                </div>
            )
    }
}