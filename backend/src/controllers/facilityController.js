const Facility = require('../models/Facility');

const updateFacility = async (req, res) => {
  try {
    const { siteId, equipmentType, quantity } = req.body;
    const facility = await Facility.create(siteId, equipmentType, quantity);
    res.json(facility);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFacilitiesBySite = async (req, res) => {
  try {
    const facilities = await Facility.getBySite(req.params.siteId);
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  updateFacility,
  getFacilitiesBySite
};

