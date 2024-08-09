## Actions Proposal

This library is designed to manage user actions on entities based on context, leveraging the power of TypeScript generics. It provides a flexible and type-safe way to define and control what actions a user can perform on specific entities within different contexts. By using generics, the library ensures that the actions and contexts are strongly typed, reducing runtime errors and improving the developer experience. Whether you need to manage permissions, workflows, or dynamic behavior, this library offers a robust solution tailored to your TypeScript applications.


#### Proyect structure

- frontend/lib (agnostic lib)
    - core
      - interfaces
        - index.ts
    - documents
      - actions
        - create.ts
        - edit.ts
        - delete.ts
        - assign.ts
        - sign.ts
        - recover.ts
      - policies
        - is-editor.ts
        - is-signer.ts
        - have-some-firmante.ts
    - admin
      - actions
        - add-user.ts
        - ...
        - ...
      - policies
        - is-admin.ts
- frotented/src (react)
    - pages
    - context
      - document-context.tsx
    - components 
  
### Interfaces

@lib/core/interfaces 

````ts
type IContext = Record<string, unknown>

type IActionParam = Record<string, unknown>

interface IPolicy<T extends IContext> {
  test: (context: T) => boolean;
}

interface IAction<T extends IContext , V extends IActionParam> {
  id: unknown;
  name: string;
  policies: IPolicy<T> | IPolicy<T>[] | null;
  exec?: (params: V) => Promise<unknown>;
}

interface IActionBuilder<T extends IContext, V extends IActionParam> {
  build: (actions: IAction<T, V>[], context: T) => IAction<T, V>[];
}
````

### Custom Implementation

@lib/documents
````ts

import { IAction, IContext, IActionParam, IPolicy, IActionBuilder } from '@lib/core/interfaces'

enum DocumentActions {
  FREE,
  ADMIN,
  EDITOR
}

enum DocumentTypes {
  NTA,
  DEX,
  DGDH,
  EXP
}

type DocumentContext = IContext & {
  user: {
    id: string
  },
  document: {
    type: DocumentTypes
  }
}

type DocumentActionParams = IActionParam & {
  gpdid: string
}

type DocumentAction = IAction<DocumentContext, DocumentActionParams> & { 
  id: DocumentActions,
  types: DocumentTypes | DocumentTypes[] | null
}

type DocumentActionBuilder = IActionBuilder<DocumentContext, DocumentActionParams>

type DocumentPolicy = IPolicy<DocumentContext> 


const actionBuilder: DocumentActionBuilder = {
  build: (actions: IAction<DocumentContext, DocumentActionParams>[], context: DocumentContext): IAction<DocumentContext, DocumentActionParams>[] => {
    return actions.filter((action: IAction<DocumentContext, DocumentActionParams>) => {
      const { types } = action as DocumentAction
      if (Array.isArray(types)) {
        if (!types.includes(context.document.type)) return false
      } else {
        if (types !== null){
          if (types !== context.document.type) return false
        }  
      }

      if (action.policies === null) return true
      if (Array.isArray(action.policies)) 
        return action.policies.every((policy: DocumentPolicy) =>
          policy.test(context),
        );
      return (action.policies as DocumentPolicy).test(context);
    });
  },
};

const isAdmin: DocumentPolicy = {
  test: ({ user }: DocumentContext): boolean => {
    if (!user) return false
    return user.id === "testId";
  },
};

const isEditor: DocumentPolicy = {
  test: ({ user }: DocumentContext): boolean => {
    if (!user) return false
    return user.id === "testId";
  },
};

const DoSomeAction = async ({ foo, gpdid }: DocumentActionParams) : Promise<Record<string, unknown>> => {
  if (!foo) throw new Error('Bad request.')
  if (!gpdid) throw new Error('GPDID Is Required')
  return {foo: 23, gpdid: gpdid}
};


const secureActions: DocumentAction[] = [
  {
    id: DocumentActions.ADMIN,
    name: "Test",
    policies: isAdmin,
    types: DocumentTypes.DEX,
    exec: async ({foo} : DocumentActionParams) : Promise<boolean> =>  {
      console.log('test')
      if (!foo) throw new Error('Parameter foo is required')
      return true
    }
  },
  {
    id: DocumentActions.EDITOR,
    name: "Square",
    policies: [isAdmin, isEditor],
    types: [DocumentTypes.NTA, DocumentTypes.DEX],
    exec: async ({bar, gpdid } : DocumentActionParams) : Promise<number> => {
      if (!gpdid) throw new Error('Bad request')
      if (typeof bar !== 'number') throw new Error('Bad request.')
      return bar ** bar
    }
  },
];

const freeAction: DocumentAction = {
    id: DocumentActions.FREE,
    name: "Free world",
    policies: null,
    exec: DoSomeAction,
    types: [DocumentTypes.DGDH, DocumentTypes.DEX]
}

````


### Use case
````ts

import { DocumentTypes, DocumentActions } from '@lib/documents/types'
import { secureActions, freeActions } from '@lib/documents/actions'
import { actionBuilder } from '@lib/documents/builder'

const actions = [...secureActions, freeAction]

const availableActions = actionBuilder.build(actions, {user: {id: 'testId'}, document: {
  type: DocumentTypes.DEX
} })


const can = (actionID: DocumentActions) : boolean => {
  return availableActions.some((action) => 
    action.id === actionID
  )
}

const callAction = async (actionID: DocumentActions, params: DocumentActionParams) => {
  const action = availableActions.find((action) => action.id === actionID)
  if (!action || !action.exec) return
  return await action.exec(params)
}

async function test() {
  if (can(DocumentActions.EDITOR)) {
    const result = await callAction(DocumentActions.EDITOR, {
      foo: 'bar',
      bar: 4,
      gpdid: 'DEX-0001-2024'
    })
    console.log(result)
  }  
}

test()


````
