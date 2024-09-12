import { RegisterAdminUseCase } from './register-admin';

import { InMemoryAdminRepository } from 'test/repositories/in-memory-admin-repository';
import { FakeHasher } from 'test/cryptography/fake-hasher';

import { AdminAlreadyExistsError } from './errors/admin-already-exists-error';

let inMemoryAdminRepository: InMemoryAdminRepository;
let hashGenerator: FakeHasher;
let sut: RegisterAdminUseCase;

describe('Register Recipient', () => {
  beforeEach(() => {
    inMemoryAdminRepository = new InMemoryAdminRepository();
    hashGenerator = new FakeHasher();
    sut = new RegisterAdminUseCase(inMemoryAdminRepository, hashGenerator);
  });

  it('should be able to register a admin account', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      cpf: '99999999999',
      password: '123456',
    });

    expect(result.isRight()).toBe(true);
  });

  it('should not be able to register a new admin account with email exists', async () => {
    await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      cpf: '99999999999',
      password: '123456',
    });

    const result = await sut.execute({
      name: 'Max',
      email: 'johndoe@example.com',
      cpf: '99999999999',
      password: '123456',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AdminAlreadyExistsError);
  });

  it('should be hash admin account password upon registration', async () => {
    const result = await sut.execute({
      name: 'Max',
      email: 'johndoe@example.com',
      cpf: '99999999999',
      password: '123456',
    });

    const hashedPassword = await hashGenerator.hash('123456');

    expect(result.isRight()).toBe(true);
    expect(inMemoryAdminRepository.items[0].password).toEqual(hashedPassword);
  });
});
