import express from 'express';
import { UserController } from '../controllers/user.controller.ts';
import { isAuthenticated } from '../middlewares/isAuthenticated.ts';

const router = express.Router();
const userController = new UserController();

router.route('/check-auth').get(isAuthenticated, userController.checkAuth);
router.route('/signup').post(userController.signup);
router.route('/login').post(userController.login);
router.route('/logout').post(userController.logout);

export default router;
