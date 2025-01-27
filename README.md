# fragments
Fragments back-end API

## WSL 

- Access sql: 

```sh
wsl --install 
```

- Get Github token: [Token](https://github.com/settings/tokens)

- Alias: 

```sh
alias [alias]='[command-or-path]'
```

- Open the current folder in VSCode: 
```sh
code .
```

## Important Commands: 

- Initialize the current folder as an npm project: 

```sh
npm init -y
```

- Run eslint: 

```sh
npm run lint
```

- Run test: 

```sh
npm test
```

- Run test and display only failed test cases: 

```sh
npm run test:watch
```

- Show the report of tests, and display the code lines are covered by tests: 

```sh
npm coverage
```

- Send GET request to PORT: 

```sh
curl localhost:[PORT]
```

- Use jq to pretty-print the JSON output object at PORT: 

```sh
curl -s localhost:[PORT] | jq
```

- Check if server is sending the right HTTP headers at PORT: 

```sh
curl -i localhost:[PORT]
```

- Start server: 

```sh 
npm start
```

- Start server to debug:

```sh 
npm run dev
npm run debug
```

> [!NOTE]
> Running server by **dev** and **debug** will display the received request as JSON which is prettier-response. 

## Amazon Cognito Set Up

1. Go to "Amazon Cognito", click "Create user pool" button.  

2. Select "Single-page application (SPA)" by default. Name your application. Select **Username** for ***"Options for Sign-in identifiers"***. Select **Email** for ***"Required attributes for sign-up"***. Set http://localhost:1234 ***"Add a return URL"***. Then click ***Create*** button. 

