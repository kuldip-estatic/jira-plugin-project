## Description

A Jira plugin app that provides a view that lists all the issues of all projects under a domain. We can view all the fields related to issues, sort, filtering with pagination to minimize the view.

## Technologies Used

- Node JS
- React JS
- Handlebars JS
- JIRA
- Ngrok (Development only, its free to use)

## Prerequisites

- Need text editor or favourite IDE (Visual studio code is most usable).
- A Basic knowledge of javascript, react, node.
- Basic understanding of jira to use.
- Install latest Node, Npm, Nodemon, express version.
- Latest React, React-Dom version.
- Latest styled-comonents for styling.
- Install latest ngrok for system usage(example for mac).
- Install atlassian-connect-express.
- Install atlasskit components for use components like table, button, textfields, dropdown, etc.

## About Atlassian-Connect-Express.

- atlassian-connect-express (ACE) is a toolkit for creating Atlassian Connect based Add-ons with Node.js.
- Add-ons built with Atlassian Connect extend Atlassian cloud-based applications over standard web protocols and APIs.

## Setup your development environment.

- signup or signin in jira atlassian.
- Enable development mode in your jira.
  1. In top navigator, click Apps -> Manage Your Apps.
  2. In User-installed apps -> settings -> Enable development mode and then click apply.

## Setup your local development environment.

- Use ngrok for work locally and test against your atlassian cloud instance.
- Install ngrok for your system. (npm install -g ngrok).
- Signup in ngrok after installation and register authtoken shown on ngrok dashboard.(if you skip, your app iframes will not display),(ngrok authtoken <token>).

## Create Atlassian connect express app.

- Follows below steps for build the atlassian connect app.

  1. npm i -g atlas-connect
  2. atlas-connect new <project_name>
  3. npm install
  4. Install ngrok.
  5. Create file called credentials.json from credentials.json.sample, update all details and put it on .gitignore.
     - hostsname of yours atlassian.net.
     - Username must be your email from which you login.
     - password you have to put authtoken.
       (authtoken you have to create from setting -> atlassian account setting -> security -> Create and manage API tokens -> and create api tokens).
  6. In atlassian-connect.json, update baseurl and put ngrok link.(you get ngrok link by run ngrok http 3000 in the terminal).
  7. Now you can run your start command (npm start or npm run watch).
  8. App installed on your jira account, to display it follows.
     - On navigation bar, Apps -> Your app name is shown here.

## Setup for installation. (not for development, its for testing by install app).

- Login to jira account.
- Open jira dashboard.
- Press Apps -> Manage your apps -> settings -> Enable development mode.
- Now for installing app Apps -> Manage your apps -> upload app [paste ngrok link in it].
- We can see installed app on Apps of jira dashboard.
