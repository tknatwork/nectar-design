/**
 * Nectar root provider (ADR 0028) — the headless engine ConfigProvider.
 *
 * Relocated into nectar-design in consolidation P4. `NectarProvider` is the
 * generic engine root; the consuming app wraps it in an AppNectarProvider shell
 * that injects route policy (engineSuppressed / autoDepthKey). `useNectar` /
 * `useNectarOptional` read the engine context anywhere below the provider.
 */
export {
  defaultIsHeatIsolated,
  NectarProvider,
  type NectarProviderProps,
} from './NectarProvider';
export {
  type NectarConfig,
  type NectarContextValue,
  useNectar,
  useNectarOptional,
} from './context';
