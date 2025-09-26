# Unify Intent JS Client

JavaScript client for interacting with the Unify Intent API in the browser.

## Table of Contents

- [Installation](#installation)
- [Cookies](#cookies)
- [Usage](#usage)
  - [Page Events](#page-view-events)
  - [Identify Events](#identify-events)
  - [Track Events](#track-events)
- [Configuration](#configuration)

## Installation

There are two ways to install the Unify Intent JS Client for two different use cases. **You should only use one of these**.

### Install the Unify Tag

This method is typically used to install the client on e.g. a marketing website (as opposed to in frontend application code).

You can automatically load and install the client by placing a `<script>` tag in the `<head>` of your HTML document. The script can be found in your Unify app [here](https://app.unifygtm.com/dashboard/settings/integrations/website-tag) and comes pre-loaded with your public Unify API key.

When you include this tag in your HTML, you will immediately be able to access the client at `window.unify` (or simply `unify` since `window` is global). See [Usage](#usage) below for how to use the client after installing.

### Install With a Package Manager

This method is typically used to install the client in e.g. frontend application code such as a Single Page App (SPA) (as opposed to on a static marketing website).

**NOTE:** See [@unifygtm/intent-react](https://www.npmjs.com/package/@unifygtm/intent-react) if you are using React.

You can install the client package directly using your preferred package manager:

#### npm

```Shell
npm install @unifygtm/intent-client
```

#### yarn

```Shell
yarn add @unifygtm/intent-client
```

After installing the package, you must initialize it in your application code and mount it:

```TypeScript
import { UnifyIntentClient, UnifyIntentClientConfig } from '@unifygtm/intent-client';
import { useEffect, useState } from 'react';

const writeKey = 'YOUR_PUBLIC_API_KEY';

const config: UnifyIntentClientConfig = {
  autoPage: true,
  autoIdentify: false,
};

const unify = new UnifyIntentClient(writeKey, config);

// Do not call mount during server side rendering. Only call it in a browser context.
unify.mount();
```

**NOTE:** The `mount` method on the client is used to initialize it once it is in a browser context. If your application uses server side rendering, you should be sure not to call `mount()` until the code is running in a browser context.

Once the client is initialized and mounted it will be immediately ready for use. See [Usage](#usage) below for how to use the client after installing. If you wish to cleanup the side effects created by initializing the client (e.g. event listeners), you can do so with the `unmount` method. Here is an example of mounting and unmounting the client in React code:

```tsx
import { UnifyIntentClient, UnifyIntentClientConfig } from '@unifygtm/intent-client';

const writeKey = 'YOUR_PUBLIC_API_KEY';

const intentClient = new UnifyIntentClient(writeKey);

const TestComponent = () => {
  const [unify] = useState<UnifyIntentClient>(intentClient);

  useEffect(() => {
    unify.mount();

    return () => {
      unify.unmount();
    };
  }, []);

  ...
}
```

## Cookies

**NOTE:** This section only applies to intent client versions `1.4.0` and up. If you install the intent client with the website tag, you automatically get access to the latest client version. Versions older than this use obfuscated cookie names. If for some reason you need access to these then you can reach out to the Unify team for support.

When the intent client mounts, it places two values in the user's cookies:

- `unify_visitor_id` - A randomly generated UUID which uniquely identifies the user. This persists across sessions.
- `unify_session_id` - A randomly generated UUID which uniquely identifies the user's current session. Sessions will persist as long as a new `page`, `identify`, or `track` event is fired at least once every 30 minutes. This duration be customized with the `sessionDurationMinutes` option on the `UnifyIntentClientConfig`.

These cookies are _first-party cookies_ and associated with the top-level domain where the intent client is running. For example, if the intent client is running on [https://www.unifygtm.com](https://www.unifygtm.com) then the cookies will be associated with `.unifygtm.com`. This means that they are accessible and reused across all subdomains of the top-level domain. In this example, if the intent client were also running on [https://app.unifygtm.com](https://app.unifygtm.com) then a visitor ID stored while on the `www` subdomain would be reused on `app` subdomain.

These cookies are stored for the maximum permitted time by Google Chrome of 400 days and updated every time the visitor visits your site. In other words, as long as the same visitor visits your site at least once every 400 days and does not clear their browser cookies, their visitor ID will be reused across sessions. Note that some browsers have default limits lower than 400 days. In these cases, the maximum allowed limit by the browser will be used.

## Usage

The Unify Intent Client can be used to log user activity across multiple subdomains of the same top-level domain. For example, if a user visits your marketing website at `www.yoursite.com` and then logs into your production web application at `app.yoursite.com`, the activity in both places will be attributed to the same person.

### Page View Events

Website page views are an indicator of buyer intent. You can log this information to the Unify platform for usage with the `page` method.

There are two ways to collect page data with the Unify intent client:

1. Automatic monitoring of the current page (see [here](#automatic-page-monitoring))
2. Manually via the client `page` method (see [here](#manual-page-logging))

Utilizing both of these methods when appropriate is recommended to take full advantage of intent data within Unify.

#### Automatic Page Monitoring

The Unify intent client is capable of automatically monitoring the user's current page to trigger page events. This will happen by default when the client is installed via the Unify JavaScript tag. If the client is installed via a package manager, you must pass the `autoPage` configuration option when instantiating the client. See [Configuration](#configuration) below for more details.

In either case, this behavior can be enabled or disabled programmatically via the `startAutoPage` and `stopAutoPage` methods on the client:

```TypeScript
// Initialize the client and tell it to automatically monitor pages
const unify = new UnifyIntentClient(
  'YOUR_PUBLIC_API_KEY',
  { autoPage: true },
);
unify.mount();

// Tell the client to stop monitoring pages
unify.stopAutoPage();

// Tell the client to start monitoring pages again
unify.startAutoPage();
```

#### Manual Page Logging

You can also manually trigger a page event with the `page` method on the client. This is useful when you do not want to trigger page events for _every_ page.

```TypeScript
const unify = new UnifyIntentClient('YOUR_PUBLIC_API_KEY');
unify.mount();

// Trigger a page event for whatever page the user is currently on
unify.page();

// Trigger a page event for a custom page that the user is not necessarily on
unify.page({ pathname: '/some-custom-page' });
```

### Identify Events

All intent data collected for users by Unify is anonymous by default. When intent events are logged, Unify will attempt to automatically de-anonymize the IP address of a user to associate them with a specific company, but their personal identity will remain anonymous until an identify event is triggered for them.

There are two ways to collect identity data with the Unify intent client:

1. Automatic monitoring of email input elements (see [here](#automatic-input-monitoring))
2. Manually via the client `identify` method (see [here](#manual-identification))

Utilizing both of these methods when appropriate is recommended to take full advantage of intent data within Unify.

#### Automatic Input Monitoring

The Unify intent client is capable of automatically monitoring text and email input elements on the page to collect user identity. This will happen by default when the client is installed via the Unify JavaScript tag. If the client is installed via a package manager, you must pass the `autoIdentify` configuration option when instantiating the client. See [Configuration](#configuration) below for more details.

In either case, this behavior can be enabled or disabled programmatically via the `startAutoIdentify` and `stopAutoIdentify` methods on the client:

```TypeScript
// Initialize the client and tell it to automatically monitor inputs
const unify = new UnifyIntentClient(
  'YOUR_PUBLIC_API_KEY',
  { autoIdentify: true },
);
unify.mount();

// Tell the client to stop monitoring inputs for now
unify.stopAutoIdentify();

// Tell the client to start monitoring inputs again
unify.startAutoIdentify();
```

#### Manual Identification

You can also manually trigger an identify event with the `identify` method on the client. This is useful when users log-in with OAuth or SSO, for example, because they do not enter their email into an input on the page.

When using this method, you can also optionally specify a set of Person or Company attributes to upsert and associate with the identified user. This is done in the form of an optional second argument to `identify`.

```TypeScript
const unify = new UnifyIntentClient('YOUR_PUBLIC_API_KEY');
unify.mount();

// However you determine the currently logged-in user
const currentUser = getCurrentUser();

// Identify the current user
unify.identify(currentUser.emailAddress);

// OR identify the current user and upsert the associated Company/Person in Unify
unify.identify(
  currentUser.emailAddress,
  {
    person: {
      email: currentUser.emailAddress,
      first_name: currentUser.firstName,
      last_name: currentUser.lastName,
    },
    company: {
      domain: currentUser.organization.domain,
      name: currentUser.organization.name,
    }
  }
)
```

### Track Events

Certain user actions are valuable indicators of buying intent. You can use `track` events to log these events along with custom properties for each event that you can then use within Unify to filter your visitors and take action accordingly.

There are three ways to fire track events with the Unify intent client:

1. Manually via the client `track` method (see [here](#manual-tracking))
2. Automatically with CSS selectors (see [here](#automatic-tracking))
3. Custom HTML data attributes (see [here](#html-data-attributes))

#### Manual tracking

You can also manually trigger a track event with the `track` method on the client:

```TypeScript
const unify = new UnifyIntentClient('YOUR_PUBLIC_API_KEY');
unify.mount();

// Only the event name is required - we recommend spaces between capitalized words
unify.track('See More Button Clicked');

// You can also specify custom properties to include
unify.track('Modal Opened', { modalName: 'Contact Sales Modal' });
```

The `track` method accepts two arguments:

1. A string `name` (required) - this is used to identify the event downstream within Unify.
2. An object of keys and string values `properties` (optional) - this is used to specify custom properties associated with the event which can be used for filtering and identification downstream within Unify.

#### Automatic tracking

The Unify intent client is capable of automatically monitoring elements that match a list of CSS selectors specified by you in the `UnifyIntentClientConfig`'s `autoTrackOptions.clickTrackingSelectors`. When an element matching one of these selectors is clicked by the user, the client will automatically fire a `track` event for it with the event name `Element Clicked`. You can use the `data-unify-label` to customize the name of the element in the event `properties` and the `data-unify-attr-` prefix to add custom `properties`. See [HTML data attributes](#html-data-attributes) for more info.

If you would like to exclude a specific element from tracking which matches your specified CSS selectors list, you can do so with the `data-unify-exclude` attribute.

This behavior can be enabled or disabled programmatically via the `startAutoTrack` and `stopAutoTrack` methods on the client:

```TypeScript
// Initialize the client and tell it to automatically track clicks for all elements with class="button"
const unify = new UnifyIntentClient(
  'YOUR_PUBLIC_API_KEY',
  { autoTrackOptions: { clickTrackingSelectors: ['.button'] } },
);
unify.mount();

// Tell the client to stop monitoring buttons for now
unify.stopAutoTrack();

// Tell the client to start monitoring buttons again
unify.startAutoTrack();

// OR tell the client to start monitoring something else
unify.startAutoTrack({ clickTrackingSelectors: ['.custom-button'] });
```

#### HTML data attributes

You can leverage various data attributes in the HTML of your site or application to automatically track click events for elements you care about:

`data-unify-track-clicks`
This attribute indicates that the intent client should automatically fire a track event when the element is clicked. The client will make a best effort at determining a label to use for the element, but if it cannot determine one then an event will _not_ be fired. If an element you would like to track does not contain any text to be used as a name, you can leverage the `data-unify-label` attribute (see below).

`data-unify-label`
This attribute can be used to override the default name (or provide a name which is otherwise missing) for an element that is tracked by the client.

`data-unify-attr-`
By default, only the name of the element is included in the `properties` of auto-tracked events. You can specify additional properties to include using this prefix. For example, setting `data-unify-attr-custom-property="100"` will result in the `properties` of the track event including `customProperty: "100"`.

## Configuration

The following configuration options can be passed when initializing the client:

- `autoPage` - Tells the client to automatically log `page` events whenever the current page changes. Works for static websites and Single Page Apps.
  - **Default**: `true` if the client is installed via the Unify JavaScript tag, `false` if installed via a package manager
- `autoIdentify` - Tells the client to automatically monitor text and email input elements on the page for changes. When the current user enters a valid email address into an input, the client will log an `identify` event for that email address.
  - **Default**: `true` if the client is installed via the Unify JavaScript tag, `false` if installed via a package manager
- `autoTrackOptions` - Options to customize the auto-tracking of user actions such as click events:
  - `clickTrackingSelectors` - Optional list of CSS selectors to customize which elements the client will automatically fire a `track` event for when clicked.
- `sessionDurationMinutes` - Length in minutes that user sessions will persist when no activities are tracked. Activities include `page`, `identify,` and `track` activities.
  - **Default**: `30`
