import { Router } from "express";
import createUser from "../../controllers/users/createUser.controller";
import deleteUser from "../../controllers/users/deleteUser.controller";
import loginUser from "../../controllers/users/loginUser.controller";
import showUser from "../../controllers/users/showUser.controller";
import updateUser from "../../controllers/users/updateUser.controller";
import verifyAdmin from "../../middlewares/authentication/verifyAdmin.middleware";
import VerifyToken from "../../middlewares/authentication/VerifyToken.middleware";
import VerifyTokenId from "../../middlewares/authentication/VerifyTokenId.middleware";

const userRoute = Router();

userRoute.post('/users', VerifyToken, verifyAdmin, createUser);
userRoute.post('/login', loginUser);
<<<<<<< HEAD
userRoute.get('/users/:id', VerifyToken, VerifyTokenId, showUser);
=======
userRoute.get('/users/:id', VerifyToken, showUser);
>>>>>>> 6e9d636f1796ac47a1e37a2103a6bb4389479979
userRoute.patch('/users/:id', VerifyToken, VerifyTokenId, updateUser)
userRoute.delete('/users/:id', VerifyToken, verifyAdmin, deleteUser);

export default userRoute;
