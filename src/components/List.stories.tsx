import type { Meta, StoryObj } from '@storybook/react-vite';
import { List, ListItem } from './List';

const meta = {
  title: 'Components/Data Display/List',
  component: List,
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <List>
      <ListItem>Inbox</ListItem>
      <ListItem>Drafts</ListItem>
      <ListItem>Sent</ListItem>
    </List>
  ),
};

// variant axis — default / spaced / divided.
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <List variant="default">
        <ListItem>Default — rows sit flush together</ListItem>
        <ListItem>Second row</ListItem>
        <ListItem>Third row</ListItem>
      </List>
      <List variant="spaced">
        <ListItem>Spaced — small gap between rows</ListItem>
        <ListItem>Second row</ListItem>
        <ListItem>Third row</ListItem>
      </List>
      <List variant="divided">
        <ListItem>Divided — separator line between rows</ListItem>
        <ListItem>Second row</ListItem>
        <ListItem>Third row</ListItem>
      </List>
    </div>
  ),
};

// ListItem size axis — sm / md / lg.
export const Sizes: Story = {
  render: () => (
    <List variant="divided">
      <ListItem size="sm">Small row padding</ListItem>
      <ListItem size="md">Medium row padding (default)</ListItem>
      <ListItem size="lg">Large row padding</ListItem>
    </List>
  ),
};

// Interactive rows — hover affordance + pointer cursor.
export const Interactive: Story = {
  render: () => (
    <List variant="spaced">
      <ListItem interactive>Overview</ListItem>
      <ListItem interactive>Members</ListItem>
      <ListItem interactive>Billing</ListItem>
    </List>
  ),
};

// Ordered list — renders an <ol> instead of <ul>.
export const Ordered: Story = {
  render: () => (
    <List ordered variant="divided">
      <ListItem>First step</ListItem>
      <ListItem>Second step</ListItem>
      <ListItem>Third step</ListItem>
    </List>
  ),
};
