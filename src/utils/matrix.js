import {mat2d, vec2} from 'gl-matrix';


export function mulPoint(m, p) {
    return [
        m[0] * p[0] + m[1] * p[1] + m[4],
        m[2] * p[0] + m[3] * p[1] + m[5]
    ];
}

export function screenPointToMap(p, m) {
    return vec2.transformMat2d([], p, mat2d.invert([], m));
}

export function scaleAt(point, xy) {
    const sc = mat2d.fromScaling([], xy);
    const t1 = mat2d.fromTranslation([], [-point[0], -point[1]]);
    const t2 = mat2d.fromTranslation([], [point[0], point[1]]);
    const nx = mat2d.mul([], t2, sc);
    return mat2d.mul([], nx, t1);
}

export function applyMatrix(s, t) {
    return mat2d.mul([], t, s);
}

export function applyRightMatrix(s, t) {
    return mat2d.mul([], s, t);
}

export function translation(p, xy) {
    return mulPoint(mat2d.fromTranslation([], [xy[0], xy[1]]), p);
}

export function moveTo(s, t) {
    return translation(s, vec2.subtract([], s, t));
}

export function rotate(center, point, rad) {
    const x = mulPoint(mat2d.fromRotation([], rad), translation(point, [-center[0], -center[1]]));
    return translation(x, [center[0], center[1]]);
}

export function rad(start, end) {
    return -Math.atan2(end[1] - start[1], end[0] - start[0]);
}


function transformPoint(point, refPoint, scale) {
    const [x, y] = [point[0], point[1]];
    const [rx, ry] = [refPoint[0], refPoint[1]];
    const [sx, sy] = [scale[0], scale[1]];
    const [vx, vy] = [x - rx, y - ry];
    return [rx + vx / sx, ry + vy / sy];
}


function transformPointAngle(point, refPoint, scale) {
    const [x, y] = [point[0], point[1]];
    const [rx, ry] = [refPoint[0], refPoint[1]];
    const [sx, sy] = [scale[0], scale[1]];
    const [vx, vy] = [((x - rx) * sy) / sx, ((y - ry) * sx) / sy];
    return [rx + vx, ry + vy];
}

const SCALE_LINEAR = 0;
const SCALE_FIXED_DISTANCE = 1;
const SCALE_FIXED_ANGLE = 2;

export function nonlinearTranslate(orgPointStr, refPointStr, scale) {

    if (scale.length !== 2) {
        scale = [scale[0], scale[3]];
    }
    let refPoints = null;
    if (refPointStr) {
        refPoints = refPointFromStr(refPointStr)
    }
    const points = pointsFromStr(orgPointStr);
    const result = transformByRefPoints(points, refPoints, scale)
    return pointArray2Str(result);
}

function refPointFromStr(refPointStr) {
    // example
    // 2:0,150:1 3:450,0:1
    return refPointStr.trim().split(' ').map(x => {
        const [i, p, t] = x.split(':');
        return {
            order: parseInt(i),
            scaleType: parseInt(t),
            point: p.split(',').map(y => parseInt(y))
        };
    })
}

export function pointArray2Str(points) {
    return points.map(x => `${x[0]},${x[1]}`).join(' ');
}


export function pointsFromStr(points) {
    return points.trim().split(' ').map(x => x.split(',').map(y => parseInt(y)));
}

function transformByRefPoints(orgPoints, refPoints, scale) {
    const matrix = scaleAt([0, 0], scale);
    return orgPoints.map((x, inx) => {
        const sour = mulPoint(matrix, x);
        if (!refPoints) {
            return sour;
        }
        //{order,scaleType,pint}
        const foundRefPoint = refPoints.filter((y) => y.order === inx);
        if (foundRefPoint.length <= 0) {
            return sour;
        }

        const {scaleType, point} = foundRefPoint[0];
        const newRefPoint = mulPoint(matrix, point);
        if (scaleType === SCALE_FIXED_DISTANCE) {
            return transformPoint(sour, newRefPoint, scale);
        } else if (scaleType === SCALE_FIXED_ANGLE) {
            return transformPointAngle(sour, newRefPoint, scale);
        }
        return sour;
    });
}


export function toBoundingBox(points) {
    let left = null;
    let top = null;
    let right = null;
    let bottom = null;

    function getValue(oldValue, newValue, isMin) {
        return oldValue == null ? newValue :
            (isMin ? Math.min(oldValue, newValue) : Math.max(oldValue, newValue))
    }

    points.forEach(p => {
        const [x1, y1] = p;
        left = getValue(left, x1, true);
        right = getValue(right, x1);
        top = getValue(top, y1, true);
        bottom = getValue(bottom, y1);
    });

    return [left, top, right, bottom];
}
