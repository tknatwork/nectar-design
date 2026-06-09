import type { Meta, StoryObj } from '@storybook/react-vite';
import { Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator } from './Menu';

const meta = {
  title: 'Components/Navigation/Menu',
  component: Menu,
  // Required `children` (trigger + content) at meta level so render-based stories
  // satisfy the args type; each story composes its own menu.
  args: { children: null },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Menu>
      <MenuTrigger>Actions</MenuTrigger>
      <MenuContent>
        <MenuItem>Edit</MenuItem>
        <MenuItem>Duplicate</MenuItem>
        <MenuItem>Delete</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

// Grouped items split by a separator.
export const WithSeparator: Story = {
  render: () => (
    <Menu>
      <MenuTrigger>Account</MenuTrigger>
      <MenuContent>
        <MenuItem>Profile</MenuItem>
        <MenuItem>Settings</MenuItem>
        <MenuSeparator />
        <MenuItem>Sign out</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

// A disabled item is dimmed and non-interactive.
export const DisabledItem: Story = {
  render: () => (
    <Menu>
      <MenuTrigger>Options</MenuTrigger>
      <MenuContent>
        <MenuItem>Rename</MenuItem>
        <MenuItem disabled>Archive</MenuItem>
        <MenuItem>Delete</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

// Content placed to the right of the trigger via the `side` prop.
export const SideRight: Story = {
  render: () => (
    <Menu>
      <MenuTrigger>More</MenuTrigger>
      <MenuContent side="right">
        <MenuItem>Copy link</MenuItem>
        <MenuItem>Share</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

// Opens by default so the popup is visible without interaction.
export const OpenByDefault: Story = {
  render: () => (
    <Menu defaultOpen>
      <MenuTrigger>Menu</MenuTrigger>
      <MenuContent>
        <MenuItem>First</MenuItem>
        <MenuItem>Second</MenuItem>
        <MenuItem>Third</MenuItem>
      </MenuContent>
    </Menu>
  ),
};
