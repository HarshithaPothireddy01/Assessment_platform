import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './components/Login';

test('displays the login form', () => {
render(<Login onLogin={() => {}} />);

expect(
screen.getByRole('heading', { name: 'Assessment Portal' })
).toBeInTheDocument();

expect(
screen.getByRole('button', { name: 'Sign In' })
).toBeInTheDocument();

expect(
screen.getByLabelText('Email Address')
).toBeInTheDocument();
});

test('opens the registration form when register is clicked', () => {
render(<Login onLogin={() => {}} />);

userEvent.click(
screen.getByRole('button', {
name: "Don't have an account? Register here"
})
);

expect(
screen.getByRole('heading', { name: 'Create Account' })
).toBeInTheDocument();

expect(
screen.getByRole('button', { name: 'Create Account' })
).toBeInTheDocument();
});
