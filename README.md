# Unify Intent JS Client

JavaScript client for interacting with the Unify Intent API in the browser.

## Table of Contents

- [Installation](#installation)
- [Cookies](#cookies)
- [Usage](#usage)
  - [Page Events](#page-view-events)
  - [Identify Events](#identify-events)
  - [Track Events](#track-events)
- [Third-Party Tools](#third-party-tools)
- [Configuration](#configuration)

## Installation

There are two ways to install the Unify Intent JS Client for two different use cases. **You should only use one of these**.

### Install the Unify Tag

This method is typically used to install the client on e.g. a marketing website (as opposed to in frontend application code).

You can automatically load and install the client by placing a `<script>` tag in the `<head>` of your HTML document. The script can be found in your Unify app [here](https://app.unifygtm.com/dashboard/settings/integrations/website-tag) and comes pre-loaded with your public Unify write key.

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

const writeKey = 'YOUR_PUBLIC_WRITE_KEY';

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

const writeKey = 'YOUR_PUBLIC_WRITE_KEY';

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
  'YOUR_PUBLIC_WRITE_KEY',
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
const unify = new UnifyIntentClient('YOUR_PUBLIC_WRITE_KEY');
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
  'YOUR_PUBLIC_WRITE_KEY',
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
const unify = new UnifyIntentClient('YOUR_PUBLIC_WRITE_KEY');
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
      domain: currentUser.organization.domain, // must match domain of email above
      name: currentUser.organization.name,
    }
  }
)
```

### Track Events

Certain user actions are valuable indicators of buying intent. You can use `track` events to log these events along with custom properties for each event that you can then use within Unify to filter your visitors and take action accordingly.

There are three ways to fire track events with the Unify intent client:

1. Manually via the client `track` method (see [here](#manual-tracking))
2. Custom HTML data attributes (see [here](#html-data-attributes))
3. Automatically with CSS selectors (see [here](#automatic-tracking))

#### Manual tracking

You can also manually trigger a track event with the `track` method on the client:

```TypeScript
const unify = new UnifyIntentClient('YOUR_PUBLIC_WRITE_KEY');
unify.mount();

// Only the event name is required - we recommend spaces between capitalized words
unify.track('See More Button Clicked');

// You can also specify custom properties to include
unify.track('Modal Opened', { modalName: 'Contact Sales Modal' });
```

The `track` method accepts two arguments:

1. A string `name` (required) - this is used to identify the event downstream within Unify.
2. An object of keys and string values `properties` (optional) - this is used to specify custom properties associated with the event which can be used for filtering and identification downstream within Unify.

#### HTML data attributes

You can leverage various data attributes in the HTML of your site or application to automatically track click events for elements you care about:

##### `data-unify-click-event-name`

The presence of this attribute on an element indicates that the intent client should automatically fire a track event when the element is clicked. The _value_ of this attribute defines the **name** of the event which will be fired. For example, clicking the `button` in the following HTML will result in a track event with the name `See More Button Clicked` to be fired:

```html
<button data-unify-click-event-name="See More Button Clicked">See more</button>
```

By default, the intent client will make a best effort at identifying a **label** for the clicked element to include in the **properties** of the event which is fired. It will do so using the text content and ARIA attributes of the element. This can be used to easily differentiate between track events with the _same name_ fired for _different elements_. If the client is not able to determine a human-readable label, the `label` property will simply be omitted from the event properties. For example, clicking the `div` in the following HTML will result in a track event with the name `Download Button Clicked` to be fired with `properties` containing a `label` with the value `Free sample`:

```html
<div data-unify-click-event-name="Download Button Clicked">Free sample</div>
```

##### `data-unify-label`

This attribute can be used to override the label (or provide a label which is otherwise missing) for an element that is tracked by the client. For example, even though clicking the `button` in the following HTML would normally result in a track event with the label `See more` to be fired, the presence of the `data-unify-label` attribute results in the event being fired with a `label` property of `Custom label`:

```html
<button
  data-unify-click-event-name="See More Button Clicked"
  data-unify-label="Custom label"
>
  See more
</button>
```

##### `data-unify-event-prop-*`

By default, only the label of an element is included in the `properties` of auto-tracked events. You can specify additional properties to include using the prefix `data-unify-event-prop-`. For example, clicking the `button` in the following HTML will result a track event to be fired with `properties` including a property of `customValue` set to `100`:

```html
<button
  data-unify-click-event-name="See More Button Clicked"
  data-unify-event-prop-custom-value="100"
>
  See more
</button>
```

#### Automatic tracking

The Unify intent client is capable of automatically monitoring elements that match a list of CSS selectors specified by you in the `UnifyIntentClientConfig`'s `autoTrackOptions.clickTrackingSelectors`. When an element matching one of these selectors is clicked by the user, the client will automatically fire a `track` event for it.

`clickTrackingSelectors` can be a list of simple CSS string selectors, in which case the default track event name `Element Clicked` will be used:

```typescript
const options: AutoTrackOptions = {
  clickTrackingSelectors: ['.button', '.another-custom-selector'],
};

// Will fire `Element Clicked` events for clicked elements matching CSS selectors
const unify = new UnifyIntentClient('YOUR_PUBLIC_WRITE_KEY', {
  autoTrackOptions: options,
});
```

Alternatively, you can customize the event name fired for each selector by passing a list of objects for `clickTrackingSelectors`, where each object contains a `selector` string and optional `eventName` which will be used as the name of the auto-tracked event:

```typescript
const options: AutoTrackOptions = {
  clickTrackingSelectors: [
    { selector: '.button', eventName: 'Button Clicked' },
    {
      selector: '.another-custom-selector',
      eventName: 'Custom Element Clicked',
    },
  ],
};

// Will fire events with specified custom names for clicked elements matching CSS selectors
const unify = new UnifyIntentClient('YOUR_PUBLIC_WRITE_KEY', {
  autoTrackOptions: options,
});
```

You can use the `data-unify-label` to customize the element `label` in the event `properties` and the `data-unify-event-prop-` prefix to add custom `properties`. See [HTML data attributes](#html-data-attributes) for more info.

If you would like to exclude a specific element from tracking which matches your specified CSS selectors list, you can do so with the `data-unify-exclude` attribute.

This behavior can be enabled or disabled programmatically via the `startAutoTrack` and `stopAutoTrack` methods on the client:

```TypeScript
// Initialize the client and tell it to automatically track clicks for all elements with class="button"
const unify = new UnifyIntentClient(
  'YOUR_PUBLIC_WRITE_KEY',
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

## Third-Party Tools

The intent client ships with out-of-the-box event tracking for some popular third-party tools such as [Default](https://www.default.com/) and [Navattic](https://www.navattic.com/). If these tools are embedded into a page where the intent client is running, the client will track relevant events automatically. This behavior can be disabled with the `UnifyIntentClientConfig`. See [configuration](#configuration) for more details on configuring the intent client.

### Default

[Default](https://www.default.com/) is a popular tool for automating inbound form submission workflows. If you use a Default form wherever the intent client is running, the client will automatically fire track events for corresponding Default form events. The following Default form events are supported:

| Default event                 | Unify event                   | Description                                                         |
| ----------------------------- | ----------------------------- | ------------------------------------------------------------------- |
| `default.form_completed`      | `Default Form Completed`      | When a user completes all steps in a form.                          |
| `default.form_page_submitted` | `Default Form Page Submitted` | When a user completes a single step of a mult-step form.            |
| `default.meeting_booked`      | `Default Meeting Booked`      | When a user successfully books a meeting via the Default scheduler. |
| `default.scheduler_closed`    | `Default Scheduler Closed`    | When a user closes the Default scheduler UI.                        |
| `default.scheduler_displayed` | `Default Scheduler Displayed` | When the Default scheduler UI is displayed to the user.             |

### Navattic

[Navattic](https://www.navattic.com/) is a popular tool for automating interactive product demos. If you use a Navattic demo wherever the intent client is running, the client will automatically fire track events for corresponding Navattic demo events. The following Navattic demo events are supported:

| Navattic event  | Unify event                 | Description                                         |
| --------------- | --------------------------- | --------------------------------------------------- |
| `START_FLOW`    | `Navattic Demo Started`     | When a user starts a Navattic demo.                 |
| `VIEW_STEP`     | `Navattic Demo Step Viewed` | When a user views a new step of the demo.           |
| `COMPLETE_FLOW` | `Navattic Demo Completed`   | When a user successfully completes the entire demo. |

## Configuration

The following configuration options can be passed when initializing the client:

- `autoPage` - Tells the client to automatically log `page` events whenever the current page changes. Works for static websites and Single Page Apps.
  - **Default**: `true` if the client is installed via the Unify JavaScript tag, `false` if installed via a package manager
- `autoIdentify` - Tells the client to automatically monitor text and email input elements on the page for changes. When the current user enters a valid email address into an input, the client will log an `identify` event for that email address.
  - **Default**: `true` if the client is installed via the Unify JavaScript tag, `false` if installed via a package manager
- `autoTrackOptions` - Options to customize the auto-tracking of user actions such as click events:
  - `clickTrackingSelectors` - Optional list of CSS selectors to customize which elements the client will automatically fire a `track` event for when clicked. Can be a list of string selectors, in which case the default track event name `Element Clicked` will be used as the event name. Can also be a list of objects containing a `selector` key and `eventName` key, in which case the value of `eventName` will be used as the event name.
  - `defaultForms` - By default, the intent client will fire track events for [Default](https://www.default.com/) form events. This option can be used to customize which Default form events will result in Unify track events being fired or disable this behavior entirely.
  - `navatticProductDemos`: By default, the intent client will fire track events for [Navattic](https://www.navattic.com/) product demos. This option can be used to customize which Navattic demo events will result in Unify track events being fired or disable this behavior entirely.
- `sessionDurationMinutes` - Length in minutes that user sessions will persist when no activities are tracked. Activities include `page`, `identify,` and `track` activities.
  - **Default**: `30`
