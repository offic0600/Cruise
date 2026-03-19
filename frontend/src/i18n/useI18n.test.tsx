import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { I18nProvider } from '@/i18n/I18nProvider';
import { getMessages } from '@/i18n/getMessages';
import { useI18n } from '@/i18n/useI18n';

describe('useI18n', () => {
  it('falls back to readable text when a key is missing', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return (
        <I18nProvider locale="en" messages={getMessages('en')}>
          {children}
        </I18nProvider>
      );
    };

    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.t('issues.relationType.RELATED_TO_UNKNOWN')).toBe('Related To Unknown');
  });
});
