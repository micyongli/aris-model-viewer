import React, {useEffect, useState, useRef} from 'react';

export default function ArisSymbolText({x, y, txt, cl,...other}) {
    const [point, setPoint] = useState([x, y]);
    const txtRef = useRef();
    useEffect(() => {
        const {width, height} = txtRef.current.getBoundingClientRect();
        setPoint([x, y + height*0.48]);
    }, [txt]);
    return <text ref={txtRef} className={cl} {...other} x={point[0]} y={point[1]}>{txt}</text>;
}