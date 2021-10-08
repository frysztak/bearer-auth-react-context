# Bearer Auth React Context

Bearer Auth React Context is a React Context meant to simplify integrations with APIs using Bearer Token Authorization.

Features:

- network library (fetch, axios, etc.) agnostic
- automatically handles token refresh
- handles various edge cases (e.g.: if two requests fail at the same time, only one refresh request is sent)
- stores Bearer auth token in `localStorage`
- provides convenient wrapper for network calls
- provides callbacks for when token refresh succeeds or fails
- plays nice with React-Query

For more details, see [docs](https://frysztak.github.io/bearer-auth-react-context).
