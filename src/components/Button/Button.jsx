import React from 'react';

import css from "./styles/Button.scss"

export default (props) => (
    <button {...props} className={"Button " + props.className}>
        {props.children}
    </button>
)