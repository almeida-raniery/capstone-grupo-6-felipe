import { Request, Response } from "express";
import createUserService from "../../services/users/createUser.service";
import { instanceToPlain } from "class-transformer";

async function createUser(req: Request, res: Response) {

    console.log(req.body)
  
    const workspace_name = req.params.workspace_name
    const { name, email, password } = req.body;
    const createdUser = await createUserService(name, email, password, workspace_name);

    return res.status(201).json(instanceToPlain(createdUser)); //Não consegui retirar o campo password no retorno com class-transformer

}

export default createUser;
