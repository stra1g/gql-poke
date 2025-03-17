import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('"hello" module tests', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should return "Hello World!"', async () => {
    const response: any = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `query hello {
					hello
				}`,
      });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.hello).toBe('Hello World!');
  });
});
