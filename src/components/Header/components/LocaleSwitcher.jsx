import React from 'react'

export default (props) => {
    const {
        country = 'us',
        locale = 'en_EN',
        setCountry = () => { },
        setLocale = () => { },
    } = props
    return (
        <React.Fragment>
            <a
                title="EN"
                className={(locale === 'en_EN') ? "selected t-c" : "t-c"}
                onClick={() => { setLocale('us', 'en_EN') }}
                href="javascript:void(0)">EN</a>
            <span> | </span>
            <a
                title="FR"
                className={(locale === 'fr_FR') ? "selected t-c" : "t-c"}
                onClick={() => { setLocale('fr', 'fr_FR') }}
                href="javascript:void(0)">FR</a>
        </React.Fragment>
    );
}