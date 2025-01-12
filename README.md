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
npm run dev
npm run debug
```

> [!NOTE]
> Running server by **dev** and **debug** will display the received request as JSON which is prettier-response. 






