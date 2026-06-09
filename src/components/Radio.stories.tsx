import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadioGroup } from './Radio';

const plans = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

const meta = {
  title: 'Components/Forms/Radio',
  component: RadioGroup,
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { options: plans, defaultValue: 'free', 'aria-label': 'Select a plan' },
};

export const Horizontal: Story = {
  args: {
    options: plans,
    defaultValue: 'pro',
    orientation: 'horizontal',
    'aria-label': 'Select a plan',
  },
};

export const Disabled: Story = {
  args: {
    options: plans,
    defaultValue: 'free',
    disabled: true,
    'aria-label': 'Select a plan',
  },
};

export const DisabledOption: Story = {
  args: {
    options: [
      { value: 'free', label: 'Free' },
      { value: 'pro', label: 'Pro' },
      { value: 'enterprise', label: 'Enterprise (coming soon)', disabled: true },
    ],
    defaultValue: 'free',
    'aria-label': 'Select a plan',
  },
};

export const Sizes: Story = {
  args: { options: plans, defaultValue: 'free', 'aria-label': 'Select a plan' },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <RadioGroup {...args} size="sm" />
      <RadioGroup {...args} size="md" />
      <RadioGroup {...args} size="lg" />
    </div>
  ),
};
