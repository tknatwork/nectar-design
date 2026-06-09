import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

const meta = {
  title: 'Components/Navigation/Tabs',
  component: Tabs,
  // children is required on Tabs; stories drive composition via render, so a
  // satisfying default keeps CSF3 arg typing happy.
  args: { children: null },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// Compound component: compose List + Trigger(s) + Content under Tabs.
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        A summary of recent workspace changes.
      </TabsContent>
      <TabsContent value="activity">
        Your latest comments, mentions, and edits.
      </TabsContent>
      <TabsContent value="settings">
        Manage notifications and access for this workspace.
      </TabsContent>
    </Tabs>
  ),
};

// A disabled trigger is skipped during keyboard navigation and click.
export const DisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
        <TabsTrigger value="audit" disabled>
          Audit log
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">Update your profile details.</TabsContent>
      <TabsContent value="billing">View invoices and payment methods.</TabsContent>
      <TabsContent value="audit">Audit log (unavailable on this plan).</TabsContent>
    </Tabs>
  ),
};

// Controlled selection via value + onValueChange.
export const Controlled: Story = {
  render: () => {
    const [tab, setTab] = useState<unknown>('general');
    return (
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="general">General preferences.</TabsContent>
        <TabsContent value="security">Password and two-factor auth.</TabsContent>
        <TabsContent value="advanced">Experimental feature flags.</TabsContent>
      </Tabs>
    );
  },
};
