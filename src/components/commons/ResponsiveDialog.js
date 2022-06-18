import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {useTheme} from '@material-ui/core/styles';

export default function ResponsiveDialog({title, open, visibleAction, onOk, onCancel,children}) {

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const handleOk = () => {
        onOk && onOk();
    };

    const handleClose = () => {
        onCancel && onCancel();
    };

    return (
        <Dialog
            fullScreen={fullScreen}
            open={open}
            onClose={handleClose}
            aria-labelledby="responsive-dialog-title"
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {children}
                </DialogContentText>
            </DialogContent>
            {visibleAction ? <DialogActions>
                <Button autoFocus onClick={handleOk} color="primary">
                    确定
                </Button>
                <Button onClick={handleClose} color="primary" autoFocus>
                    取消
                </Button>
            </DialogActions> : null
            }
        </Dialog>

    );
}