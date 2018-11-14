import React from 'react'

// Localisation
import { strings } from '../resources'
import { string } from '../../../utils/Utils'

export default (props) => {
    switch (props.locale) {
        case 'fr_FR':
            return (
                <ul className="g navGrid">
                    <li className="c-auto"><a href="#">{string(strings, 'MENU_ITEM_OUR_PLANS')}</a></li>
                    <li className="c-auto"><a href="#">{string(strings, 'MENU_ITEM_HOW_IT_WORKS')}</a></li>
                    <li className="c-auto"><a href="#">{string(strings, 'MENU_ITEM_OUR_PHILOSOPHY')}</a></li>
                    <li className="c-hidden c-auto-l"><a href="#">{string(strings, 'MENU_ITEM_HELP')}</a></li>
                </ul>
            )
        default:
            return (
                <ul className="g navGrid">
                    <li className="c-auto"><a href="#">{string(strings, 'MENU_ITEM_OUR_PLANS')}</a></li>
                    <li className="c-auto"><a href="#">{string(strings, 'MENU_ITEM_HOW_IT_WORKS')}</a></li>
                    <li className="c-auto"><a href="#">{string(strings, 'MENU_ITEM_OUR_MENUS')}</a></li>
                    <li className="c-hidden c-auto-l"><a href="#">{string(strings, 'MENU_ITEM_WINES')}</a></li>
                    <li className="c-hidden c-auto-l"><a href="#">{string(strings, 'MENU_ITEM_GIFTS')}</a></li>
                </ul>
            )
    }
}

