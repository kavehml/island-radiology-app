const Radiologist = require('../models/Radiologist');
const RadiologistSpecialty = require('../models/RadiologistSpecialty');

const getAllRadiologists = async (req, res) => {
  try {
    const radiologists = await Radiologist.getAll();
    // Add specialties for each radiologist
    for (let radiologist of radiologists) {
      radiologist.specialties = await RadiologistSpecialty.getByRadiologist(radiologist.id);
    }
    res.json(radiologists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRadiologistById = async (req, res) => {
  try {
    const radiologist = await Radiologist.getById(req.params.id);
    if (!radiologist) {
      return res.status(404).json({ error: 'Radiologist not found' });
    }
    radiologist.sites = await Radiologist.getSites(req.params.id);
    radiologist.specialties = await RadiologistSpecialty.getByRadiologist(req.params.id);
    res.json(radiologist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createRadiologist = async (req, res) => {
  try {
    const { name, email, role, workHoursStart, workHoursEnd, workDays } = req.body;
    const radiologist = await Radiologist.create(name, email, role, workHoursStart, workHoursEnd, workDays);
    res.status(201).json(radiologist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRadiologist = async (req, res) => {
  try {
    const { name, email, role, workHoursStart, workHoursEnd, workDays } = req.body;
    const radiologist = await Radiologist.update(req.params.id, name, email, role, workHoursStart, workHoursEnd, workDays);
    res.json(radiologist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const assignToSite = async (req, res) => {
  try {
    const { radiologistId, siteId } = req.body;
    await Radiologist.assignToSite(radiologistId, siteId);
    res.json({ message: 'Radiologist assigned to site' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addSpecialty = async (req, res) => {
  try {
    const { radiologistId, specialty, proficiencyLevel } = req.body;
    const result = await RadiologistSpecialty.create(radiologistId, specialty, proficiencyLevel);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeFromSite = async (req, res) => {
  try {
    const { radiologistId, siteId } = req.body;
    await Radiologist.removeFromSite(radiologistId, siteId);
    res.json({ message: 'Radiologist removed from site' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllRadiologists,
  getRadiologistById,
  createRadiologist,
  updateRadiologist,
  assignToSite,
  removeFromSite,
  addSpecialty
};

