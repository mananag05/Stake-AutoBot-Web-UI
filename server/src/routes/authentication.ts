import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    console.log('yo i am here')
});


router.post('/login', (req: Request, res: Response) => {
    res.send('User login endpoint');
});

export default router;
