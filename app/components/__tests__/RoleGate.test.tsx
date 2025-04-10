import React from 'react';
import { render, screen } from '@testing-library/react';
import RoleGate from '../auth/RoleGate';
import { useRole } from '../../hooks/useRole';

// Mock the useRole hook
jest.mock('../../hooks/useRole', () => ({
  useRole: jest.fn(),
}));

describe('RoleGate Component', () => {
  const mockUseRole = useRole as jest.Mock;
  
  beforeEach(() => {
    mockUseRole.mockReset();
  });

  it('renders children when user has required role', () => {
    // Mock the useRole hook to return true (user has role)
    mockUseRole.mockReturnValue({
      hasRole: true,
      isLoading: false,
    });

    render(
      <RoleGate allowedRole="admin">
        <div data-testid="protected-content">Protected Content</div>
      </RoleGate>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('does not render children when user does not have required role', () => {
    // Mock the useRole hook to return false (user doesn't have role)
    mockUseRole.mockReturnValue({
      hasRole: false,
      isLoading: false,
    });

    render(
      <RoleGate allowedRole="admin">
        <div data-testid="protected-content">Protected Content</div>
      </RoleGate>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows loading state when role check is in progress', () => {
    // Mock the useRole hook to return loading state
    mockUseRole.mockReturnValue({
      hasRole: false,
      isLoading: true,
    });

    render(
      <RoleGate allowedRole="admin">
        <div data-testid="protected-content">Protected Content</div>
      </RoleGate>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('role-gate-loading')).toBeInTheDocument();
  });
});