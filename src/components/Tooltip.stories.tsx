import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './Tooltip';
import { Button } from './Button';

const meta = {
  title: 'Components/Data Display/Tooltip',
  component: Tooltip,
  // Required content + children at meta level so render-based stories satisfy the
  // args type; each story composes its own trigger + content.
  args: { content: 'Tooltip', children: <Button>Hover me</Button> },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip content="Copy to clipboard">
      <Button>Hover me</Button>
    </Tooltip>
  ),
};

export const Sides: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 48, padding: 48, flexWrap: 'wrap' }}>
      <Tooltip content="Top" side="top">
        <Button>Top</Button>
      </Tooltip>
      <Tooltip content="Right" side="right">
        <Button>Right</Button>
      </Tooltip>
      <Tooltip content="Bottom" side="bottom">
        <Button>Bottom</Button>
      </Tooltip>
      <Tooltip content="Left" side="left">
        <Button>Left</Button>
      </Tooltip>
    </div>
  ),
};

export const RichContent: Story = {
  render: () => (
    <Tooltip content={<span>Press <kbd>⌘C</kbd> to copy</span>}>
      <Button intent="outline">Keyboard hint</Button>
    </Tooltip>
  ),
};
