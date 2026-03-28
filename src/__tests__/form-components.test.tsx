import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { FormField } from '../components/FormField';
import { Input } from '../components/Input';
import { Checkbox } from '../components/Checkbox';
import { RadioGroup } from '../components/Radio';
import { Switch } from '../components/Switch';
import { Label } from '../components/Label';

// ── FormField ──────────────────────────────────────────────────────────────────

describe('FormField', () => {
  it('wires label to input via htmlFor/id', () => {
    render(
      <FormField label="Email">
        <Input />
      </FormField>
    );
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', input.id);
  });

  it('shows error message with role="alert"', () => {
    render(
      <FormField label="Email" error="Required field">
        <Input />
      </FormField>
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Required field');
  });

  it('wires aria-describedby to error message', () => {
    render(
      <FormField label="Email" error="Invalid">
        <Input />
      </FormField>
    );
    const input = screen.getByRole('textbox');
    const errorId = screen.getByRole('alert').id;
    expect(input).toHaveAttribute('aria-describedby', expect.stringContaining(errorId));
  });

  it('wires aria-describedby to hint when no error', () => {
    render(
      <FormField label="Email" hint="We won't spam you">
        <Input />
      </FormField>
    );
    const input = screen.getByRole('textbox');
    const hint = screen.getByText("We won't spam you");
    expect(input).toHaveAttribute('aria-describedby', hint.id);
  });

  it('sets aria-required on child when required', () => {
    render(
      <FormField label="Email" required>
        <Input />
      </FormField>
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('shows required indicator on label', () => {
    render(
      <FormField label="Email" required>
        <Input />
      </FormField>
    );
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('passes axe audit', async () => {
    const { container } = render(
      <FormField label="Email" hint="Enter your email">
        <Input />
      </FormField>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe audit with error state', async () => {
    const { container } = render(
      <FormField label="Email" error="Required">
        <Input variant="error" />
      </FormField>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ── Checkbox ───────────────────────────────────────────────────────────────────

describe('Checkbox', () => {
  it('renders as a checkbox role', () => {
    render(<Checkbox aria-label="Agree" />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('toggles on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox aria-label="Agree" onCheckedChange={onChange} />);
    await user.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('toggles on Space key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox aria-label="Agree" onCheckedChange={onChange} />);
    screen.getByRole('checkbox').focus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox aria-label="Agree" disabled onCheckedChange={onChange} />);
    await user.click(screen.getByRole('checkbox'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('passes axe audit', async () => {
    const { container } = render(
      <Checkbox aria-label="Accept terms" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ── RadioGroup ─────────────────────────────────────────────────────────────────

describe('RadioGroup', () => {
  const options = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
    { value: 'c', label: 'Option C' },
  ];

  it('renders all radio options', () => {
    render(<RadioGroup options={options} aria-label="Choices" />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('selects option on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RadioGroup options={options} aria-label="Choices" onValueChange={onChange} />);
    await user.click(screen.getByText('Option B'));
    expect(onChange).toHaveBeenCalledWith('b', expect.anything());
  });

  it('navigates with arrow keys', async () => {
    const user = userEvent.setup();
    render(<RadioGroup options={options} aria-label="Choices" defaultValue="a" />);
    const radios = screen.getAllByRole('radio');
    radios[0].focus();
    await user.keyboard('{ArrowDown}');
    expect(radios[1]).toHaveFocus();
  });

  it('disables individual options', () => {
    const opts = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true },
    ];
    render(<RadioGroup options={opts} aria-label="Choices" />);
    const radios = screen.getAllByRole('radio');
    // The disabled radio should have data-disabled attribute
    expect(radios[1]).toHaveAttribute('data-disabled');
  });

  it('passes axe audit', async () => {
    const { container } = render(
      <RadioGroup options={options} aria-label="Choices" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ── Switch ─────────────────────────────────────────────────────────────────────

describe('Switch', () => {
  it('renders as a switch role', () => {
    render(<Switch aria-label="Dark mode" />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('toggles on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch aria-label="Dark mode" onCheckedChange={onChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('toggles on Space key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch aria-label="Dark mode" onCheckedChange={onChange} />);
    screen.getByRole('switch').focus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch aria-label="Dark mode" disabled onCheckedChange={onChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('passes axe audit', async () => {
    const { container } = render(
      <Switch aria-label="Dark mode" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
