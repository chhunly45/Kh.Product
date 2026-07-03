import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteObfuscateFile } from 'vite-plugin-obfuscator';
import { gzipSync } from 'node:zlib';

const gzipSize = (content: string | Uint8Array) => gzipSync(content).length;

const BUNDLE_BUDGETS = {
  initialJsGzip: 350 * 1024,
  vendorJsGzip: 180 * 1024,
  lazyChunkGzip: 120 * 1024,
  cssGzip: 60 * 1024
};

const bundleBudgetPlugin = () => ({
  name: 'bundle-budget-plugin',
  generateBundle(_options: unknown, bundle: Record<string, any>) {
    const jsAssets = Object.entries(bundle).filter(([, output]) => output.type === 'chunk' && output.fileName.endsWith('.js'));
    const cssAssets = Object.entries(bundle).filter(([, output]) => output.type === 'asset' && output.fileName.endsWith('.css'));

    const initialJs = jsAssets
      .filter(([, output]) => Boolean(output?.isEntry))
      .map(([name, output]) => ({ name, fileName: output.fileName, gzip: gzipSize(output.code || '') }));

    const vendorJs = jsAssets
      .filter(([, output]) => output?.fileName?.includes('vendor-'))
      .map(([name, output]) => ({ name, fileName: output.fileName, gzip: gzipSize(output.code || '') }));

    const lazyJs = jsAssets
      .filter(([, output]) => !output?.isEntry && !output?.fileName?.includes('vendor-'))
      .map(([name, output]) => ({ name, fileName: output.fileName, gzip: gzipSize(output.code || '') }));

    const css = cssAssets.map(([name, output]) => {
      const source = typeof output.source === 'string' ? output.source : output.source || '';
      return { name, fileName: output.fileName, gzip: gzipSize(source) };
    });

    const violations: string[] = [];

    initialJs.forEach((item) => {
      if (item.gzip > BUNDLE_BUDGETS.initialJsGzip) {
        violations.push(`Initial JS budget exceeded: ${item.fileName} (${(item.gzip / 1024).toFixed(2)} KB gzip)`);
      }
    });

    vendorJs.forEach((item) => {
      if (item.gzip > BUNDLE_BUDGETS.vendorJsGzip) {
        violations.push(`Vendor JS budget exceeded: ${item.fileName} (${(item.gzip / 1024).toFixed(2)} KB gzip)`);
      }
    });

    lazyJs.forEach((item) => {
      if (item.gzip > BUNDLE_BUDGETS.lazyChunkGzip) {
        violations.push(`Lazy route budget exceeded: ${item.fileName} (${(item.gzip / 1024).toFixed(2)} KB gzip)`);
      }
    });

    css.forEach((item) => {
      if (item.gzip > BUNDLE_BUDGETS.cssGzip) {
        violations.push(`CSS budget exceeded: ${item.fileName} (${(item.gzip / 1024).toFixed(2)} KB gzip)`);
      }
    });

    this.warn('Bundle budgets (gzip): initial<=350KB, vendor<=180KB, lazy<=120KB, css<=60KB');
    if (violations.length > 0) {
      violations.forEach((message) => this.warn(message));
    }
  }
});

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [
      react(),
      bundleBudgetPlugin(),
      // Temporarily disabled obfuscation for faster build during testing
      // ...(isProduction
      //   ? [
      //       viteObfuscateFile({
      //         compact: true,
      //         controlFlowFlattening: true,
      //         controlFlowFlatteningThreshold: 0.75,
      //         deadCodeInjection: true,
      //         deadCodeInjectionThreshold: 0.4,
      //         debugProtection: true,
      //         debugProtectionInterval: 0,
      //         disableConsoleOutput: true,
      //         stringArray: true,
      //         stringArrayEncoding: ['rc4'],
      //         stringArrayThreshold: 0.75,
      //         rotateStringArray: true,
      //         transformObjectKeys: true,
      //         unicodeEscapeSequence: false,
      //         numbersToExpressions: true,
      //         simplify: true
      //       })
      //     ]
      //   : [])
    ],
    build: {
      outDir: 'dist',
      sourcemap: true,
      minify: 'terser',
      chunkSizeWarningLimit: 400,
      terserOptions: {
        compress: {
          passes: 3,
          drop_console: true,
          drop_debugger: true
        },
        mangle: true,
        format: {
          comments: false
        }
      },
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/[name]-[hash].js',
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            if (id.includes('react-dom')) return 'vendor-react-dom';
            if (id.includes('/react/')) return 'vendor-react';
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('recharts') || id.includes('/d3-') || id.includes('@reduxjs/toolkit') || id.includes('/immer/')) {
              return 'vendor-charts';
            }
            if (id.includes('lucide-react') || id.includes('react-helmet-async')) return 'vendor-ui';
            if (id.includes('socket.io-client') || id.includes('engine.io-client') || id.includes('socket.io-parser')) {
              return 'vendor-realtime';
            }
            if (id.includes('axios') || id.includes('date-fns') || id.includes('lodash') || id.includes('dayjs')) {
              return 'vendor-utils';
            }
            if (id.includes('quill') || id.includes('tinymce') || id.includes('slate') || id.includes('monaco-editor')) {
              return 'vendor-editor';
            }
          }
        }
      }
    },
    server: {
      historyApiFallback: true
    }
  };
});
