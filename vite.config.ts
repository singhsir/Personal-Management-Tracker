import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const openrouterKey = env.VITE_OPENROUTER_API_KEY || env.OPENROUTER_API_KEY || '';

  return {
    plugins: [
      react(),
      {
        name: 'api-dev-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = req.url?.split('?')[0];
            if (req.method === 'POST' && (url === '/api/companion' || url === '/api/insights')) {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', async () => {
                try {
                  const parsed = JSON.parse(body || '{}');
                  const handlerFile = url === '/api/companion' ? './api/companion.ts' : './api/insights.ts';
                  const mod = await server.ssrLoadModule(handlerFile);
                  const handler = mod.default;

                  const mockReq = {
                    method: 'POST',
                    body: parsed,
                    headers: req.headers,
                  };

                  const mockRes = {
                    statusCode: 200,
                    setHeader(k: string, v: string) {
                      res.setHeader(k, v);
                    },
                    status(code: number) {
                      this.statusCode = code;
                      return this;
                    },
                    json(data: any) {
                      res.statusCode = this.statusCode;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(data));
                    },
                    end() {
                      res.end();
                    },
                  };

                  await handler(mockReq, mockRes);
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message || 'Internal API Error' }));
                }
              });
              return;
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      __OPENROUTER_API_KEY__: JSON.stringify(openrouterKey),
    },
  };
});
