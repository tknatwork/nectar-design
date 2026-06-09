import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
} from './Popover';

const meta = {
  title: 'Components/Feedback/Popover',
  component: Popover,
  // children is required on Popover; stories drive composition via render, so a
  // satisfying default lives here to keep CSF3 arg typing happy.
  args: { children: null },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

const triggerClass =
  'rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-fg';

// Compound component: compose Trigger + Content (Title/Description) under Popover.
export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger className={triggerClass}>Account details</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Signed in as</PopoverTitle>
        <PopoverDescription>jane@nectar.dev — Pro plan</PopoverDescription>
      </PopoverContent>
    </Popover>
  ),
};

// Popup with explicit close actions in a footer row.
export const WithActions: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger className={triggerClass}>Share link</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Anyone with the link</PopoverTitle>
        <PopoverDescription>
          People outside your workspace can view this page.
        </PopoverDescription>
        <div className="mt-4 flex justify-end gap-2">
          <PopoverClose className="px-3 py-1.5">Cancel</PopoverClose>
          <PopoverClose className="bg-muted px-3 py-1.5">Copy</PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

// side axis on PopoverContent: anchor the popup to each edge of the trigger.
export const Sides: Story = {
  render: () => (
    <div className="flex flex-wrap gap-12 p-16">
      {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
        <Popover key={side}>
          <PopoverTrigger className={triggerClass}>side: {side}</PopoverTrigger>
          <PopoverContent side={side}>
            <PopoverTitle>Anchored {side}</PopoverTitle>
            <PopoverDescription>
              This popup is positioned on the {side} of its trigger.
            </PopoverDescription>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};

// Open on mount via defaultOpen to preview the popup + arrow without interaction.
export const DefaultOpen: Story = {
  render: () => (
    <Popover defaultOpen>
      <PopoverTrigger className={triggerClass}>Notifications</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>You're all caught up</PopoverTitle>
        <PopoverDescription>
          This popover rendered open on mount using the defaultOpen prop.
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  ),
};
