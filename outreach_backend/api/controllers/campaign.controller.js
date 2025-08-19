//campaign.controller
const Campaign= require('../models/Campaign');
const Workspace= require('../models/Workspace');
const User=require('../models/User')
const createCampaign = async(req,res)=> {
    try {
    createdBy=req.user.userId;
    const { name, description, status, selectedTags, message, workspaceId} = req.body;

    const newCampaign = new Campaign({
      name,
      description,
      status: status || 'Draft',
      selectedTags,
      message, 
      workspaceId,
      createdBy,
    });

    await newCampaign.save();
    res.status(201).json(newCampaign);
  } catch (err) {
    console.error('Error creating campaign:', err);
    res.status(500).json({ message: 'Server error while creating campaign' });
  }
};

const getMyCampaign = async(req,res)=> {
    try {
    const {userId} = req.user;

    const campaigns = await Campaign.find({
    
      createdBy: userId
    })
    .sort({ createdAt: -1 });

    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching campaigns', error: error.message });
  }
};

const getAllCampaigns = async (req, res) => {
  try {
    const user = req.user;

    const currentWorkspaceId = user.currentWorkspaceId || user.workspaces[0].workspaceId;

    // Find all campaigns in this workspace
    const campaigns = await Campaign.find({
      workspaceId: currentWorkspaceId
    }).sort({ createdAt: -1 });

    res.status(200).json(campaigns);
  } catch (error) {
    console.error("Error in getAllCampaigns:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getCampaignById = async(req,res)=> {
     try {
    const { id } = req.params;
    const user = req.user;

    const userWorkspaceIds = user.workspaces.map(ws => ws.workspaceId.toString());

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (!userWorkspaceIds.includes(campaign.workspaceId.toString())) {
      return res.status(403).json({ message: 'You are not authorized to view this campaign' });
    }

    res.status(200).json(campaign);
  } catch (error) {
    console.error('Error in getCampaignById:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCampaignById = async(req,res)=> {
    try {
    const { id } = req.params;
    const user = req.user;
    const userWorkspaceIds = user.workspaces.map(ws => ws.workspaceId.toString());

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (!userWorkspaceIds.includes(campaign.workspaceId.toString())) {
      return res.status(403).json({ message: 'You are not authorized to update this campaign' });
    }

    // Update campaign
    const updatedCampaign = await Campaign.findByIdAndUpdate(id, req.body, { new: true });

    res.status(200).json(updatedCampaign);
  } catch (error) {
    console.error('Error in updateCampaignById:', error);
    res.status(500).json({ message: 'Server error' });
  }

};

const deleteCampaignById = async(req,res)=> {
  try {
    const { id } = req.params;
    const user = req.user;
    const userWorkspaceIds = user.workspaces.map(ws => ws.workspaceId.toString());

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Authorization: Check if user has access to the campaign's workspace
    if (!userWorkspaceIds.includes(campaign.workspaceId.toString())) {
      return res.status(403).json({ message: 'You are not authorized to delete this campaign' });
    }

    await campaign.deleteOne();

    res.status(200).json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error in deleteCampaignById:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports={createCampaign, getMyCampaign, getAllCampaigns, getCampaignById, updateCampaignById, deleteCampaignById};
