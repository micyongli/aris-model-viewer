import React from 'react';

export default function ArisSymbolRect({x, y, w, h, fill, stroke, strokeWidth,click,transform,...other}) {

    const empty=e=>{
    };
    const onClick = click?click:empty;
    return <rect transform={transform} {...other} onClick={onClick} x={x} y={y} width={w} height={h} fill={fill} stroke={stroke}
                 strokeWidth={strokeWidth}/>
}