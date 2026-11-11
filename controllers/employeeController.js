const Employee = require('../models/Employee');

// Whitelist of fields allowed for sorting (prevents arbitrary/unsafe sort input)
const ALLOWED_SORT_FIELDS = [
  'fullName',
  'email',
  'department',
  'designation',
  'joiningDate',
  'createdAt',
];

// @desc    Get all employees (supports search, filter, sort, pagination)
// @route   GET /api/employees?search=&department=&designation=&sortBy=&order=&page=&limit=
// @access  Private
const getEmployees = async (req, res, next) => {
  try {
    const {
      search,
      department,
      designation,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter query
    const query = {};
    if (search) {
      query.fullName = { $regex: search, $options: 'i' };
    }
    if (department) {
      query.department = { $regex: `^${department}$`, $options: 'i' };
    }
    if (designation) {
      query.designation = { $regex: `^${designation}$`, $options: 'i' };
    }

    // Validate sort field, default to createdAt if invalid
    const sortField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    // Pagination math
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100); // cap at 100/page
    const skip = (pageNum - 1) * limitNum;

    const [employees, totalCount] = await Promise.all([
      Employee.find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum),
      Employee.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    res.status(200).json({
      employees,
      pagination: {
        totalCount,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get distinct department and designation values (for filter dropdowns)
// @route   GET /api/employees/meta/filters
// @access  Private
const getFilterOptions = async (req, res, next) => {
  try {
    const [departments, designations] = await Promise.all([
      Employee.distinct('department'),
      Employee.distinct('designation'),
    ]);
    res.status(200).json({
      departments: departments.filter(Boolean).sort(),
      designations: designations.filter(Boolean).sort(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (error) {
    next(error);
  }
};

// @desc    Create employee
// @route   POST /api/employees
// @access  Private
const createEmployee = async (req, res, next) => {
  try {
    const { fullName, email, mobileNumber, department, designation, joiningDate } = req.body;

    const employee = await Employee.create({
      fullName,
      email,
      mobileNumber,
      department,
      designation,
      joiningDate,
      createdBy: req.user._id,
    });

    res.status(201).json(employee);
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const { fullName, email, mobileNumber, department, designation, joiningDate } = req.body;

    employee.fullName = fullName ?? employee.fullName;
    employee.email = email ?? employee.email;
    employee.mobileNumber = mobileNumber ?? employee.mobileNumber;
    employee.department = department ?? employee.department;
    employee.designation = designation ?? employee.designation;
    employee.joiningDate = joiningDate ?? employee.joiningDate;

    const updated = await employee.save();
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await employee.deleteOne();
    res.status(200).json({ message: 'Employee deleted successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getFilterOptions,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};