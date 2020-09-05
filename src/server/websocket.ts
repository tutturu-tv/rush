import Mesa from '@cryb/mesa';
import { Server } from 'http';

export default (server: Server) => {
  const mesa = new Mesa({
    path: '/api/ws',
    server,
    heartbeat: {
      enabled: true,
      interval: 3000,
    },
  });

  return mesa;
};
