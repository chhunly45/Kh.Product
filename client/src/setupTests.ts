import '@testing-library/jest-dom';

const originalWarn = console.warn.bind(console);

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
