jest.mock('socket.io-client', () => {
  const mockConnect = jest.fn();
  const mockDisconnect = jest.fn();
  const mockRemoveAllListeners = jest.fn();
  const socket = {
    connected: false,
    auth: { token: '' },
    connect: mockConnect,
    disconnect: mockDisconnect,
    removeAllListeners: mockRemoveAllListeners,
    on: jest.fn(),
    off: jest.fn(),
    active: false
  };

  return {
    io: jest.fn(() => socket)
  };
});

describe('socket service', () => {
  beforeEach(() => {
    jest.resetModules();
    delete process.env.VITE_API_BASE_URL;
    delete process.env.VITE_API_URL;
    delete process.env.VITE_PUBLIC_API_URL;
    delete process.env.VITE_SITE_URL;
    delete process.env.VITE_ENABLE_SOCKET;
    process.env.VITE_ENABLE_SOCKET = 'true';
  });

  it('connects and disconnects the socket', () => {
    const { connectSocket, disconnectSocket } = require('../services/socket');
    const { io } = require('socket.io-client');

    const connectedSocket = connectSocket();
    expect(io).toHaveBeenCalled();

    const fakeSocket = (io as any).mock.results[0].value;
    expect(connectedSocket).toBe(fakeSocket);
    expect(fakeSocket.connect).toHaveBeenCalled();

    fakeSocket.connected = true;
    disconnectSocket();
    expect(fakeSocket.disconnect).toHaveBeenCalled();
  });

  it('uses explicit VITE_API_BASE_URL to construct the socket base url', () => {
    process.env.VITE_API_BASE_URL = 'https://api.example.com/api';
    const { connectSocket } = require('../services/socket');
    const { io } = require('socket.io-client');

    connectSocket('custom-token');

    expect(io).toHaveBeenCalledWith('https://api.example.com', expect.any(Object));
  });

  it('falls back to localhost socket url when window hostname is localhost', () => {
    process.env.VITE_API_BASE_URL = '';
    Object.defineProperty(global, 'window', {
      value: { location: { hostname: 'localhost', protocol: 'http:' } },
      configurable: true
    });

    const { connectSocket } = require('../services/socket');
    const { io } = require('socket.io-client');

    connectSocket();
    expect(io).toHaveBeenCalledWith('http://localhost:5000', expect.any(Object));
  });

  it('uses HTTPS default when no environment or window location is available', () => {
    delete (global as any).window;
    const { connectSocket } = require('../services/socket');
    const { io } = require('socket.io-client');

    connectSocket();
    expect(io).toHaveBeenCalledWith('https://api.konpuk.com', expect.any(Object));
  });
});
