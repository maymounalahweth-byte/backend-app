const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getFilterOptions,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getEmployees).post(createEmployee);
router.get('/meta/filters', getFilterOptions); // must be before /:id
router.route('/:id').get(getEmployeeById).put(updateEmployee).delete(deleteEmployee);

module.exports = router;