import {useLayoutEffect, useRef, useState} from "react";
import {Tooltip} from "@material-ui/core";

export function ArisReplaceText({xy, x, y, width, height, txt, fontSize,}) {
    const fs = !fontSize ? 32 : fontSize;
    const r = useRef();
    const [currentText, setCurrentText] = useState(txt);
    const [realWidth, setRealWidth] = useState({x, y, width, height});

    function cal(parent, txt, maxWidth, fontSize) {
        let cur = txt;
        const nx = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nx.style.fontSize = fontSize;
        parent.appendChild(nx);
        let flag = 0;
        for (; ;) {
            nx.textContent = cur + (flag > 0 ? '...' : '');
            const w = nx.getBBox().width ;
            if (w <= maxWidth) {
                break;
            }
            cur = cur.substr(0, cur.length - 1);
            flag++;
        }
        parent.removeChild(nx);
        return cur + (flag > 0 ? '...' : '');
    }

    function measure(parent, txt, fontSize) {
        const nx = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nx.style.fontSize = fontSize;
        nx.textContent = txt;
        parent.appendChild(nx);
        const s = nx.getBBox();
        parent.removeChild(nx);
        return s;
    }

    useLayoutEffect(() => {
        const parent = r.current.parentNode;
        let rect = measure(parent, txt, fs);
        if (rect.width > width) {
            const t = cal(parent, txt, width, fs, 1);
            rect = measure(parent, t, fs);
            setCurrentText(t);
        } else {
            setCurrentText(txt);
        }
        setRealWidth({x: rect.x, y: rect.y, width: rect.width , height: rect.height });
    }, [x, y, height, txt, width]);

    return (
        <Tooltip title={txt}>
            <text
                ref={r}
                x={x + width / 2 - realWidth.width / 2}
                dy={realWidth.height - 8}
                y={y + height / 2 - realWidth.height / 2}
                style={{fontSize: fs}}
                fill={'black'}>
                {currentText}
            </text>
        </Tooltip>
    );
}