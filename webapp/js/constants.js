const TASKS_PATH = "/tasks";
const RUNNING_TASK_STATUS_PATH = "/tasks/executions";
const ONGOING_TASK_LOG_PATH = "/tasks/executions/ongoing";
const LAST_TASK_LOG_PATH = "/tasks/executions/last";
const PAUSE_TASK_PATH = "/tasks/executions/pause";
const RESUME_TASK_PATH = "/tasks/executions/resume";
const STOP_TASK_PATH = "/tasks/executions/stop";
const USERS_PATH = "/users";
const LOGIN_PATH = "/users/login";
const UPLOAD_PATH = "/upload";
const ANALYSIS_PATH = "/analysis";
const BASIC_AUTH_PREFIX = "Basic ";

const ONGOING_TASK_POLL_INTERVAL = 2000;
const TASK_STATES = {
    "-1": {
        statusText: "Stopped"
    },
    0: {
        statusText: "Running"
    },
    1: {
        statusText: "Paused"
    }
};

const ACTION_UNAVAILABLE = "Action unavailable";

const LOPT_APP = "Lopt.App";
const LOPT_COMPONENT = "Lopt";

const LOPT_PAGE_MAIN = "Lopt.Pages.Main";
const LOPT_PAGE_ONGOING_TASK = "Lopt.Pages.OngoingTask";
const LOPT_PAGE_LAUNCHPAD = "Lopt.Pages.Launchpad";
const LOPT_PAGE_TASK_EDITOR = "Lopt.Pages.TaskEditor";
const LOPT_PAGE_GET_TASKS = "Lopt.Pages.TasksListing";
const LOPT_PAGE_TASK_DETAILS = "Lopt.Pages.TaskDetails";
const LOPT_PAGE_CREATE_USER = "Lopt.Pages.CreateUser";
const LOPT_PAGE_GET_USERS = "Lopt.Pages.UsersListing";
const LOPT_PAGE_UPLOAD_SCRIPT = "Lopt.Pages.UploadScript";

const LOPT_PAGE_ONGOING_TASK_TITLE = "Monitoring of an ongoing task";
const LOPT_PAGE_LAUNCHPAD_TITLE = "Launchpad";
const LOPT_PAGE_CREATE_TASK_TITLE = "Create Task";
const LOPT_PAGE_GET_TASKS_TITLE = "Tasks";
const LOPT_PAGE_TASK_DETAILS_TITLE = "Task Details";
const LOPT_PAGE_UPDATE_TASK_TITLE = "Update Task";
const LOPT_PAGE_CREATE_USER_TITLE = "Create User";
const LOPT_PAGE_GET_USERS_TITLE = "Users";
const LOPT_PAGE_UPLOAD_SCRIPT_TITLE = "Upload Script";

const LOPT_VIEW_MAIN = "Lopt.Views.Main";
const LOPT_VIEW_ONGOING_TASK = "Lopt.Views.OngoingTask";
const LOPT_VIEW_LAUNCHPAD = "Lopt.Views.Launchpad";
const LOPT_VIEW_TASK_EDITOR = "Lopt.Views.TaskEditor";
const LOPT_VIEW_GET_TASKS = "Lopt.Views.TasksListing";
const LOPT_VIEW_TASK_DETAILS = "Lopt.Views.TaskDetails";
const LOPT_VIEW_CREATE_USER = "Lopt.Views.CreateUser";
const LOPT_VIEW_GET_USERS = "Lopt.Views.UsersListing";
const LOPT_VIEW_UPLOAD_SCRIPT = "Lopt.Views.UploadScript";

const LOPT_BASE_CONTROLLER = "Lopt.Controllers.Base";
const LOPT_CONTROLLER_MAIN = "Lopt.Controllers.Main";
const LOPT_CONTROLLER_ONGOING_TASK = "Lopt.Controllers.OngoingTask";
const LOPT_CONTROLLER_LAUNCHPAD = "Lopt.Controllers.Launchpad";
const LOPT_CONTROLLER_TASK_EDITOR = "Lopt.Controllers.TaskEditor";
const LOPT_CONTROLLER_GET_TASKS = "Lopt.Controllers.TasksListing";
const LOPT_CONTROLLER_TASK_DETAILS = "Lopt.Controllers.TaskDetails";
const LOPT_CONTROLLER_CREATE_USER = "Lopt.Controllers.CreateUser";
const LOPT_CONTROLLER_GET_USERS = "Lopt.Controllers.UsersListing";
const LOPT_CONTROLLER_UPLOAD_SCRIPT = "Lopt.Controllers.UploadScript";

