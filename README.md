# Unify Intent JS Client

JavaScript client for interacting with the Unify Intent API in the browser.

## Installation

There are two ways to install the Unify Intent JS Client for two different use cases. **You should only use one of these**.

### Install the Unify Tag

This method is typically used to install the client on e.g. a marketing website (as opposed to in frontend application code).

You can automatically load and install the client by placing a `<script>` tag in the `<head>` of your HTML document. The script can be found in your Unify app [here](https://app.unifygtm.com/dashboard/settings/integrations/website-tag) and comes pre-loaded with your public Unify API key.

When you include this tag in your HTML, you will immediately be able to access the client at `window.unify` (or simply `unify` since `window` is global). See [Usage](#usage) below for how to use the client after installing.

### Install With a Package Manager

This method is typically used to install the client in e.g. frontend application code such as a Single Page App (SPA) (as opposed to on a static marketing website).

You can install the client package directly using your preferred package manager:

#### npm

```
npm install @unifygtm/intent-js-client
```

#### yarn

```
yarn add @unifygtm/intent-js-client
```

After installing the package, you must initialize it in your application code:

```
import * as UnifyIntentClient from '@unifygtm/intent-js-client';

const unify = new UnifyIntentClient('YOUR_PUBLIC_UNIFY_API_KEY');
```

Once the client is initialized it will be immediately ready for use. See [Usage](#usage) below for how to use the client after installing.

## Usage

### Page View Events

Website page views are an indicator of buyer intent. You can log this information to the Unify platform for usage with the `page` method.

By default, the client will automatically begin logging unique page views when it is installed. This works for static websites and Single Page Apps. Although it is recommended that you leave this enabled, if you wish to disable this behavior you can do so via the client configuration. See [Configuration](#configuration) below for more details.

You can also manually trigger a page view event as follows:

```
const unify = new UnifyIntentClient('YOUR_PUBLIC_UNIFY_API_KEY');

unify.page();
```

This will log a page view event for whatever page the user is currently on.

### Identify Events

All intent data collected for users by Unify is anonymous by default. When intent events are logged, Unify will attempt to automatically de-anonymize the IP address of a user to associate them with a specific company, but their personal identity will remain anonymous until an identify event is triggered for them.

There are two ways to collect identity data with the Unify intent client:

1. Automatic monitoring of email input elements
2. Manually via the client `identify` method

Utilizing both of these methods when appropriate is recommended to take full advantage of intent data within Unify.

#### Automatic Input Monitoring

The Unify intent client is capable of automatically monitoring text and email input elements on the page to collect user identity. This will happen by default when the client is installed via the Unify JavaScript tag. If the client is installed via a package manager, you must pass the `autoIdentify` configuration option when instantiating the client. See [Configuration](#configuration) below for more details.

In either case, this behavior can be enabled or disabled programmatically via the `startAutoIdentify` and `stopAutoIdentify` methods on the client:

```
// Initialize the client and tell it to automatically monitor inputs
const unify = new UnifyIntentClient(
  'YOUR_PUBLIC_UNIFY_API_KEY',
  { autoIdentify: true },
);

// Tell the client to stop monitoring inputs for now
unify.stopAutoIdentify();

// Tell the client to start monitoring inputs again
unify.startAutoIdentify();
```

#### Manual Identification

You can also manually trigger an identify event with the `identify` method on the client. This is useful when users log-in with OAuth or SSO, for example, because they do not enter their email into an input on the page.

```
const unify = new UnifyIntentClient('YOUR_PUBLIC_UNIFY_API_KEY');

// However you determine the currently logged-in user
const currentUser = getCurrentUser();

// Identify the current user
unify.identify(currentUser.emailAddress);
```
