import { Router } from 'express';
import { hrController } from './hr.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// Employees
router.get('/employees', hrController.getEmployees);
router.post('/employees', hrController.createEmployee);
router.get('/employees/:id', hrController.getEmployeeById);
router.put('/employees/:id', hrController.updateEmployee);
router.delete('/employees/:id', hrController.deactivateEmployee);

// Attendance
router.post('/attendance', hrController.markAttendance);
router.get('/attendance', hrController.getAttendance);
router.get('/attendance/summary/:id', hrController.getAttendanceSummary);

// Salary Payments
router.post('/payments', hrController.makePayment);
router.get('/payments', hrController.getAllPayments);
router.get('/payments/employee/:id', hrController.getPaymentsByEmployee);
router.get('/payments/monthly-status', hrController.getMonthlySalaryStatus);

export default router;