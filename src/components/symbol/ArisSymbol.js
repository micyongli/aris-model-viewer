import React, { useEffect, useMemo, useState } from 'react';
import ArisSymbolRect from "./ArisSymbolRect";
import ArisSymbolImage from "./ArisSymbolImage";
import ArisSymbolPolygon from "./ArisSymbolPolygon";
import ArisSymbolPolyline from "./ArisSymbolPolyline";
import ArisSymbolEllipse from "./ArisSymbolEllipse";
import './ArisSymbol.css';
import ArisAssignIcon from "./ArisAssignIcon";
import { mulPoint, scaleAt, toBoundingBox, nonlinearTranslate, pointsFromStr, pointArray2Str } from '../../utils/matrix';
import { ArisSymbolArrow } from "./ArisSymbolArrow";
import { makeStyles } from '@material-ui/core/styles';
import useStore from "../../store/useStore";
import { ArisReplaceText } from "./ArisReplaceText";
import { IEVersion } from "../../utils/ie";
import { isArray } from "lodash";

const useStyles = makeStyles(theme => ({
    connectLine: {
        fontSize: 60,
        display: "flex",
        justifyItems: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        height: '100%',
        fontWeight: 600,
    },
    symbolText: {
        fontSize: 32,
        display: "flex",
        justifyItems: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        height: '100%',
    },
    leftSymbolText: {
        fontSize: 32,
        display: "flex",
        justifyItems: 'center',
        alignItems: 'center',
        justifyContent: 'left',
        flexWrap: 'wrap',
        height: '100%',

    },
    rightSymbolText: {
        fontSize: 32,
        display: "flex",
        justifyItems: 'center',
        alignItems: 'center',
        justifyContent: 'right',
        flexWrap: 'wrap',
        height: '100%',

    },

}));


