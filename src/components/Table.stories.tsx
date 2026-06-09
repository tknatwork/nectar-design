import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './Table';

const meta = {
  title: 'Components/Data Display/Table',
  component: Table,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

// Full composition: header + body with several rows.
export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Alice Nguyen</TableCell>
          <TableCell>Engineer</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Marcus Lee</TableCell>
          <TableCell>Designer</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Priya Patel</TableCell>
          <TableCell>Product</TableCell>
          <TableCell>Invited</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

// Header-only — column definitions with no data rows.
export const HeaderOnly: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
    </Table>
  ),
};

// Numeric data with end-aligned cells for amounts.
export const NumericColumns: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead className="text-end">Qty</TableHead>
          <TableHead className="text-end">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Widget</TableCell>
          <TableCell className="text-end">3</TableCell>
          <TableCell className="text-end">$36.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Gadget</TableCell>
          <TableCell className="text-end">1</TableCell>
          <TableCell className="text-end">$19.00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

// Single row — minimal data set.
export const SingleRow: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Key</TableHead>
          <TableHead>Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Environment</TableCell>
          <TableCell>Production</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
