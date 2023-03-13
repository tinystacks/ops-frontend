# Introduction

This package contains code for the frontend of the TinyStacks OpsConsole project. If you are looking for a quick way to run the OpsConsole, please look at the [Ops CLI](https://github.com/tinystacks/ops-cli) for installation and usage instructions.

# Usage 

```bash
npm i;
npm run dev;
```
In order for this to work, you need to have the [API](https://github.com/tinystacks/ops-api) running locally on port 8000.


# Architecture
## Frameworks
This frontend package is built on React, Redux, and Next.js. It uses component libraries from [Chakra](https://chakra-ui.com) and [rsuite](https://rsuitejs.com/).

## Data flow
After launching the Ops Console Frontend and navigating to any root path, the GetConsoles api is requested. This returns a Console object that includes providers, dependencies, widgets, dahboards, and console details.

### Paths
There are 2 main paths:
1. `/`: This route uses the requested console to list all available dashboards as links.
2. `/[dashboard-route]`: This route fetches all widgets and renders them in a dashboard view.

### Widget data flow
When a /[dashboard-route] request is made, a few things happen with regards to widgets

1. A full widget render tree is created. This includes widgets directly and transitively referenced by the selected dashboard
2. The getWidget API is recursively requested for each widget in the render tree, leaf-widgets-first. Ops-API processes these requests by calling getData on each widget and returning a serialized populated widget object to the frontend
3. The frontend deserializes each widget by calling Widget.fromJson.
4. Each widget's render function is invoked and layed out according to the dashboard.
Note that only widgets directly and trasitively referenced by the selected dashboard are requested and rendered. Other widgets will not call getData until they are in context of a requested dashboard

# How it works with the API
Please see the [README.md in ops-core](https://github.com/tinystacks/ops-core/blob/main/README.md).

# Plugins
For an overview of plugins, please see [PLUGINS.md in ops-core](https://github.com/tinystacks/ops-core/blob/main/PLUGINS.md).

## Developing plugins
Please see [DEVELOPING_PLUGINS.md in ops-core](https://github.com/tinystacks/ops-core/blob/main/DEVELOPING_PLUGINS.md).
