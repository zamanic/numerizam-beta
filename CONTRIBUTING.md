# Contributing to Numerizam

Thank you for your interest in contributing to Numerizam! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or later)
- Python (v3.8 or later)
- Git
- A code editor (VS Code recommended)

### Setting Up the Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/numerizam.git
   cd numerizam
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/originalowner/numerizam.git
   ```
4. **Install dependencies**:
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

## 🔄 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Follow the existing code style and conventions
- Write clear, concise commit messages
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Frontend tests
npm run test

# Backend tests
cd backend
python manage.py test
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## 📝 Code Style Guidelines

### Frontend (React/TypeScript)

- Use TypeScript for all new files
- Follow React functional component patterns
- Use meaningful component and variable names
- Implement proper error handling
- Add JSDoc comments for complex functions

### Backend (Django/Python)

- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Write docstrings for all functions and classes
- Follow Django best practices
- Implement proper error handling and logging

### General Guidelines

- Keep functions small and focused
- Use descriptive variable and function names
- Comment complex logic
- Remove unused imports and variables
- Ensure consistent indentation (2 spaces for JS/TS, 4 for Python)

## 🧪 Testing

### Frontend Testing

- Write unit tests for utility functions
- Add component tests for complex components
- Test API integration points
- Ensure accessibility compliance

### Backend Testing

- Write unit tests for models and utilities
- Add integration tests for API endpoints
- Test AI agent functionality
- Verify database operations

## 📚 Documentation

When contributing, please:

- Update README.md if adding new features
- Add inline code comments for complex logic
- Update API documentation for new endpoints
- Include examples in documentation

## 🐛 Bug Reports

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, versions)
- Screenshots or error logs if applicable

## 💡 Feature Requests

For feature requests, please:

- Check if the feature already exists
- Provide clear use case and benefits
- Include mockups or examples if applicable
- Discuss implementation approach

## 🔍 Code Review Process

All contributions go through code review:

1. **Automated checks** must pass (tests, linting)
2. **Manual review** by maintainers
3. **Feedback incorporation** if needed
4. **Approval and merge** by maintainers

### Review Criteria

- Code quality and style compliance
- Test coverage and quality
- Documentation completeness
- Performance considerations
- Security implications

## 🏷️ Commit Message Format

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(api): add natural language query endpoint
fix(ui): resolve dashboard loading issue
docs(readme): update installation instructions
```

## 🚫 What Not to Contribute

Please avoid:
- Breaking changes without discussion
- Large refactoring without prior approval
- Features that don't align with project goals
- Code that doesn't follow style guidelines
- Contributions without tests

## 📞 Getting Help

If you need help:

- Check existing issues and discussions
- Create a new issue with the "question" label
- Join our community discussions
- Reach out to maintainers

## 🎉 Recognition

Contributors will be:
- Listed in the project contributors
- Mentioned in release notes for significant contributions
- Invited to join the maintainer team for consistent contributors

Thank you for contributing to Numerizam! 🚀