import React from 'react';

export default function ArisAssignIcon({x, y, w, h, fill, stroke, strokeWidth, click}) {

    const empty = e => {
    };
    const bw = w / 4;
    //取个近似图吧
    const onClick = click ? click : empty;
    return (
        <>
            <g>
                <rect onClick={onClick} x={x} y={y} width={w} height={h} fill={fill} stroke={stroke}
                      strokeWidth={strokeWidth}/>
                <rect onClick={onClick} x={x + w / 2 - bw / 2} y={y + h / 6} width={bw} height={bw} fill={'white'}/>
                <rect onClick={onClick} x={x + w / 4 - bw / 2} y={y + 2 * h / 3} width={bw} height={bw} fill={'white'}/>
                <rect onClick={onClick} x={x + w / 4 - bw / 2} y={y + 2 * h / 3} width={bw} height={bw} fill={'white'}/>
                <rect onClick={onClick} x={x + w / 2 + w / 4 - bw / 2} y={y + 2 * h / 3} width={bw} height={bw}
                      fill={'white'}/>
                <rect onClick={onClick} x={x + w / 2 - w / 3} y={y + h / 2} width={2 * w / 3} height={bw / 4}
                      fill={'white'}/>
            </g>
        </>
    );
}