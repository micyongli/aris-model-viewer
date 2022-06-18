import React from 'react';

export default function ArisSymbolLine({x1, y1, x2, y2,...other}) {

    return <line x1={x1} y1={y1} x2={x2} y2={y2} {...other} stroke={'black'} strokeWidth={5}/>
}