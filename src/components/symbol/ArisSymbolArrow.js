import React, {useEffect, useState} from 'react';
import {rotate, rad, translation} from '../../utils/matrix';

const arrowPoints = [[-16, 16], [0, 0], [-16, -16]];


export function ArisSymbolArrow({sourcePoint, targetPoint}) {

    const aA = rad(sourcePoint, targetPoint);

    function resetPoints() {
        return arrowPoints.map(x=>translation(x,targetPoint)).map(x => rotate(targetPoint, x, aA)).map(x => x.join(',')).join(' ');
    }

    return <>
        <polyline points={resetPoints()} fill="none" strokeWidth="8" stroke="#5a5a5a"/>
    </>
}