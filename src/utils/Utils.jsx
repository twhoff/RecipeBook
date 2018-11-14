import React from 'react'
import { renderToString } from 'react-dom/server'
import { AppContext } from '../pages/App'

// Utility function to get localised string
export const string = (strings, string, ...params) => {

    string = strings[string] || string

    if (typeof string === "string") {
        return `BAD_REF: ${string}`
    } else {
        return decode(renderToString(
            <AppContext.Consumer>
                {(state) => (
                    format((typeof string[state.locale] === 'undefined') ? string['en_EN'] : string[state.locale], params)
                )}
            </AppContext.Consumer>
        ))
    }
}

// Function used to format strings with tokens (such as {0}, {1}, {2})
// Useful for localisation
const format =
    (string, tokens) =>
        string.replace(/{(\d+)}/g, (match, number) =>
            typeof tokens[number] != 'undefined' ? tokens[number] : match)

const decode = (string) => string.replace(/&#x(\d+);/g, (match, number) => String.fromCharCode(parseInt(number, 16)))