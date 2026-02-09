const Procedure = require('../models/Procedure');
const RadiologistProcedureTime = require('../models/RadiologistProcedureTime');

const getAllProcedures = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      bodyPart: req.query.bodyPart
    };
    const procedures = await Procedure.getAll(filters);
    res.json(procedures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProcedureById = async (req, res) => {
  try {
    const procedure = await Procedure.getById(req.params.id);
    if (!procedure) {
      return res.status(404).json({ error: 'Procedure not found' });
    }
    res.json(procedure);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProceduresByCategory = async (req, res) => {
  try {
    const procedures = await Procedure.getByCategory(req.params.category);
    res.json(procedures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRadiologistProcedureTimes = async (req, res) => {
  try {
    const times = await RadiologistProcedureTime.getByRadiologist(req.params.radiologistId);
    res.json(times);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const setRadiologistProcedureTime = async (req, res) => {
  try {
    const { radiologistId, procedureId, averageReportingTime } = req.body;
    const result = await RadiologistProcedureTime.create(
      radiologistId,
      procedureId,
      averageReportingTime
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProcedureTime = async (req, res) => {
  try {
    const { averageReportingTime } = req.body;
    const result = await RadiologistProcedureTime.update(req.params.id, averageReportingTime);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProcedureTime = async (req, res) => {
  try {
    await RadiologistProcedureTime.delete(req.params.id);
    res.json({ message: 'Procedure time deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProcedures,
  getProcedureById,
  getProceduresByCategory,
  getRadiologistProcedureTimes,
  setRadiologistProcedureTime,
  updateProcedureTime,
  deleteProcedureTime
};

