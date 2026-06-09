import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './Dialog';

const meta = {
  title: 'Components/Feedback/Dialog',
  component: Dialog,
  // children is required on Dialog; stories drive composition via render, so a
  // satisfying default lives here to keep CSF3 arg typing happy.
  args: { children: null },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Compound component: compose Trigger + Content (Title/Description) under Dialog.
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-fg">
        Open dialog
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Invite a teammate</DialogTitle>
        <DialogDescription>
          Send an invitation to collaborate on this workspace.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  ),
};

// Confirmation pattern with explicit close actions in a footer row.
export const WithActions: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-fg">
        Delete project
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Delete project</DialogTitle>
        <DialogDescription>
          This action cannot be undone. All files and history will be permanently removed.
        </DialogDescription>
        <div className="mt-6 flex justify-end gap-2">
          <DialogClose className="px-4 py-2">Cancel</DialogClose>
          <DialogClose className="bg-muted px-4 py-2">Delete</DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  ),
};

// Open on mount via defaultOpen to preview the popup + backdrop without interaction.
export const DefaultOpen: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogTrigger className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-fg">
        Open dialog
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Welcome aboard</DialogTitle>
        <DialogDescription>
          This dialog rendered open on mount using the defaultOpen prop.
        </DialogDescription>
        <div className="mt-6 flex justify-end">
          <DialogClose className="px-4 py-2">Got it</DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  ),
};
