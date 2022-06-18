import React, { useEffect, useRef, useState } from 'react';
import './ArisSymbolSvg.css';
import { applyMatrix, scaleAt, } from '../../utils/matrix';
import { mat2d, vec2 } from 'gl-matrix'
import { ArisSymbol } from "./ArisSymbol";
import Hammer from 'hammerjs';
import { isArray } from "rxjs/internal-compatibility";

let svgIsMoving = false;
let svgLastPoint = null;
export default function ArisSymbolSvg({
    selOccId,
    pressEnter,
    searchKey,
    searchTargetCallback,
    searchNothingCallback,
    callback,
    modelData,
    onClickShape,
    selectedSymbolId,
    onSelectedModel,
}) {

    const [scale, setScale] = useState([1, 0, 0, 1, 0, 0]);

    const ref = useRef();
    const oldScale = useRef(scale);
    useEffect(() => {
        oldScale.current = scale.map(y => y);
    }, [scale]);

    const lastTouch = useRef(null);
    const testTouch = x => {
        // eslint-disable-next-line default-case
        switch (x.type) {
            case 'pinchstart': {
                lastTouch.current = oldScale.current.map(y => y);
                break;
            }
            case 'pinchmove': {
                const newScale = mat2d.multiply([], lastTouch.current,
                    scaleAt(convert([x.center.x, x.center.y], lastTouch.current),
                        [x.scale, x.scale]));
                setScale(newScale);
                break;
            }
        }
    };

    useEffect(() => {
        const h = new Hammer(ref.current);
        h.get('pinch').set({ enable: true });
        h.on('pinch pinchstart pinchend pinchmove', testTouch);
        return () => {
            h.destroy();
        };
    }, [ref.current]);

    const getOffsetByEvent = (e) => {
        const bound = ref.current.getBoundingClientRect();
        const { left, top } = bound;
        const cx = isMobile(e.type) ? e.touches[0].clientX : e.clientX;
        const cy = isMobile(e.type) ? e.touches[0].clientY : e.clientY;
        return [cx - left, cy - top];
    };

    function convert(screenPoint, sc) {
        const { a, b, c, d, e, f } = ref.current.getScreenCTM();
        const xp = vec2.transformMat2d([], screenPoint, mat2d.invert([], [a, b, c, d, e, f]));
        return vec2.transformMat2d([], xp, mat2d.invert([], sc));
    }

    /**
     * 缩放动作
     * @param ev
     */
    const onWheel = (ev) => {
        const { clientX, clientY } = ev;
        const { a, b, c, d, e, f } = ref.current.getScreenCTM();
        const xp = vec2.transformMat2d([], [clientX, clientY], mat2d.invert([], [a, b, c, d, e, f]));
        const np = vec2.transformMat2d([], xp, mat2d.invert([], scale));
        const xy = delta(ev);
        const newScale = mat2d.multiply([], scale, scaleAt(np, [xy, xy]));
        setScale(newScale);
    };


    /**
     * 缩放因子
     * @param e
     * @returns {number}
     */
    const delta = e => {
        return Math.pow(1.3, e.deltaY > 0 ? -1 : 1);
    }

    function isMobile(typeName) {
        return typeName && typeName.indexOf('touch') === 0;
    }

    const onMouseDown = e => {
        const target = e.target;
        if (target === ref.current) {
            onSelectedModel && onSelectedModel(e, modelData && modelData['data'] && modelData['data']['modelAttribute'] && modelData['data']['modelAttribute']['guid']);
        }
        const cur = getOffsetByEvent(e);
        svgIsMoving = true;
        svgLastPoint = cur;
        window.addEventListener('mouseup', onWinMouseUp);
        window.addEventListener('touchend', onWinMouseUp);
    };

    const onWinMouseUp = e => {
        svgIsMoving = false;
        window.removeEventListener('mouseup', onWinMouseUp);
        window.removeEventListener('touchend', onWinMouseUp);
    };


    const onMouseMove = e => {
        if (!svgIsMoving) {
            return;
        }
        newScale(svgLastPoint, e);
        svgLastPoint = getOffsetByEvent(e);

    };

    const newScale = (lastPoint, e) => {
        const point = getOffsetByEvent(e);
        const offset = vec2.sub([], point, svgLastPoint);
        offset[0] /= scale[0];
        offset[1] /= scale[3];
        setScale(old => mat2d.translate([], old, offset));
    }

    const onMouseUp = e => {
        if (!svgIsMoving) {
            return;
        }
        if (!isMobile(e.type)) {
            newScale(svgLastPoint, e);
        }
        svgIsMoving = false;

    };

    //重新设置中心位置
    const resetCenter = ([left, top, right, bottom]) => {
        const { width, height } = ref.current.getBoundingClientRect();
        const margin = 5;
        const [centerX, centerY] = [left + (right - left) / 2, top + (bottom - top) / 2];
        const translate = mat2d.fromTranslation([], [width / 2 - centerX, height / 2 - centerY]);
        let sx = Math.min((height - 2 * margin) / (bottom - top), (width - 2 * margin) / (right - left));
        if (sx > 0.3) {
            sx = 0.3;
        }
        const newMatrix = applyMatrix(translate, scaleAt([width / 2, height / 2], [sx, sx]))
        setScale(newMatrix);
    };

    function screenPoint2Map(xy, mat) {
        return vec2.transformMat2d([], xy, mat2d.invert([], mat));
    }

    const moveToTarget = ([x, y, w, h]) => {
        const { width, height } = ref.current.getBoundingClientRect();
        const { a, b, c, d, e, f } = ref.current.getScreenCTM();
        const lt = screenPoint2Map(screenPoint2Map([0, 0], [a, b, c, d, e, f]), scale);
        const rb = screenPoint2Map(screenPoint2Map([width, height], [a, b, c, d, e, f]), scale);
        //视区内不移动图形
        if (lt[0] <= x && rb[0] >= (x + w) && lt[1] <= y && rb[1] >= (y + h)) {
            return;
        }
        const sp = vec2.transformMat2d([], [width / 2, height / 2], mat2d.invert([], [a, b, c, d, e, f]));
        const centerPoint = vec2.transformMat2d([], sp, mat2d.invert([], scale));
        const r = vec2.subtract([], centerPoint, [x + w / 2, y + h / 2]);
        const newScale = mat2d.multiply([], scale, mat2d.fromTranslation([], r));
        setScale(newScale);
    };

    const [currentSearchKey, setCurrentSearchKey] = useState(searchKey);
    const [targetIndex, setTargetIndex] = useState(-1);
    const [targetId, setTargetId] = useState(null);


    useEffect(() => {
        if (!searchKey) {
            setTargetIndex(null);
            setTargetId(null);
            setCurrentSearchKey(null);
            return;
        }
        const objects = searchedObjects(searchKey);
        const targetCount = objects.length;
        if (targetCount === 0) {
            searchNothingCallback && searchNothingCallback();
        }
        if (currentSearchKey !== searchKey) {
            const x = targetCount > 0 ? 0 : -1;
            setTargetIndex(x);
            setCurrentSearchKey(searchKey);
            setTargetId(x >= 0 ? objects[0]['occId'] : null);
            return;
        }
        if (targetCount <= 0) {
            setTargetIndex(-1);
            setTargetId(null);
            return;
        }
        if (targetIndex >= targetCount - 1) {
            setTargetIndex(0);
            setTargetId(objects[0]['occId']);
            return;
        }
        setTargetIndex(targetIndex + 1);
        setTargetId(objects[targetIndex + 1]['occId']);
    }, [searchKey, pressEnter]);

    useEffect(() => {
        if (targetId) {
            searchTargetCallback && searchTargetCallback(targetId);
        }
    }, [targetId]);

    const searchedObjects = (key) => {
        if (!modelData || !modelData.data || !isArray(modelData.data.obj)) {
            return [];
        }
        return modelData['data']['obj'].filter(x => x['name'] && x['name'].indexOf(key) >= 0);
    };

    const svgStyle = {
        display: 'flex',
        border: '2px dashed #ddd',
        flex: '10',
        margin: '1px',
        backgroundColor:'whitesmoke'
    };

    return <svg ref={ref}
        style={svgStyle}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onMouseDown}
        onTouchEnd={onMouseUp}
        onTouchMove={onMouseMove}

        onWheel={onWheel}
        onMouseDown={onMouseDown}>
        <g transform={`matrix(${scale.join(',')})`}>
            <ArisSymbol
                xy={scale}
                moveToTarget={moveToTarget}
                searchTargetId={targetId}
                searchKey={currentSearchKey}
                selectedSymbolId={selectedSymbolId}
                onClickShape={onClickShape}
                onSelectedModel={onSelectedModel}
                resetCenter={resetCenter} modelData={modelData}
                callback={callback} />
        </g>
    </svg>
}