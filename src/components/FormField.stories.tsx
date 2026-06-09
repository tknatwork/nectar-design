import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormField } from './FormField';
import { Input } from './Input';

const meta = {
  title: 'Components/Forms/FormField',
  component: FormField,
  // Required label + children at meta level so render-based stories satisfy the
  // args type; each story overrides via its own render.
  args: { label: 'Email', children: <Input /> },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <FormField label="Email">
      <Input type="email" placeholder="you@example.com" />
    </FormField>
  ),
};

export const Required: Story = {
  render: () => (
    <FormField label="Username" required>
      <Input placeholder="jane.doe" />
    </FormField>
  ),
};

export const WithHint: Story = {
  render: () => (
    <FormField label="Password" hint="Must be at least 8 characters.">
      <Input type="password" placeholder="••••••••" />
    </FormField>
  ),
};

export const WithError: Story = {
  render: () => (
    <FormField label="Email" error="Enter a valid email address." required>
      <Input type="email" variant="error" defaultValue="not-an-email" />
    </FormField>
  ),
};

export const Disabled: Story = {
  render: () => (
    <FormField label="Account ID" hint="Assigned automatically." disabled>
      <Input defaultValue="acct_01H9X" />
    </FormField>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-5" style={{ width: 320 }}>
      <FormField label="Default">
        <Input placeholder="Plain field" />
      </FormField>
      <FormField label="Required" required>
        <Input placeholder="Required field" />
      </FormField>
      <FormField label="With hint" hint="Helper text below the input.">
        <Input placeholder="Field with hint" />
      </FormField>
      <FormField label="With error" error="This field is required." required>
        <Input variant="error" />
      </FormField>
      <FormField label="Disabled" disabled>
        <Input defaultValue="Locked value" />
      </FormField>
    </div>
  ),
};
