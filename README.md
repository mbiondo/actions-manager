# Actions Manager

A TypeScript library designed to manage user actions on entities, with policies that define whether an action can be executed based on the current context.

## Features

- Policy-based action management.
- Add, remove, and set actions dynamically.
- Execute actions based on user context and policies.

## Installation

Install the package via npm:

```bash
npm install @mbiondo/actions-manager
```

Or via yarn:

```bash
yarn add @mbiondo/actions-manager
```

## Basic Usage

### 1. Defining the Context and Action Parameters

First, define your app-specific context and action parameters by extending `IContext` and `IActionParam`:

```typescript
import { IContext, IActionParam } from '@mbiondo/actions-manager';

interface AppContext extends IContext {
  user: { role: string; permissions: string[] };
  document: { ownerId: number; status: string };
}

interface AppActionParams extends IActionParam {
  docId: number;
}
```

### 2. Defining Actions and Policies

Actions must be associated with one or more policies that test the current context. Here’s an example of how to define actions and set policies:

```typescript
import { ActionManager, IAction, IPolicy } from '@mbiondo/actions-manager';

const editPolicy: IPolicy<AppContext> = {
  test: async (context) => context.user.permissions.includes('edit')
};

const deletePolicy: IPolicy<AppContext> = {
  test: async (context) => context.user.role === 'admin'
};

const actions: IAction<AppContext, AppActionParams>[] = [
  { id: 'edit', name: 'Edit Document', policies: editPolicy, exec: async (params) => {/* logic */} },
  { id: 'delete', name: 'Delete Document', policies: deletePolicy, exec: async (params) => {/* logic */} }
];
```

### 3. Setting Up the Action Manager

Create an instance of the `ActionManager`, passing your custom context and action parameters types:

```typescript
const context: AppContext = {
  user: { role: 'admin', permissions: ['edit', 'delete'] },
  document: { ownerId: 1, status: 'draft' }
};

const actionManager = new ActionManager<AppContext, AppActionParams>();
actionManager.setActions(actions);
actionManager.setContext(context);
```

### 4. Checking Permissions

You can verify whether an action can be executed based on the associated policies by using `canExecute`:

```typescript
const canEdit = await actionManager.canExecute('edit');
console.log(canEdit);  // true if the context passes the 'edit' policy
```

### 5. Executing Actions

To execute an action, you call the `execute` method, passing the action ID and the necessary parameters:

```typescript
const params: AppActionParams = { docId: 123 };
const result = await actionManager.execute('edit', params);
console.log('Edit action executed:', result);
```

## API Reference

### `ActionManager<T extends IContext, V extends IActionParam>`

#### Properties:
- `actions: IAction<T, V>[]` - The list of available actions.
- `context: T` - The current context, which is used by the policies to validate actions.

#### Methods:
- `setContext(context: T): void` - Sets the current context.
- `getContext(): T` - Returns the current context.
- `addAction(action: IAction<T, V>): void` - Adds a new action.
- `setActions(actions: IAction<T, V>[]): void` - Sets the list of available actions.
- `getActions(): IAction<T, V>[]` - Returns the list of actions.
- `canExecute(actionID: string): Promise<boolean>` - Checks if the action can be executed based on policies.
- `execute<R>(actionID: string, params: V): Promise<R>` - Executes an action and returns the result.

### `IAction<T extends IContext, V extends IActionParam>`

Represents an action that can be executed.

```typescript
interface IAction<T extends IContext = IContext, V extends IActionParam = IActionParam> {
  id: unknown;
  name?: string;
  policies: IPolicy<T> | IPolicy<T>[] | IPolicy<T>[][] | null;
  exec: (params: V) => Promise<unknown>;
}
```

### `IPolicy<T extends IContext>`

Defines a policy that tests the context to determine if an action can be executed.

```typescript
interface IPolicy<T extends IContext = IContext> {
  test(context: T): Promise<boolean>;
}
```

## Contributing

Feel free to submit issues or pull requests to improve the library.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
