import '@testing-library/jest-dom/vitest';
import * as matchers from 'vitest-axe/matchers';
import { expect } from 'vitest';
import type { AxeResults } from 'axe-core';

expect.extend(matchers);

declare module 'vitest' {
  interface Assertion<T> {
    toHaveNoViolations(): T extends AxeResults ? void : never;
  }
}
