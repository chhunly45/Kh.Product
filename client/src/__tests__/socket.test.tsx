jest.mock('socket.io-client', () => {
  const mockConnect = jest.fn();
  const mockDisconnect = jest.fn();
  const mockRemoveAllListeners = jest.fn();
  const socket = {
    connected: false,
    auth: { token: '' },
    connect: mockConnect,
    disconnect: mockDisconnect,
    removeAllListeners: mockRemoveAllListeners
  };

  return {
    io: jest.fn(() => socket)
  };
});

describe('socket service', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.VITE_ENABLE_SOCKET = 'true';
  });

  it('connects and disconnects the socket', () => {
    const { connectSocket, disconnectSocket } = require('../services/socket');
    const { io } = require('socket.io-client');

    const connectedSocket = connectSocket();
    expect(io).toHaveBeenCalled();

    const fakeSocket = (io as jest.Mock).mock.results[0].value;
    expect(connectedSocket).toBe(fakeSocket);
    expect(fakeSocket.connect).toHaveBeenCalled();

    fakeSocket.connected = true;
    disconnectSocket();
    expect(fakeSocket.disconnect).toHaveBeenCalled();
  });
});
