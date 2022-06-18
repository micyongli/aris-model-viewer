import React from 'react';

export default function ArisSymbolImage({x, y, w, h, xlink, ...other}) {
    return <image x={x} y={y} width={w} height={h} {...other} xlinkHref={xlink}/>
}