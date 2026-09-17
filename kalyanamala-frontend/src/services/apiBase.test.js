import { resolveApiBase } from './apiBase';

test('always calls /api even if the env URL omits it', () => {
  expect(resolveApiBase('https://kalyanamala-backend-production.up.railway.app'))
    .toEqual({
      origin: 'https://kalyanamala-backend-production.up.railway.app',
      api: 'https://kalyanamala-backend-production.up.railway.app/api'
    });
  expect(resolveApiBase('https://kalyanamala-backend-production.up.railway.app/api'))
    .toEqual({
      origin: 'https://kalyanamala-backend-production.up.railway.app',
      api: 'https://kalyanamala-backend-production.up.railway.app/api'
    });
  expect(resolveApiBase('https://kalyanamala-backend-production.up.railway.app/api/'))
    .toEqual({
      origin: 'https://kalyanamala-backend-production.up.railway.app',
      api: 'https://kalyanamala-backend-production.up.railway.app/api'
    });
});
