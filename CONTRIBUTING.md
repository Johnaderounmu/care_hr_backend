# Contributing to Care HR Backend 🤝

Thank you for your interest in contributing to Care HR Backend! We welcome contributions from the community and are grateful for your help in making this project better.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Issue Guidelines](#issue-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 12
- Git
- A GitHub account

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/care_hr_backend.git
   cd care_hr_backend
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/Johnaderounmu/care_hr_backend.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Set up your environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```
6. **Start the development server**:
   ```bash
   npm run dev
   ```

## Development Process

### Branching Strategy

We use **Git Flow** for our branching strategy:

- `master` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Creating a Feature Branch

```bash
# Ensure you're on the latest develop branch
git checkout develop
git pull upstream develop

# Create your feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit them
git add .
git commit -m "feat: add your feature description"

# Push to your fork
git push origin feature/your-feature-name
```

## Coding Standards

### TypeScript/JavaScript Guidelines

- Use **TypeScript** for all new code
- Follow the existing **ESLint** configuration
- Use **Prettier** for code formatting
- Write **meaningful variable and function names**
- Add **JSDoc comments** for public functions

### Code Style

```typescript
// ✅ Good
interface UserCreateRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

async function createUser(userData: UserCreateRequest): Promise<User> {
  // Implementation here
}

// ❌ Bad
function createUser(data: any) {
  // Implementation here
}
```

### Database Guidelines

- Use **TypeORM entities** for database models
- Create **migrations** for schema changes
- Add proper **indexes** for performance
- Use **transactions** for data consistency

### API Guidelines

- Follow **RESTful** conventions
- Use proper **HTTP status codes**
- Implement proper **error handling**
- Add **input validation**
- Include **API documentation**

## Testing

### Writing Tests

- Write **unit tests** for business logic
- Write **integration tests** for API endpoints
- Aim for **80%+ code coverage**
- Use **descriptive test names**

```typescript
// ✅ Good test
describe('AuthService', () => {
  describe('login', () => {
    it('should return JWT token when credentials are valid', async () => {
      // Test implementation
    });

    it('should throw error when email is invalid', async () => {
      // Test implementation
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration
```

## Submitting Changes

### Commit Message Format

We use **Conventional Commits** for commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(auth): add JWT token refresh functionality
fix(database): resolve connection pool timeout issue
docs(api): update authentication endpoint documentation
```

### Pre-commit Checklist

Before submitting your changes, ensure:

- [ ] Code follows the project's coding standards
- [ ] All tests pass (`npm test`)
- [ ] Code is properly formatted (`npm run format`)
- [ ] No linting errors (`npm run lint`)
- [ ] Documentation is updated if needed
- [ ] Commit messages follow the conventional format

## Pull Request Process

### Before Creating a PR

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

2. **Run the full test suite**:
   ```bash
   npm test
   npm run test:integration
   ```

3. **Check code quality**:
   ```bash
   npm run lint
   npm run format:check
   npm run type-check
   ```

### Creating a Pull Request

1. **Push your branch** to your fork
2. **Create a PR** against the `develop` branch
3. **Fill out the PR template** completely
4. **Link related issues** using keywords (e.g., "Closes #123")
5. **Request reviews** from maintainers

### PR Requirements

Your pull request must:

- [ ] Have a clear, descriptive title
- [ ] Include a detailed description of changes
- [ ] Reference related issues
- [ ] Include tests for new functionality
- [ ] Pass all CI checks
- [ ] Be reviewed by at least one maintainer
- [ ] Have an up-to-date branch (rebased on latest develop)

### PR Review Process

1. **Automated checks** must pass (CI/CD pipeline)
2. **Code review** by maintainers
3. **Address feedback** and make requested changes
4. **Final approval** and merge by maintainers

## Issue Guidelines

### Before Creating an Issue

- **Search existing issues** to avoid duplicates
- **Check the documentation** for solutions
- **Use the latest version** of the project

### Creating Quality Issues

- Use the appropriate **issue template**
- Provide **clear, detailed descriptions**
- Include **steps to reproduce** for bugs
- Add **relevant labels** and **assignees**
- Attach **screenshots** or **logs** when helpful

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority:high` - High priority issue
- `needs-triage` - Needs initial review

## Community

### Getting Help

- **GitHub Discussions** - For questions and general discussion
- **GitHub Issues** - For bug reports and feature requests
- **Email** - support@careconnecthr.com for private matters

### Code Reviews

We value constructive code reviews. When reviewing:

- Be **respectful** and **constructive**
- Focus on the **code, not the person**
- Provide **specific, actionable feedback**
- Acknowledge **good practices** and **improvements**

### Recognition

We recognize contributions in several ways:

- **Contributors** section in README
- **Release notes** mention significant contributions
- **GitHub achievements** and **profile highlights**

## Development Tips

### Useful Commands

```bash
# Start development server
npm run dev

# Run tests in watch mode
npm run test:watch

# Check TypeScript types
npm run type-check

# Format all code
npm run format

# Lint and fix issues
npm run lint

# Generate test coverage report
npm run test:coverage
```

### Debugging

- Use **VS Code debugger** with the provided launch configuration
- Enable **detailed logging** in development
- Use **Chrome DevTools** for Node.js debugging

### Performance

- Use **PostgreSQL EXPLAIN** for query optimization
- Monitor **memory usage** during development
- Profile **API endpoints** for performance bottlenecks

## Thank You! 🙏

Thank you for contributing to Care HR Backend! Your efforts help make this project better for everyone. We appreciate your time and expertise.

---

**Questions?** Feel free to reach out via [GitHub Discussions](https://github.com/Johnaderounmu/care_hr_backend/discussions) or create an issue.