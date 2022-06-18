import React, {useState, useEffect} from 'react';
import './PrimaryIcon.css';
import {Tooltip} from 'antd'

const normalColor = '#999';
const activeColor = '#1776BF';
const overColor = '#333';

export default function PrimaryIcon({active, title, path, onClick, viewBox}) {
    const [selected, setSelected] = useState(false);
    const [fill, setFill] = useState(normalColor);

    useEffect(() => {
        setSelected(active);
    }, [active])

    function over() {
        setFill(overColor);
    }

    function out() {
        setFill(normalColor)
    }

    function click() {
        const b = !selected;
        setSelected(b);
        typeof onClick === 'function' && onClick(b);
    }

    function getViewBox() {
        if (viewBox) {
            return viewBox;
        }
        return '0 0 1024 1024'
    }

    function renderSvg() {
        return <svg
            onMouseOver={over}
            onClick={click}
            onMouseOut={out}
            viewBox={getViewBox()}
            className={'icon'}>
            <g>
                {path ? <path d={path} fill={selected ? activeColor : fill}/> : null}
            </g>
        </svg>
    }

    if (typeof title === 'undefined') {
        return renderSvg();
    }

    return <Tooltip title={title}>
        {renderSvg()}
    </Tooltip>;
}