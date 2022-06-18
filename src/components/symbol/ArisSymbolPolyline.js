import React from 'react';

export default function ArisSymbolPolyline({points, fill, stroke, strokeWidth, transform, ...other}) {

    return <polyline {...other} transform={transform} points={points} fill={fill} strokeWidth={strokeWidth}
                     stroke={stroke}/>
}