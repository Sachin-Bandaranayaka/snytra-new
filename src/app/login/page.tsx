
import React from 'react';

const Login: React.FC = () => {
  return (
    <div data-testid="mock-login-form">
      <h2>Login</h2>
      <form>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
