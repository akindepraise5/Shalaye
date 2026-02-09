# Contributing to Shalaye

Thank you for your interest in contributing to Shalaye! 🎉

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/shalaye.git
   ```
3. **Load** the extension in Chrome:
   - Go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project folder

## 📝 How to Contribute

### Reporting Bugs
- Check if the issue already exists
- Include browser version and OS
- Provide steps to reproduce
- Include screenshots if applicable

### Suggesting Features
- Open an issue with `[Feature]` prefix
- Describe the use case
- Explain why it would benefit users

### Submitting Code

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Test thoroughly:
   - Test on multiple websites
   - Check both light and dark modes
   - Verify API fallback works

4. Commit with clear messages:
   ```bash
   git commit -m "Add: description of feature"
   ```

5. Push and create a Pull Request

## 🏗️ Project Structure

```
shalaye/
├── manifest.json       # Extension config
├── popup/              # Extension popup UI
├── content/            # Page content scripts
├── background/         # Service worker (API calls)
├── options/            # Settings page
└── icons/              # Extension icons
```

## 🎨 Code Style

- Use 2 spaces for indentation
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

## 🔑 API Keys

- **Never commit API keys** to the repository
- Use environment variables or config files excluded in `.gitignore`
- For testing, use your own API keys

## 📋 Pull Request Checklist

- [ ] Code follows project style
- [ ] Changes tested in Chrome
- [ ] No console errors
- [ ] README updated if needed
- [ ] Commit messages are clear

## 💬 Questions?

Open an issue with `[Question]` prefix or reach out to the maintainers.

Thank you for contributing! 🙏
