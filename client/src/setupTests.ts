import '@testing-library/jest-dom';

const originalWarn = console.warn.bind(console);

// Note: Do not globally mock `axios` here — individual tests mock `../services/api` as needed.

// Note: Do not globally mock `useAuth` here — tests should mock it selectively when needed.

// Ensure Vite-like env is available for tests
process.env.VITE_API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation((message, ...args) => {
    const suppressed = [
      'React Router Future Flag Warning',
      'Relative route resolution within Splat routes is changing in v7.'
    ];

    if (typeof message === 'string' && suppressed.some((warning) => message.includes(warning))) {
      return;
    }

    originalWarn(message, ...args);
  });
});
