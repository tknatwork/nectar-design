import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';
import { ProjectLayout } from './ProjectLayout';

const meta = {
  title: 'Components/ProjectLayout',
  component: ProjectLayout,
  tags: ['autodocs'],
  args: {
    project: {
      slug: 'alpha-case-study',
      primaryColor: '#6366f1',
      accentColor: '#14b8a6',
      bgColor: '#0f172a',
    },
    children: (
      <Card className="max-w-xl space-y-4" padding="lg">
        <div className="space-y-3">
          <Badge intent="primary">Project theme</Badge>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-fg">Alpha case study</h2>
            <p className="text-sm text-muted-fg">
              ProjectLayout applies CSS custom property overrides so nested
              components inherit project-specific theming automatically.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button intent="primary">Primary action</Button>
            <Button intent="accent">Accent action</Button>
            <Button intent="outline">Secondary action</Button>
          </div>
        </div>
      </Card>
    ),
  },
} satisfies Meta<typeof ProjectLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BrandOverridesOnly: Story = {
  args: {
    project: {
      slug: 'beta-dashboard',
      primaryColor: '#7c3aed',
      accentColor: '#f97316',
    },
  },
};

export const MinimalOverride: Story = {
  args: {
    project: {
      slug: 'gamma-editorial',
      primaryColor: '#2563eb',
    },
    children: (
      <Card className="max-w-xl space-y-3" padding="lg">
        <h2 className="text-2xl font-semibold text-fg">Single token override</h2>
        <p className="text-sm text-muted-fg">
          Only the primary token is overridden here, leaving other tokens at
          their default values.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button intent="primary">Primary</Button>
          <Button intent="outline">Outline</Button>
        </div>
      </Card>
    ),
  },
};
