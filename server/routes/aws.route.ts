import { Router } from 'express';
import { isAuthenticated } from "../middlewares/isAuthenticated.ts";
import { AwsController } from '../controllers/aws.controller.ts';

const router = Router();
const awsController = new AwsController();

router.use(isAuthenticated);

router.post('/connect', awsController.connectAWSAccount);
router.get('/accounts', awsController.listAWSAccounts);
router.delete('/accounts/:id', awsController.deleteAWSAccount);
router.get('/accounts/:id/apps', awsController.listApps);
router.get('/accounts/:id/apps/:appTag/graph', awsController.getAppGraph);

export default router;