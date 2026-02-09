const Site = require('../models/Site');
const Facility = require('../models/Facility');

const getAllSites = async (req, res) => {
  try {
    const sites = await Site.getAll();
    // Get facilities for each site
    for (let site of sites) {
      site.facilities = await Facility.getBySite(site.id);
    }
    res.json(sites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSiteById = async (req, res) => {
  try {
    const site = await Site.getById(req.params.id);
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }
    site.facilities = await Facility.getBySite(site.id);
    res.json(site);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createSite = async (req, res) => {
  try {
    const { name, address } = req.body;
    const site = await Site.create(name, address);
    res.status(201).json(site);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSite = async (req, res) => {
  try {
    const { name, address } = req.body;
    const site = await Site.update(req.params.id, name, address);
    res.json(site);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteSite = async (req, res) => {
  try {
    await Site.delete(req.params.id);
    res.json({ message: 'Site deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite
};

