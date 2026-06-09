import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, AlertTitle, AlertDescription } from './Alert';

const meta = {
  title: 'Components/Feedback/Alert',
  component: Alert,
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>
        You can add components to your project using the CLI.
      </AlertDescription>
    </Alert>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Alert variant="default">
        <AlertTitle>Default</AlertTitle>
        <AlertDescription>A neutral, informational message.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <AlertTitle>Saved</AlertTitle>
        <AlertDescription>Your changes have been saved.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Your session expires in 5 minutes.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Your session has expired. Please log in again.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const TitleOnly: Story = {
  render: () => (
    <Alert variant="success">
      <AlertTitle>Profile updated successfully</AlertTitle>
    </Alert>
  ),
};
