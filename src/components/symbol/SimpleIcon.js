import React from 'react';
import './SimpleIcon.css';

export default function SimpleIcon({path, viewBox, fill, className}) {

    function getViewBox() {
        if (viewBox) {
            return viewBox;
        }
        return '0 0 1024 1024'
    }

    const cn = className ? className : '';

    return <svg
        viewBox={getViewBox()}
        className={`simple-icon ${cn}`}>
        <g>
            {path ? <path d={path} fill={fill}/> : null}
        </g>
    </svg>

}