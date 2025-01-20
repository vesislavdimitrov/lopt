const TASKS_PATH = "/tasks";
const RUNNING_TASK_STATUS_PATH = "/tasks/executions";
const ONGOING_TASK_LOG_PATH = "/tasks/executions/ongoing";
const LAST_TASK_LOG_PATH = "/tasks/executions/last";
const PAUSE_TASK_PATH = "/tasks/executions/pause";
const RESUME_TASK_PATH = "/tasks/executions/resume";
const STOP_TASK_PATH = "/tasks/executions/stop";
const USERS_PATH = "/users";
const UPLOAD_PATH = "/upload";

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

const TASK_EXECUTOR_CLIENT_APP = "Lopt.App";
const TASK_EXECUTOR_CLIENT_COMPONENT = "Lopt";

const TASK_EXECUTOR_CLIENT_PAGE_MAIN = "Lopt.Pages.Main";
const TASK_EXECUTOR_CLIENT_PAGE_ONGOING_TASK = "Lopt.Pages.OngoingTask";
const TASK_EXECUTOR_CLIENT_PAGE_LAUNCHPAD = "Lopt.Pages.Launchpad";
const TASK_EXECUTOR_CLIENT_PAGE_TASK_EDITOR = "Lopt.Pages.TaskEditor";
const TASK_EXECUTOR_CLIENT_PAGE_GET_TASKS = "Lopt.Pages.TasksListing";
const TASK_EXECUTOR_CLIENT_PAGE_TASK_DETAILS = "Lopt.Pages.TaskDetails";
const TASK_EXECUTOR_CLIENT_PAGE_CREATE_USER = "Lopt.Pages.CreateUser";
const TASK_EXECUTOR_CLIENT_PAGE_GET_USERS = "Lopt.Pages.UsersListing";
const TASK_EXECUTOR_CLIENT_PAGE_UPLOAD_SCRIPT = "Lopt.Pages.UploadScript";

const TASK_EXECUTOR_CLIENT_PAGE_ONGOING_TASK_TITLE = "Monitoring of an ongoing task";
const TASK_EXECUTOR_CLIENT_PAGE_LAUNCHPAD_TITLE = "Launchpad";
const TASK_EXECUTOR_CLIENT_PAGE_CREATE_TASK_TITLE = "Create Task";
const TASK_EXECUTOR_CLIENT_PAGE_GET_TASKS_TITLE = "Tasks";
const TASK_EXECUTOR_CLIENT_PAGE_TASK_DETAILS_TITLE = "Task Details";
const TASK_EXECUTOR_CLIENT_PAGE_UPDATE_TASK_TITLE = "Update Task";
const TASK_EXECUTOR_CLIENT_PAGE_CREATE_USER_TITLE = "Create User";
const TASK_EXECUTOR_CLIENT_PAGE_GET_USERS_TITLE = "Users";
const TASK_EXECUTOR_CLIENT_PAGE_UPLOAD_SCRIPT_TITLE = "Upload Script";

const TASK_EXECUTOR_CLIENT_VIEW_MAIN = "Lopt.Views.Main";
const TASK_EXECUTOR_CLIENT_VIEW_ONGOING_TASK = "Lopt.Views.OngoingTask";
const TASK_EXECUTOR_CLIENT_VIEW_LAUNCHPAD = "Lopt.Views.Launchpad";
const TASK_EXECUTOR_CLIENT_VIEW_TASK_EDITOR = "Lopt.Views.TaskEditor";
const TASK_EXECUTOR_CLIENT_VIEW_GET_TASKS = "Lopt.Views.TasksListing";
const TASK_EXECUTOR_CLIENT_VIEW_TASK_DETAILS = "Lopt.Views.TaskDetails";
const TASK_EXECUTOR_CLIENT_VIEW_CREATE_USER = "Lopt.Views.CreateUser";
const TASK_EXECUTOR_CLIENT_VIEW_GET_USERS = "Lopt.Views.UsersListing";
const TASK_EXECUTOR_CLIENT_VIEW_UPLOAD_SCRIPT = "Lopt.Views.UploadScript";

const TASK_EXECUTOR_CLIENT_BASE_CONTROLLER = "Lopt.Controllers.Base";
const TASK_EXECUTOR_CLIENT_CONTROLLER_MAIN = "Lopt.Controllers.Main";
const TASK_EXECUTOR_CLIENT_CONTROLLER_ONGOING_TASK = "Lopt.Controllers.OngoingTask";
const TASK_EXECUTOR_CLIENT_CONTROLLER_LAUNCHPAD = "Lopt.Controllers.Launchpad";
const TASK_EXECUTOR_CLIENT_CONTROLLER_TASK_EDITOR = "Lopt.Controllers.TaskEditor";
const TASK_EXECUTOR_CLIENT_CONTROLLER_GET_TASKS = "Lopt.Controllers.TasksListing";
const TASK_EXECUTOR_CLIENT_CONTROLLER_TASK_DETAILS = "Lopt.Controllers.TaskDetails";
const TASK_EXECUTOR_CLIENT_CONTROLLER_CREATE_USER = "Lopt.Controllers.CreateUser";
const TASK_EXECUTOR_CLIENT_CONTROLLER_GET_USERS = "Lopt.Controllers.UsersListing";
const TASK_EXECUTOR_CLIENT_CONTROLLER_UPLOAD_SCRIPT = "Lopt.Controllers.UploadScript";

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
        viewName: TASK_EXECUTOR_CLIENT_VIEW_MAIN,
        type: "JS",
        async: true,
        id: TASK_EXECUTOR_CLIENT_VIEW_MAIN
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
