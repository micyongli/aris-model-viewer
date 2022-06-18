import React from 'react';

export default function ArisSymbolEllipse({cx, cy, rx, ry, fill, ...other}) {

    return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} {...other}/>
}