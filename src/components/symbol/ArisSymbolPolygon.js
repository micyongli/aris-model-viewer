import React from 'react';

export default function ArisSymbolPolygon({points,fill,stroke,strokeWidth,transform,...other}) {
    return <polygon transform={transform} points={points} fill={fill} {...other} strokeWidth={strokeWidth} stroke={stroke}/>
}