export function ArisSymbol({
    xy,
    moveToTarget,
    searchKey,
    searchTargetId,
    selectedSymbolId,
    callback,
    modelData,
    resetCenter,
    onClickShape,
}) {

    const styles = useStyles();
    const [stat] = useStore();
    const [high, setHigh] = useState([]);


    function renderHighLightObjects() {
        return high.map((x, inx) => null);
    }

    useEffect(() => {
        if (searchKey && searchTargetId) {
            if (modelData && modelData['data'] && modelData['data']['obj']) {
                const targetObjects = modelData['data']['obj'].filter(x => x['occId'] === searchTargetId);
                if (targetObjects.length > 0) {
                    const [first] = targetObjects;
                    const { x, y, width, height } = first;
                    moveToTarget && moveToTarget([x, y, width, height]);
                }
            }
            if (modelData && modelData['data'] && modelData['data']['obj']) {
                const targetObjects = modelData['data']['obj'].filter(x => x['placements'].filter(y => y.label.indexOf(searchKey) >= 0).length > 0);
                setHigh(targetObjects);
            }
        } else {
            setHigh([]);
        }

    }, [searchKey, searchTargetId])

    const jumpAssign = (item) => {
        if (callback) {
            callback(item);
        }
    };

    function getModelOutline() {
        if (!modelData) {
            return [0, 0, 0, 0];
        }
        const { obj } = modelData.data;
        let [modelLeft, modelTop, modelRight, modelBottom] = [0, 0, 0, 0];
        let isInit = false;
        obj.forEach((item) => {
            const { x, y, width, height } = item;
            if (isInit) {
                modelLeft = Math.min(modelLeft, x);
                modelTop = Math.min(modelTop, y);
                modelRight = Math.max(x + width, modelRight);
                modelBottom = Math.max(y + height, modelBottom);
            } else {
                modelLeft = x;
                modelTop = y;
                modelBottom = y + height;
                modelRight = x + width;
                isInit = true;
            }
        });
        return [modelLeft, modelTop, modelRight, modelBottom];
    }

    function center(outline) {
        return typeof resetCenter === 'function' && resetCenter(outline);
    }


    useEffect(() => {
        if (!modelData || !modelData.data) {
            return;
        }
        center(getModelOutline());
    }, [modelData]);


    const clickShape = (shape, e) => {
        typeof onClickShape === 'function' && onClickShape({
            occId: shape['occId'],
            type: 'symbol',
        });
    };

    //选择框绘制
    function drawSelectedShape(selectedObject, data, xxyy) {

        const { id, type } = selectedObject;
        if (type === 'model') {
            return;
        }
        const sel = data.filter(x => x['occId'] === id);
        if (sel.length === 0) {
            return;
        }
        const { x, y, width, height } = sel[0];
        const w = width;
        const h = height;
        const rectWidth = 4;
        const scaleXY = xxyy[0];
        const points = [
            [x, y],
            [x + w / 2, y],
            [x + w, y],

            [x, y + h / 2],
            [x + w, y + h / 2],

            [x, y + h],
            [x + w / 2, y + h],
            [x + w, y + h],
        ];
        return (<g>
            <rect x={x} y={y} width={width} height={height} fill='none' stroke='black' strokeWidth={1 / scaleXY} />
            {
                points.map((it, index) => <circle key={index} cx={it[0]} cy={it[1]} fill='white' stroke='black' strokeWidth={1 / scaleXY} r={rectWidth / scaleXY} />)
            }

        </g>);

    }

    /**
     * 放置特性显示示意
     *   (1-11，当innerBoundBox无效时，则使用图形中心位置处理)
     *
     *    1        2       3
     *       +++++++++++++
     *       |     10    |
     *    4  |     05    | 6
     *       |     11    |
     *       +++++++++++++
     *    7        8       9
     *
     *    随意放置(=12):
     *    offsetX,offsetY 距离符号中心位置的偏移(=12时有效)
     *                  +
     *                  |
     *                  |
     *          - ------o------ +
     *                  |
     *                  |
     *                  -
     *     textBoxWidth,textBoxHeight 文本框尺寸(=12时有效)
     *
     *     textAlign: 0=左对齐，1=中对齐，2=右对齐(=12时有效)
     *
     */

    // function pars(v, offset) {
    //     const c = (v >>> 0).toString(16);
    //     const s = c.substr(offset, 2);
    //     if (s === '') {
    //         return 0;
    //     }
    //     return parseInt(s, 16);

    // }

    // function zeroRepeat(s, n) {
    //     let z = s.length;
    //     let v = '';
    //     for (let i = 0; i < n - z; i++) {
    //         v += "0";
    //     }
    //     return v + s;
    // }

    // function toRgb(v) {
    //     if (v === -1) {
    //         //rgba(0,0,0,1)
    //         //rgb(0,0,1)
    //         return null;
    //     }
    //     if (typeof v === 'number') {
    //         if (v < 0) {
    //             const a = pars(v, 0);
    //             const r = pars(v, 6);
    //             const g = pars(v, 4);
    //             const b = pars(v, 2);
    //             return `rgba(${r},${g},${b},${(a / 255).toFixed(1)})`;
    //         } else {
    //             return `#${zeroRepeat(v.toString(16), 6)}`;
    //         }
    //     }
    //     return v;
    // }

    function toPixel(mm) {
        const dpi = 96;
        return dpi / 25.4 * mm;
    }

    /**
     * 符号
     * @param index
     * @param item
     * @param modelAttr
     */
    function drawSymbol(index, item, modelAttr) {

        const {
            x,
            y,
            symbolObject,
            width,
            height,
            modelDTOList,
            fillColor,
            defineGuid,
        } = item;

        if (!symbolObject) {
            return;
        }

        const { children } = symbolObject;
        const outlinePoints = children.filter(child => child.type === 'outline')[0];
        let [, , outlineRight, outlineBottom] = toBoundingBox(pointsFromStr(outlinePoints.points));
        let hasReferencePoints = !!item['referencePoints'];
        const outlineWidth = outlineRight; /*- outlineLeft*/
        const outlineHeight = outlineBottom; /*- outlineTop*/
        const sx = width / outlineWidth;
        const sy = height / outlineHeight
        const trans = [sx, 0, 0, sy, 0, 0];


        function renderText(symbolItem, isHighLight) {

            const { placements, width, height } = symbolItem;
            let lX = 0;
            let lY = 0;
            let lW = width;
            let lH = height;
            let defaultStyle = styles.symbolText;
            const innerBox = symbolObject['innerBoundBox'];
            const referencePoints = symbolObject['referencePoints'];
            if (innerBox && referencePoints) {
                const [ibLeft, ibTop, ibWidth, ibHeight] = innerBox.split(',').map(x => parseInt(x));
                const rectSize = [[ibLeft, ibTop], [ibLeft + ibWidth, ibTop], [ibLeft + ibWidth, ibTop + ibHeight], [ibLeft, ibTop + ibHeight]];
                const innerBoxPoints = nonlinearTranslate(pointArray2Str(rectSize), referencePoints, trans);
                //transformShape(rectSize, stringToReferencePoints(referencePoints), trans);
                const [xy1, xy2, xy3, xy4] = toBoundingBox(pointsFromStr(innerBoxPoints));
                lX = xy1;
                lY = xy2;
                lW = xy3 - xy1;
                lH = xy4 - xy2;
            } else {
                lX = 0;
                lY = 0;
                lW = width;
                lH = height;
            }
            const orgX = lX;
            const orgY = lY;
            const orgWidth = lW;
            const orgHeight = lH;
            const lineHeight = 50;
            const lineWidth = 320;
            return placements.map((txt, txtIndex) => {
                lX = orgX;
                lY = orgY;
                lW = orgWidth;
                lH = orgHeight;
                const { placement, offsetX, offsetY } = txt;
                switch (placement) {
                    case 1: {
                        lX = -lineWidth;
                        lY = -lineHeight;
                        lW = lineWidth;
                        lH = lineHeight;
                        defaultStyle = styles.rightSymbolText;
                        break;
                    }
                    case 2: {
                        lX = width / 2 - lineWidth / 2;
                        lY = -lineHeight;
                        lW = lineWidth;
                        lH = lineHeight;
                        break;
                    }
                    case 3: {
                        lX = width;
                        lY = -lineHeight;
                        lW = lineWidth;
                        lH = lineHeight;
                        defaultStyle = styles.leftSymbolText;
                        break;
                    }
                    case 4: {
                        lX = -lineWidth;
                        lY = (height - lineHeight) / 2;
                        lW = lineWidth;
                        lH = lineHeight;
                        defaultStyle = styles.rightSymbolText;
                        break;
                    }
                    case 10: {
                        lH = lineHeight;
                        break;
                    }
                    case 11: {
                        lY = lH + lY - lineHeight;
                        lH = lineHeight;
                        break;
                    }
                    case 5: {
                        lX = orgX;
                        lY = orgY;
                        lW = orgWidth;
                        lH = orgHeight;
                        break;
                    }
                    case 6: {
                        lX = width;
                        lY = (height - lineHeight) / 2;
                        lW = lineWidth;
                        lH = lineHeight;
                        defaultStyle = styles.leftSymbolText;
                        break;
                    }
                    case 7: {
                        lX = -lineWidth;
                        lY = height;
                        lW = lineWidth;
                        lH = lineHeight;
                        defaultStyle = styles.rightSymbolText;
                        break;
                    }
                    case 8: {
                        lX = width / 2 - lineWidth / 2;
                        lY = height;
                        lW = lineWidth;
                        lH = lineHeight;
                        break;
                    }
                    case 9: {
                        lX = width;
                        lY = height;
                        lW = lineWidth;
                        lH = lineHeight;
                        defaultStyle = styles.leftSymbolText;
                        break;
                    }
                    //随意放置
                    case 12: {
                        lX = width / 2 - lineWidth / 2 + offsetX;
                        lY = height / 2 - lineHeight / 2 + offsetY;
                        lW = lineWidth;
                        lH = lineHeight;
                        break;
                    }
                    default: {

                    }
                }

                const searchTxtLen = searchKey ? searchKey.length : 0;
                const label = txt['label'];
                const outline = searchTxtLen > 0 && label.indexOf(searchKey) >= 0;
                let tmp = [];
                if (outline) {
                    tmp = label.split(searchKey);
                }
                const highLightStyle = {
                    fontWeight: 'normal',
                    color: 'red',
                    backgroundColor: 'yellow'
                };

                return (
                    IEVersion() === -1 ?
                        <foreignObject
                            style={{ overflow: 'unset' }}
                            key={`__txt_${txtIndex}`}
                            onMouseDown={e => clickShape(item, e)}
                            x={lX}
                            y={lY}
                            width={lW}
                            height={lH}>
                            <div className={defaultStyle}>

                                {outline ? (tmp.map((x, inx) => {
                                    return [x ?
                                        <strong key={`${inx}_1`}
                                            style={{ fontWeight: 'normal' }}>{x}</strong> : null, (inx < tmp.length - 1) ?
                                        <strong key={`${inx}_2`}
                                            style={highLightStyle}>{searchKey}</strong> : null]
                                })) : (isHighLight ? <strong style={highLightStyle}>{label}</strong> : label)}
                            </div>
                        </foreignObject> :
                        <ArisReplaceText xy={xy} key={2} x={lX} y={lY} width={lW} height={lH} txt={label} />
                );

            });

        }

        let hasAssigned = false;
        const { guid } = modelAttr;
        const symbol = children.map((child, childIndex) => {
            const { type } = child;
            switch (type) {
                case 'rect': {
                    const { fill, stroke, strokeWidth, width, height, x, y, rx, ry, fillReplaceable } = child;
                    const fill_color = (fillColor && fillReplaceable) ? fillColor : fill;
                    return (<ArisSymbolRect onMouseDown={e => clickShape(item, e)}
                                            key={`obj_rect_${childIndex}_${index}`}
                                            rx={rx ? 10 : 0} ry={ry ? 10 : 0}
                                            fill={fill_color} x={x} y={y} w={width * sx} h={height * sy}
                                            stroke={stroke} strokeWidth={strokeWidth} />);
                }
                case 'polyline': {

                    const { points, referencePoints, strokeWidth, stroke, fill, fillReplaceable } = child;
                    const fill_color = (fillColor && fillReplaceable) ? fillColor : fill;
                    const pointsStr = nonlinearTranslate(points, referencePoints, trans);
                    return <ArisSymbolPolyline onMouseDown={e => clickShape(item, e)}
                                               key={`polyline_${childIndex}_${index}`}
                                               points={pointsStr}
                                               strokeWidth={strokeWidth} stroke={stroke} fill={fill_color} />;
                }
                case 'polygon': {
                    const { points, referencePoints, strokeWidth, stroke, fill, fillReplaceable } = child;
                    const pointsStr = nonlinearTranslate(points, referencePoints, trans)
                    const fill_color = (fillColor && fillReplaceable) ? fillColor : fill;
                    return <ArisSymbolPolygon onMouseDown={e => clickShape(item, e)}
                                              key={`polygon__${childIndex}_${index}`}
                                              points={pointsStr}
                                              strokeWidth={strokeWidth} stroke={stroke} fill={fill_color} />;
                }
                case 'assignBox': {
                    hasAssigned = true;
                    if (!modelDTOList || modelDTOList.length === 0) {
                        return null;
                    }
                    if (modelDTOList.filter(x => x['modelGuid'] !== guid).length === 0) {
                        return null;
                    }
                    const aX = child.x;
                    const aY = child.y;
                    const aW = child.width;
                    const aH = child.height;
                    return <ArisAssignIcon click={() => jumpAssign(modelDTOList)}
                                           key={`obj_assign_box__${childIndex}_${index}`}
                                           x={aX}
                                           y={aY}
                                           w={aW}
                                           h={aH}
                                           fill={'#585858'}
                                           stroke={'none'}
                                           strokeWidth={5} />;
                }
                case 'ellipse': {
                    const { fill, cx, cy, rx, ry, fillReplaceable } = child;
                    const fill_color = (fillColor && fillReplaceable) ? fillColor : fill;
                    const newPoint = mulPoint(scaleAt([0, 0], [sx, sy]), [cx, cy]);
                    return (<ArisSymbolEllipse onMouseDown={e => clickShape(item, e)}
                                               key={`obj_ellipse__${childIndex}_${index}`}
                                               cx={newPoint[0]} cy={newPoint[1]} rx={rx * sx} ry={ry * sy}
                                               fill={fill_color} />);

                }
                case 'image': {
                    if (child.id === 'image3') {
                        const image = child;
                        const iW = image.width;
                        const iH = image.height;
                        const iX = hasReferencePoints ? image.x : ((width - iW) / 2);
                        const xlink = image.xlinkHref;
                        return <ArisSymbolImage onMouseDown={e => clickShape(item, e)}
                                                key={`img__icon`} x={iX}
                                                y={(height - iH) / 2} w={iW} h={iH} xlink={xlink} />
                    } else if (!child.id) {
                        const { x, y, xlinkHref } = child;
                        return <ArisSymbolImage onMouseDown={e => clickShape(item, e)}
                                                key={`img__content_${childIndex}_${index}`} x={x}
                                                y={y} w={width} h={height} xlink={xlinkHref} />
                    }
                    return null;
                }
                default: {
                    return null;
                }
            }
        });
        if (!hasAssigned && modelDTOList && modelDTOList.length > 0) {
            if (modelDTOList.filter(x => x['modelGuid'] !== guid).length !== 0) {
                const aX = -60;
                const aY = 0;
                const aW = 46;
                const aH = 46;
                symbol.push(<ArisAssignIcon click={() => jumpAssign(modelDTOList)}
                                            key={`obj_assign_box_no_assigned_`}
                                            x={aX}
                                            y={aY}
                                            w={aW}
                                            h={aH}
                                            fill={'#585858'}
                                            stroke={'none'}
                                            strokeWidth={5} />);
            }
        }
        if (stat.highDefines.indexOf(defineGuid) >= 0) {
            symbol.push(<rect
                key={`${symbol.length}_outline`}
                x={-10}
                y={-10}
                width={outlineWidth + 20}
                height={outlineHeight + 20}
                fill={'none'}
                strokeWidth={5}
                stroke={'#ff9e00'}
                strokeDasharray={'20'}
            />)
        }
        return (
            <g key={`g_${index}`} transform={`translate(${x},${y})`}>
                {symbol}
                {renderText(item, stat.highDefines.indexOf(defineGuid) >= 0)}
                {renderHighLightObjects()}
            </g>
        );
    }

    function drawLine(index, x) {
        const {
            linePoint,
            sourceArrow,
            targetArrow,
            sourceDef,
            targetDef,
            visible,
            color,
            width,
            style,
            placements
        } = x;
        if (!visible) {
            return;
        }

        const linkLinePoints = pointsFromStr(linePoint);
        const lineStyle = {};
        if (style === 1) {
            lineStyle['strokeDasharray'] = "50,20";
        } else if (style === 2) {
            lineStyle['strokeDasharray'] = '5,5';
        }
        const ret = [];
        ret.push(
            <ArisSymbolPolyline {...lineStyle} key={`cxn_${index}`} points={linePoint} fill={'none'} stroke={color}
                                strokeWidth={width} />);
        if (targetArrow > 0) {
            const lastPoint = linkLinePoints[linkLinePoints.length - 1];
            const sx = linkLinePoints[linkLinePoints.length - 2];
            ret.push(<ArisSymbolArrow key={`arrow_${index}`} sourcePoint={sx} targetPoint={lastPoint} />)
        }
        if (sourceArrow > 0) {
            const lastPoint = linkLinePoints[1];
            const sx = linkLinePoints[0]
            ret.push(<ArisSymbolArrow key={`arrow_${index}`} sourcePoint={sx} targetPoint={lastPoint} />)
        }
        //链接中心
        placements.forEach((p, pInx) => {
            const [l, t, r, b] = toBoundingBox(linkLinePoints);
            const txtWidth = 400;
            const txtHeight = 200;
            const { offsetX, offsetY } = p;
            const center = [l + (r - l) / 2 + toPixel(offsetX / 10), t + (b - t) / 2 + toPixel(offsetY / 10)];
            ret.push(<foreignObject width={txtWidth}
                height={txtHeight}
                key={`foreign_${pInx}_${index}`}
                x={center[0] - txtWidth / 2}
                y={center[1] - txtHeight / 2}>
                <div key={`foreign_${pInx}_${index}_label_`} className={styles.connectLine}>{p['label']}</div>
            </foreignObject>);
        });
        return ret;
    }

    //绘制
    function drawObject() {

        if (!modelData || !modelData.data) {
            return;
        }
        const { obj, modelAttribute, line, arisComObjOcc } = modelData.data;
        if (!modelAttribute) {
            return;
        }
        //以层级关系，排序
        const lineList = [];
        const merge = [];
        obj.forEach(x => {
            merge.push({ type: 'symbol', data: x, level: x['levelOrder'] });
        });
        line.forEach(x => merge.push({ type: 'line', data: x, level: x['levelOrder'] }));
        if (isArray(arisComObjOcc)) {
            arisComObjOcc.forEach(x => {
                merge.push({ type: 'comObjOcc', data: x, level: x['levelOrder'] });
            })
        }
        merge.sort((a, b) => a.level - b.level);
        merge.forEach((x, inx) => {
            const { data, type } = x;
            switch (type) {
                case 'symbol': {
                    lineList.push(drawSymbol(inx, data, modelAttribute))
                    break;
                }
                case 'line': {
                    lineList.push(drawLine(inx, data));
                    break;
                }
                case 'comObjOcc': {
                    lineList.push(drawComObj(inx, data));
                    break;
                }
                default: {

                }
            }
        });
        return lineList;
    };

    function drawComObj(inx, x) {
        return <image xlinkHref={x.image} key={`${inx}__com_obj`} x={x.x} y={x.y} width={x.width} height={x.height} />;
    }


    //优化的力道
    const memo = useMemo(() => modelData && drawObject(), [modelData, searchKey]);
    const selected = useMemo(() => modelData && selectedSymbolId && drawSelectedShape(selectedSymbolId, (modelData && modelData['data'] && modelData['data']['obj']) || [], xy), [xy, modelData, selectedSymbolId]);
    return (
        < >
            {memo}
            {selected}
        </>
    );
}