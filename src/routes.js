/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 React layouts
import Dashboard from "./layouts/dashboard";
import Tables from "./layouts/tables";
import Billing from "./layouts/billing";
import RTL from "./layouts/rtl";
import Notifications from "./layouts/notifications";
import Profile from "./layouts/profile";
import Strings from "./layouts/strings";  // Import the new Strings component
import Login from "./layouts/authentication/login";  // Login page with Parse integration
import Lock from "./layouts/authentication/lock";    // Lock screen
import ParseDataExample from "./layouts/parse-data";  // Parse data management example
import DarkoneExample from "./darkone/DarkoneExample"; // Darkone components example

// Protected route wrapper
import ProtectedRoute from "./routes/ProtectedRoute";

// @mui icons
import Icon from "@mui/material/Icon";

// PsyPsy CMS additional routes can be added here

// Define which routes should be protected and which should be public
const protectedRoutes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <ProtectedRoute component={<Dashboard />} />,
  },
  {
    type: "collapse",
    name: "Professionals",
    key: "professionals",
    icon: <Icon fontSize="small">people_alt</Icon>,
    route: "/professionals",
    component: <ProtectedRoute component={<Tables />} />,
  },
  {
    type: "collapse",
    name: "Clients",
    key: "clients",
    icon: <Icon fontSize="small">group</Icon>,
    route: "/clients",
    component: <ProtectedRoute component={<Tables />} />,
  },
  {
    type: "collapse",
    name: "Strings",
    key: "strings",
    icon: <Icon fontSize="small">translate</Icon>,
    route: "/strings",
    component: <ProtectedRoute component={<Strings />} />,
  },
  {
    type: "collapse",
    name: "Settings",
    key: "settings",
    icon: <Icon fontSize="small">settings</Icon>,
    route: "/settings",
    component: <ProtectedRoute component={<Profile />} />,
  },
  {
    type: "collapse",
    name: "Appointments",
    key: "billing",
    icon: <Icon fontSize="small">calendar_today</Icon>,
    route: "/billing",
    component: <ProtectedRoute component={<Dashboard />} />,
  },
  {
    type: "collapse",
    name: "Parse Data",
    key: "parse-data",
    icon: <Icon fontSize="small">cloud</Icon>,
    route: "/parse-data",
    component: <ProtectedRoute component={<ParseDataExample />} />,
  },
];

// Public routes - accessible without authentication
const publicRoutes = [
  {
    type: "collapse",
    name: "Login",
    key: "login",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/login",
    component: <Login />,
  },
  {
    name: "Lock",
    key: "lock",
    icon: <Icon fontSize="small">lock</Icon>,
    route: "/authentication/lock",
    component: <Lock />,
  },
];

// Combine all routes
const routes = [...protectedRoutes, ...publicRoutes];

export default routes;
