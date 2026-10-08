// app/AntdRegistry.tsx
'use client';

import React from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { StyleProvider, createCache, extractStyle } from '@ant-design/cssinjs';

export default function AntdRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = React.useState(() => createCache());

  useServerInsertedHTML(() => (
    <style id="antd" dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }} />
  ));

  // ↓ Make antd styles lower priority so your CSS Modules/own CSS override them
  return (
    <StyleProvider cache={cache} hashPriority="low">
      {children}
    </StyleProvider>
  );
}
