```markdown
# eden-menu Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you the core development patterns and conventions used in the `eden-menu` TypeScript codebase. You'll learn how to structure files, write imports and exports, and follow commit and testing practices. This guide also outlines common workflows and provides handy commands for day-to-day development.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names.
  - Example: `menuItem.ts`, `userSettings.ts`

### Import Style
- Use **relative imports** for referencing local modules.
  - Example:
    ```typescript
    import { MenuItem } from './menuItem';
    ```

### Export Style
- Use **named exports** for all modules.
  - Example:
    ```typescript
    export function createMenu() { ... }
    export const MENU_VERSION = '1.0.0';
    ```

### Commit Messages
- Freeform style, no strict prefixes.
- Average commit message length: ~29 characters.
  - Example: `add menu item component`

## Workflows

### Adding a New Feature
**Trigger:** When implementing a new feature or module  
**Command:** `/add-feature`

1. Create a new file using camelCase naming.
2. Write your TypeScript code using named exports.
3. Use relative imports to include any dependencies.
4. Write corresponding tests in a `.test.ts` file.
5. Commit your changes with a concise, descriptive message.

### Refactoring Existing Code
**Trigger:** When improving or restructuring existing code  
**Command:** `/refactor`

1. Identify the code to refactor.
2. Update file names to camelCase if needed.
3. Ensure all imports remain relative and correct.
4. Maintain named exports.
5. Update or add tests as necessary.
6. Commit with a clear message describing the refactor.

### Writing Tests
**Trigger:** When adding or updating tests  
**Command:** `/write-test`

1. Create or update a test file matching `*.test.ts`.
2. Write tests for all new or changed functionality.
3. Use the project's preferred (unknown) testing framework.
4. Run tests to ensure correctness.
5. Commit test changes with a descriptive message.

## Testing Patterns

- Test files are named with the pattern `*.test.ts`.
- The specific testing framework is not detected; follow existing test file patterns.
- Place tests alongside or near the code they test.
- Example:
  ```typescript
  // menuItem.test.ts
  import { createMenu } from './menuItem';

  describe('createMenu', () => {
    it('should create a menu', () => {
      // test implementation
    });
  });
  ```

## Commands

| Command        | Purpose                                   |
|----------------|-------------------------------------------|
| /add-feature   | Scaffold and commit a new feature/module  |
| /refactor      | Refactor existing code and commit changes |
| /write-test    | Add or update tests for your code         |
```