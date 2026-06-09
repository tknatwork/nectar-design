// Components
export {
  Button,
  buttonVariants,
  Card,
  cardVariants,
  Badge,
  badgeVariants,
  Input,
  inputVariants,
  Label,
  labelVariants,
  Textarea,
  textareaVariants,
  ProjectLayout,
  FormField,
  Select,
  selectTriggerVariants,
  Checkbox,
  checkboxVariants,
  RadioGroup,
  radioVariants,
  Switch,
  switchVariants,
  Alert,
  AlertTitle,
  AlertDescription,
  alertVariants,
  Skeleton,
  skeletonVariants,
  Tooltip,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
  GlassToastContainer,
  dismiss,
  subscribe,
  toast,
  type ToastItem,
  type ToastVariant,
  Stack,
  stackVariants,
  Container,
  containerVariants,
  Grid,
  gridVariants,
  Divider,
  dividerVariants,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Breadcrumbs,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  Eyebrow,
  FlipCard,
  type FlipCardProps,
  NavPill,
  type NavPillItem,
  type NavPillLinkProps,
  type NavPillProps,
  Heading,
  headingVariants,
  Link,
  linkVariants,
  Avatar,
  avatarVariants,
  Tag,
  tagVariants,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  List,
  ListItem,
  listVariants,
  listItemVariants,
  Icon,
  iconVariants,
} from './components';

// Sub-brand system (ADR 0026 — Branded House with sub-brands)
export {
  SubBrandProvider,
  useSubBrand,
  useAtmospherePreset,
  useHeroComposition,
  useTagline,
} from './SubBrandProvider';
export type { SubBrandProviderProps } from './SubBrandProvider';
export {
  AtmosphereRegistryProvider,
  useAtmosphereComponent,
} from './atmosphere/AtmosphereRegistry';
export type { AtmosphereComponents } from './atmosphere/AtmosphereRegistry';
export {
  SUB_BRANDS,
  SUB_BRAND_NAMES,
  MASTER_DEFAULTS,
} from './sub-brands.generated';
export { resolveSubBrandSlug } from './resolveSubBrand';
export type {
  SubBrandRecord,
  SubBrandAssets,
  AtmospherePreset,
  HeroComposition,
} from './sub-brands.generated';

// Hooks
export { useTheme } from './hooks/useTheme';
export type { ThemeMode } from './hooks/useTheme';
export { useReducedMotion } from './hooks/useReducedMotion';

// Utilities
export { cn } from './cn';

// Chart theme (token-aware palette for Recharts, Nivo, ECharts)
export { getChartColors, getChartPalette, chartColorsFallback } from './utils/chart-theme';
export type { ChartColors } from './utils/chart-theme';

// Types
export type { VariantProps } from 'class-variance-authority';
