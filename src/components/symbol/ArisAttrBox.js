import React from 'react';

export default function CCircle({x, y, r,...other}) {
    return <circle cx={x} cy={y} r={r} stroke={'none'} {...other} fill={'#e20000'}/>
}