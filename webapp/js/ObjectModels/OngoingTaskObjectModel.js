class OngoingTaskObjectModel {
    constructor(json) {
        this.running_task_status = json.running_task_status;
        this.log = json.log;
        this.exit_code = json.exit_code;
    }

    getRunningTaskStatus() {
        return this.running_task_status;
    }

    getLog() {
        return this.log;
    }

    getExitCode() {
        return this.exit_code;
    }
}
