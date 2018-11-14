import React, { Component } from 'react'

// Styles
import css from './styles/Card.scss'

export default (props) => (
    <div className={"Card " + props.className}>
        {props.children}
    </div>
)
