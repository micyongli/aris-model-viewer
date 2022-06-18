import React, {useEffect, useState} from 'react';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Draggable from "react-draggable";
import { Paper, TextField} from "@material-ui/core";

function PaperComponent(props) {
    return (
        <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} />
        </Draggable>
    );
}

const styles = (theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
    textLabel: {
        marginTop: theme.spacing(5),
    }
});

const DialogTitle = withStyles(styles)((props) => {
    const {children, classes, onClose, ...other} = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
                    <CloseIcon/>
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

const DialogContent = withStyles((theme) => ({
    root: {
        padding: theme.spacing(3),
    },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(1),
    },
}))(MuiDialogActions);


export default function ArisAttrChangeDialog({isKey, attrSolutionName, show, params, onClose, onOk, onReset}) {

    const [newAttrName, setNewAttrName] = useState('');

    function onCancel() {
        typeof onClose === 'function' && onClose();
    }

    function getValue(name) {
        return params && params[name] || {};
    }

    function onChanged(el) {
        setNewAttrName(el.target.value);
    }

    const [solutionName, setSolutionName] = useState(attrSolutionName);

    useEffect(() => {
        setSolutionName(attrSolutionName);
    }, [attrSolutionName]);

    function getSolutionDefaultName() {
        if (attrSolutionName) {
            return attrSolutionName;
        }
        const locale = getValue('attr')['locale'];
        return locale === 'zh' ? '' : locale;
    }


    function solutionOnChange(e) {
        const inputText = e.target.value;
        setSolutionName(inputText);
    }

    async function clickOk() {
        const newValue = newAttrName;
        const newSolution = solutionName;
        if (!newValue || !solutionName) {
            return;
        }
        const {guid, attr} = params;
        const {typeName} = attr;
        const formData = {
            defId: guid,
            atName: typeName,
            solution: newSolution,
            atLocale: newValue,
            isKey,
        };
        typeof onOk === 'function' && await onOk(formData);
        setSolutionName('');
        setNewAttrName('');
    }

    async function onResetMethod() {
        const {guid, attr} = params;
        const {typeName} = attr;
        const formData = {
            defId: guid,
            atName: typeName,
            isKey,
        };
        typeof onReset === 'function' && await onReset(formData);
    }


    return (
        <div>
            <Dialog onClose={onClose} aria-labelledby="customized-dialog-title" open={show}
                    maxWidth={'xs'}
                    fullWidth={true}
                    PaperComponent={PaperComponent}>
                <DialogTitle onClose={onClose} style={{cursor: 'move'}} id="draggable-dialog-title">
                    {`修改${isKey ? '键' : '值'}`}
                </DialogTitle>
                <DialogContent dividers>
                    <TextField
                        margin="dense"
                        id="name"
                        type="text"
                        fullWidth
                        label={'配置方案'}
                        autoComplete="off"
                        defaultValue={getSolutionDefaultName()}
                        onChange={solutionOnChange}
                        disabled={!!attrSolutionName}
                    />
                    <TextField
                        style={{marginTop: 20}}
                        margin="dense"
                        id="value"
                        type="text"
                        fullWidth
                        label={isKey ? '键' : '值'}
                        className={styles.textLabel}
                        disabled={true}
                        value={getValue('attr')[isKey ? 'localeValue' : 'attrValue']}
                    />
                    <TextField
                        style={{marginTop: 20}}
                        autoFocus
                        margin="dense"
                        id="new-value"
                        type="text"
                        label={isKey ? '键' : '值'}
                        className={styles.textLabel}
                        fullWidth
                        onChange={onChanged}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onResetMethod} color="secondary">
                        恢复
                    </Button>
                    <Button onClick={clickOk} color="primary">
                        保存
                    </Button>
                    <Button autoFocus onClick={onCancel} color="primary">
                        取消
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}