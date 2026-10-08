// app/providers.tsx
'use client';

import { ConfigProvider, theme } from 'antd';
const { defaultAlgorithm } = theme;

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: defaultAlgorithm,         // light theme
        components: {
          Layout: {
            headerBg: '#fff',
            headerColor: '#1f1f1f'
          }
        }
      }}
    >
      {children}
    </ConfigProvider>
  );
}
