import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import AppDataSource from "../../data-source";
import { Role } from "../../entities/Role";
import { User } from "../../entities/User";
import { Workspace } from "../../entities/Workspace";
import UserRepository from "../../repositories/UserRepository";
import {
  mockAdmin,
  mockAdminRole,
  mockStudentRole,
  mockTeacherRole,
  mockWorkspace,
} from "../mocked_data/mocked-data";

let connection: DataSource;
let workspace: Workspace;
let adminRole: Role;
let adminUser: User;
let teacherRole: Role;
let studentRole: Role;
let testUser: User;

beforeAll(async () => {
  await AppDataSource.initialize()
    .then((res) => (connection = res))
    .catch((err) => {
      console.error("Erro ao inicializar o servidor", err);
    });
});

afterAll(async () => {
  await connection.destroy();
});

describe("Testando criação de usuário", () => {
  test("Deve criar um usuário novo dentro de um workspace", async () => {
    
    const newUser = {
      name: "Chang",
      email: "senorcheng@greendale.com",
      password: "chengnesia",
      role: teacherRole,
    };
    
    workspace = await mockWorkspace();
    studentRole = await mockStudentRole(workspace);
    adminRole = await mockAdminRole(workspace);
    adminUser = await mockAdmin(adminRole);
    teacherRole = await mockTeacherRole(workspace);
    
    const loginResp = await request(app)
      .post("Greendale/login")
      .send({ email: adminUser.email, password: adminUser.password });

    const { token } = loginResp.body;

    const createResp = await request(app)
      .post("Greendale/users")
      .set("Authorization", `Bearer ${token}`)
      .send(newUser);

    testUser = createResp.body.user;

    expect(createResp.status).toBe(201);
    expect(testUser).toBeDefined;
    expect(testUser).toHaveProperty("id", "role");
    expect(testUser.email).toBe(newUser.email);
    expect(testUser.name).toBe(newUser.name);
    expect(testUser.role).toBeInstanceOf(Role);
  });
});

describe("Testando listagem de usuários", () => {
  test("Deve listar todos os usuários de um workspace como admin", async () => {
    const loginResp = await request(app)
      .post("Greendale/login")
      .send({ email: adminUser.email, password: adminUser.password });

    const { token } = loginResp.body;

    const listResp = await request(app)
      .get("Greendale/users")
      .set("Authorization", `Bearer ${token}`);

    expect(listResp.status).toBe(200);
    expect(listResp.body).toBeDefined;
    expect(Array.isArray(listResp.body)).toBe(true);
  });

  test("Deve listar um usuário específico quando admin", async () => {
    const loginResp = await request(app)
      .post("Greendale/login")
      .send({ email: adminUser.email, password: adminUser.password });

    const { token } = loginResp.body;

    const listResp = await request(app)
      .get(`Greendale/users/${testUser.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(listResp.status).toBe(200);
    expect(listResp.body).toBeDefined;
    expect(listResp.body).toHaveProperty("id", "role");
    expect(listResp.body.email).toBe(testUser.email);
    expect(listResp.body.name).toBe(testUser.name);
    expect(listResp.body.role).toBeInstanceOf(Role);
  });

  test("Deve listar um usuário específico quando mesmo usuário", async () => {
    const loginResp = await request(app)
      .post("Greendale/login")
      .send({ email: testUser.email, password: testUser.password });

    const { token } = loginResp.body;

    const listResp = await request(app)
      .get(`Greendale/users/${testUser.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(listResp.status).toBe(200);
    expect(listResp.body).toBeDefined;
    expect(listResp.body).toHaveProperty("id", "role");
    expect(listResp.body.email).toBe(testUser.email);
    expect(listResp.body.name).toBe(testUser.name);
    expect(listResp.body.role).toBeInstanceOf(Role);
  });
});

describe("Testando update de usuário", () => {
  test("Deve fazer update em um usuário quando admin", async () => {
    const loginResp = await request(app)
      .post("Greendale/login")
      .send({ email: adminUser.email, password: adminUser.password });

    const { token } = loginResp.body;

    const listResp = await request(app)
      .patch(`Greendale/users/${testUser.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Kevin", email: "Kevin@greendale.com", role: studentRole });

    testUser = listResp.body.user

    expect(listResp.status).toBe(200);
    expect(testUser).toBeDefined;
    expect(testUser.email).toBe("Kevin@greendale.com");
    expect(testUser.name).toBe("Kevin");
    expect(testUser.role.id).toBe(studentRole.id);

  });

  test("Deve fazer update em um usuário quando mesmo usuário", async () => {
    const loginResp = await request(app)
      .post("Greendale/login")
      .send({ email: testUser.email, password: testUser.password });

    const { token } = loginResp.body;

    const listResp = await request(app)
      .patch(`Greendale/users/${testUser.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Chang", email: "Chang@greendale.com"});

    expect(listResp.status).toBe(200);
    expect(listResp.body).toBeDefined;
    expect(testUser.email).toBe("Chang@greendale.com");
    expect(testUser.name).toBe("Chang");
    expect(testUser.role.id).toBe(studentRole.id);
  });
});

describe("Testando deleção de usuário", () => {
  test("Deve deletar um usuário quando admin", async () => {
    const loginResp = await request(app)
      .post("Greendale/login")
      .send({ email: adminUser.email, password: adminUser.password });

    const { token } = loginResp.body;

    const listResp = await request(app)
      .patch(`Greendale/users/${testUser.id}`)
      .set("Authorization", `Bearer ${token}`)

    expect(listResp.status).toBe(200);

    const findResp = await UserRepository.findOne({where: {id: testUser.id}});

    expect(findResp).toBeFalsy();
  });
});
