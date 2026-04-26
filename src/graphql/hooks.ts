// Thin wrappers with `any` defaults so screens work without codegen.
// Apollo Client v4 defaults TData to `{}` which breaks property access.
import { useQuery as _useQuery, useMutation as _useMutation } from '@apollo/client/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useQuery = (doc: any, opts?: any): any => _useQuery(doc, opts);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useMutation = (doc: any, opts?: any): any => _useMutation(doc, opts);
