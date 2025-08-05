const Workspace = require('../models/Workspace');

exports.createWorkspace = async (req, res) => {
  
    const { name } = req.body;

    // Extract userId from req.user (which should be set by verifyToken middleware)
    const createdBy = req.user.userId;

    const newWorkspace = new Workspace({
      name,
      createdBy,
    });

    await newWorkspace.save().then(result => {
    res.status(201).json({
      success: true,
      message: 'Workspace created successfully',
      workspace: newWorkspace
    });
    }).catch(err => {
        console.error('Workspace creation error:', err);
        res.status(500).json({
      success: false,
      message: 'Server Error',
    });
    });
 
};
 exports.getAllWorkspaces = async (req,res) => {
    try{
        const workspaces = await Workspace.find();
        res.status(200).json({
            success:true,
            workspaces,
        });
    } catch (error){
        console.error('Error fetching workspaces....... ',error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
        });
    }
 };

 exports.getWorkspaceById = async (req,res) => {
    const workspaceId = req.params.id;
    try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found' });
        }
        res.status(200).json({ success: true, workspace });
    } catch (error) {
        console.error('Error fetching workspace:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
 };

 exports.updateWorkspaceById = async (req,res) => {
    const workspaceId = req.params.id;
    try{
        const updateworkspace = await Workspace.findByIdAndUpdate(workspaceId, req.body, {new: true , runValidators: true});
        if(!updateworkspace){
            return res.status(404).json({ success: false, message: 'Workspace not found'});
        }
        res.status(200).json({ success: true, message: "workspace updated successfully ", workspace: updateworkspace});
        } catch (error) {
            console.error('Error updating workspace:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }

};

exports.deleteWorkspaceById = async (req,res) => {
    const workspaceId = req.params.id;
    try {
        const workspace = await Workspace.findByIdAndDelete(workspaceId);
        if (!workspace) {
            return res.status(404).json({ 
                success: false, 
                message: 'Workspace not found' 
            });
        }
        res.status(200).json({ success: true, message: 'Workspace deleted successfully' });
    } catch (error) {
            console.error('Error deleting workspace:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
    }
};