const SIDE_NAV_TOGGLE_BUTTON = "sideNavigationToggleButton";
const NAV_HOME = "home";
const NAV_LAUNCHPAD = "launchpad";
const NAV_TASKS = "tasks";
const NAV_USERS = "users";
const NAV_ONGOING_TASK = "ongoingTask";
const NAV_CREATE_TASK = "createTask";
const NAV_GET_TASKS = "tasksListing";
const NAV_UPDATE_TASK = "updateTask";
const NAV_GET_USERS = "usersListing";
const NAV_CREATE_USER = "createUser";
const NAV_UPLOAD_SCRIPT = 'uploadScript'

const ROUTING_METADATA_CONFIG = {
    rootView: {
        viewName: LOPT_VIEW_MAIN,
        type: "JS",
        async: true,
        id: LOPT_VIEW_MAIN
    },
    routing: {
        routes: {
            [NAV_HOME]: {
                pattern: ""
            },
            [NAV_LAUNCHPAD]: {
                pattern: NAV_LAUNCHPAD
            },
            [NAV_ONGOING_TASK]: {
                pattern: NAV_TASKS + "/ongoing"
            },
            [NAV_CREATE_TASK]: {
                pattern: NAV_TASKS + "/create"
            },
            [NAV_GET_TASKS]: {
                pattern: NAV_TASKS
            },
            [NAV_TASKS]: {
                pattern: NAV_TASKS + "/{taskId}"
            },
            [NAV_UPDATE_TASK]: {
                pattern: NAV_TASKS + "/{taskId}/edit"
            },
            [NAV_GET_USERS]: {
                pattern: NAV_USERS
            },
            [NAV_CREATE_USER]: {
                pattern: NAV_USERS + "/create"
            },
            [NAV_UPLOAD_SCRIPT]: {
                pattern: NAV_UPLOAD_SCRIPT
            }
        }
    }
};

const NAV_CONTENT = [
    {
        id: NAV_LAUNCHPAD,
        route: ROUTING_METADATA_CONFIG.routing.routes[NAV_LAUNCHPAD].pattern,
        icon: "sap-icon://grid",
        text: "Launchpad"
    },
    {
        id: NAV_CREATE_TASK,
        route: ROUTING_METADATA_CONFIG.routing.routes[NAV_CREATE_TASK].pattern,
        icon: "sap-icon://add-document",
        text: "Create Task"
    },
    {
        id: NAV_GET_TASKS,
        route: ROUTING_METADATA_CONFIG.routing.routes[NAV_GET_TASKS].pattern,
        icon: "sap-icon://activity-items",
        text: "Browse Tasks"
    },
    {
        id: NAV_CREATE_USER,
        route: ROUTING_METADATA_CONFIG.routing.routes[NAV_CREATE_USER].pattern,
        icon: "sap-icon://add-employee",
        text: "Create User"
    },
    {
        id: NAV_GET_USERS,
        route: ROUTING_METADATA_CONFIG.routing.routes[NAV_GET_USERS].pattern,
        icon: "sap-icon://account",
        text: "Browse Users"
    },
    {
        id: NAV_UPLOAD_SCRIPT,
        route: ROUTING_METADATA_CONFIG.routing.routes[NAV_UPLOAD_SCRIPT].pattern,
        icon: "sap-icon://upload",
        text: "Upload Scripts"
    }
];

const THEMES = [
    {
        name: "Horizon",
        id: "sap_horizon"
    },
    {
        name: "Horizon Dark",
        id: "sap_horizon_dark"
    },
    {
        name: "Fiori 3",
        id: "sap_fiori_3"
    },
    {
        name: "Fiori 3 Dark",
        id: "sap_fiori_3_dark"
    }
];

const DEFAULT_THEME = THEMES[0].id;
const SAVED_THEME_STORAGE_PREFIX = "loptSavedStorage";
const WORKSPACE_ENV_VAR_KEY = 'WORKSPACE';
