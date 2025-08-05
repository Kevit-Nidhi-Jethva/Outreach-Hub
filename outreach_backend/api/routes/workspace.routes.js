const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const workspaceController = require('../controllers/workspace.controller');

router.post('/create', verifyToken, workspaceController.createWorkspace);
router.get('/list', verifyToken, workspaceController.getAllWorkspaces);
router.get('/:id', verifyToken, workspaceController.getWorkspaceById);
router.put('/update/:id',verifyToken, workspaceController.updateWorkspaceById);
router.delete('/delete/:id', verifyToken, workspaceController.deleteWorkspaceById);

module.exports = router;
