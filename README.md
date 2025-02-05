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

- Send request to GET /fragments:

```sh 
curl -i -u user1@email.com:password1 localhost:8080/v1/fragments
```

- Send request to POST /fragments: 

```sh 
curl -i \
  -X POST \
  -u user1@email.com:password1 \
  -H "Content-Type: text/plain" \
  -d "This is a fragment" \
  localhost:8080/v1/fragments
```

## Amazon Cognito Set Up

1. Go to **Amazon Cognito**, click **Create user pool** button.  

2. Select "Single-page application (SPA)" by default. Name your application. Select **Username** for ***"Options for Sign-in identifiers"***. Select **Email** for ***"Required attributes for sign-up"***. Set http://localhost:1234 ***"Add a return URL"***. Then click ***Create*** button. 

## EC2 Instance Set Up

1. Go to **EC2 Instance**, click **Launch instance**. 

2. Choose **Amazon Linux 2023 AMI** running in **64-bit x86** for **Amazon Machine Image (AMI)**. 

3. Choose **t2.micro** for **Instance type**. 

4. Click **Create a new key pair**. Enter **Key pair name**, choose **RSA** and **.pem**. Then click **Create key pair**. Download .pem or .ppk file to your local machine. **Don't lose this file!** 

> [!NOTE]
> If you are on Windows and use PuTTY to SSH, choose .ppk file. 
> If you are using OpenSSH(SSH command) on MacOS, Linux, or WSL2, choose .pem file. 
> People often store their ssh key files in an .ssh/ directory. 

5. **Network settings:** Click **Edit** button. By default, we have one rule defined for SSH connections. Please check the configuration of first rule: type is **ssh**, protocol is **TCP**, port range is **22**, and source type is **anywhere** (source will be **0.0.0.0/0** if you select this option). Description is optional. 

6. **Add second rule:** click **Add security group rule**. The second rule: type is **custom TCP**, protocol is **TCP**, port range is **8080** (This is the port that your fragments projcet is running on), and source type is **anywhere** (source will be **0.0.0.0/0** if you select this option). Description is optional. 

> [!NOIE]
> **0.0.0.0/0** means that any IP on the Internet can connect to the instance. You or anyone or even hackers can access
> Select **My IP** for **Source type** will write your current IP to CIDR notation if your home network uses a Static IP vs a Dynamic IP. 

7. Click **Launch instance** 

## Connect to EC2 Instance on WSL2
- Change the permissions on the .pem key file to be **read only**: 
```sh 
chmod 400 {your key filename}.pem
```

- Connect to EC2 instance: 
```sh 
ssh -i {filename}.pem ec2-user@{public-dns}
```

- Run following commands to set up system: 
```sh 
sudo yum update
sudo yum install emacs -y
sudo yum install git -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
nvm install --lts
nvm install 16
```

- For Node.js, you can switch version between the newest and version 16: 
```sh 
$ nvm use --lts
Now using node v18.13.0
$ nvm use 16
Now using node v16.19.0
```

## Run fragments Microservice on EC2
- Go to fragments folder, and achieve the source code: 
```sh 
$ npm pack
...
fragments-0.0.1.tgz
```

- Copy fragments achieve, pem, and .env to EC2 instance: 
```sh 
scp -i .ssh/{key name}.pem .env fragments-0.0.1.tgz ec2-user@{Public IPv4 DNS}:~
```

- Unzip the achieve: 
```sh 
tar -xvzf fragments-0.0.1.tgz
```

- Start server on EC2 instance: 
```sh 
cd package 
npm start
```

- Send request to running server: 
```sh 
curl -i {Public IPv4 DNS}:8080
```

## Start and Stop EC2 instance on AWS terminal 
- Start: 
```sh 
aws ec2 start-instances --instance-ids {instance-id}
```

- Stop: 
```sh 
aws ec2 stop-instances --instance-ids {instance-id}
```
