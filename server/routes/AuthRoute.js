import { Router } from "express";
import jwt from 'jsonwebtoken';
import Employee from "../models/Employee.js";
import { sendPasswordEmail } from "../services/email.js";
import { log } from "console";

const authRoute = Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET);
};

export const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 5; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const registerResearcherEmployee = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    const employeeExists = await Employee.findOne({ email });
    if (employeeExists) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    // todo
    const hashedPassword = generateRandomPassword();
    
    const employeeData = {
      fullName: fullName,
      email: email,
      password: hashedPassword,
      organization: req.employee.organization,
      organizationType: "RSH"
    }
    const newEmployee = await Employee.create(employeeData);

    sendPasswordEmail(email, hashedPassword);

    res.status(201).json({
      success: true,
      employee: {
        _id: newEmployee._id,
        ...employeeData
      },
      token: generateToken(newEmployee._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const registerEmployee = async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const employee = req.employee;

    const employeeExists = await Employee.findOne({ email });
    if (employeeExists) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    const hashedPassword = generateRandomPassword();
    const employeeData = {
      fullName: fullName,
      email: email,
      password: hashedPassword,
      organization: employee.organization,
      organizationType: employee.organizationType
    }
    const newEmployee = await Employee.create(employeeData);

    sendPasswordEmail(email, hashedPassword);

    res.status(201).json({
      success: true,
      employee: {
        _id: newEmployee._id,
        ...employeeData
      },
      token: generateToken(newEmployee._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


function getEmployee(req, res) {
  return res.status(200).json(req.employee)
}

const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email: email });
    if (!employee) {
      return res.status(401).json({ message: "Invalid phone number or password" });
    }

    const isMatch = password == employee.password;
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid phone number or password" });
    }

    res.status(200).json({
      _id: employee._id,
      fullName: employee.fullName,
      organization: employee.organization,
      organizationType: employee.organizationType,
      token: generateToken(employee._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const employee = await Employee.findById(decoded.id);

      // If user not found
      if (!employee) {
        return res.status(401).json({
          success: false,
          message: 'User not found with this id',
        });
      }

      req.employee = employee;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error in authentication',
      error: error.message,
    });
  }
};

export const authorizeOrganizations = (...orgs) => {
  return (req, res, next) => {
    if (!req.employee || !req.employee.organizationType) {
      return res.status(403).json({ success: false, message: 'Access denied. No organization info found.' });
    }

    if (!orgs.includes(req.employee.organizationType)) {
      return res.status(403).json({ success: false, message: 'Access denied. Unauthorized organization.' });
    }
    next();
  }
}

export const authorizeHospitalEmployee = authorizeOrganizations("Hospital")
export const authorizeAspEmployee = authorizeOrganizations("ASP")
export const authorizeDspEmployee = authorizeOrganizations("DSP")
export const authorizeResearcher = authorizeOrganizations("RSH")

authRoute.post("/register-employee", protect, registerEmployee);
authRoute.post("/register-researcher", protect, authorizeDspEmployee, registerResearcherEmployee);
authRoute.post("/login", loginEmployee);
authRoute.get("/employee", protect, getEmployee);

export default authRoute;
