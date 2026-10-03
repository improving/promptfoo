# How to Trust AI

This directory contains the promptfoo configuration for evaluating AI models used in the class "How to Trust AI", appling principles from "Speed of Trust" by Covey

## Getting setup

### Install NOde
Before you begin you will need to have Node and NPM installed. AT the time of writting, [Node v24](https://nodejs.org/en/download) is recommended.

In the CLI, you can confirm node is properly setup by opening a NEW terminal (after your installation) and running:

```bash
node --version
```

### You've got git, right?
It is assumed you have git, and are able to use a command line interface, or cli. 

### Install promptfoo
You will next need to install the promptfoo cli tool. This can be done by running the following command:

```bash
npm install -g promptfoo
```

This command installed promptfoo globally, not just for this directory. We've seen several issues that require promptfoo to be accessibile globally, so it's important install with this command specifically. 

You can confirm the tool is properly installed with this command:
```bash
npx promptfoo --version
```

### Setup your agentic AI tool
After ensuring promptfoo is available, you will need to setup your preferred agentic AI tool. For example, if you want to use Claude Code, you will need to install it and configure it.  You can find install instructions for the supported tools in the `docs` folder of this repository. 

### Configure the promptfoo config file
You will need to configure the `trust-ai.config.yaml` file to use your agentic AI tool. 

For example you can enable to use Claude Code commenting out the devin provider lines (lines 22, and 47-50), and uncommenting the lines for Claude Code (lines 28, and 66-69).


### Confirm your setup
To confirm your setup is working, you can run the following command:
```bash
npm run test trust-ai.config.yaml
```

You should see some lines about promptfoo running the trust-ai config file, and then a progress bar. After some time, the evaluations should complete allowing you to see the current scores. If everything is working properly, you should see taht 1 test from the config file passed, and the other failed.


## In this Directory
- `trust-ai.config.yaml` - The main promptfoo configuration file for "How to Trust AI" training
- `simple.prompt.md` - The simple prompt used in `simple.config.yaml`, follows a stripped down RTCC prompt structure for generating a PRD. 
- `advanced.prompt.md` - The advanced prompt used in `advanced.config.yaml`, follows a more comprehensive RTCC prompt structure for generating a PRD, with some built in fluff for demonstrating the Load-Bearing Principle.
- `README.md` - This file

## How to run the Evals here

```bash
npm run test trust-ai.config.yaml
npm run view // opens the results in a web browser
```

## Troubleshooting

If you encounter issues:
1. Check that your agentic AI tool is properly configured (e.g., Devin/Claude Code is installed and authenticated)
2. Verify the config file has the correct provider settings (e.g., you have a `provider` clause for the AI tool you're using, and the `defaultTest` uses that provider)
3. Run with verbose mode to see detailed output in "test.log": `npm run test:verbose trust-ai.config.yaml`


If you hit something like:
```
Provider call failed during eval
{
    "providerId": "exec: node ./devin.js",
    "providerLabel": "Devin SWE-1.6",
    "promptIdx": 0,
    "testIdx": 1,
    "error": {
        "name": "Error",
        "message": "spawn ENAMETOOLONG"
    }
}
```

You may be hitting a path length limitation on your system. We are working on a fix for this. We have a working version for the devin provider that uses a different approach to handle long paths. PLease update the impacted provider in the config file to use `devinProvider.js` instead of `devin.js`.

 
