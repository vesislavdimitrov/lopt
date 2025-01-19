class TasksListingObjectModel {
    constructor(json) {
        this.message = json.message;
        this.tasks = json.tasks;
    }

    getMessage() {
        return this.message;
    }

    getShouldNotFireAfterCloseDeleteDialog() {
        return Boolean(this.shouldFireAfterCloseDeleteDialog);
    }

    setShouldNotFireAfterCloseDeleteDialog(bool) {
        this.shouldFireAfterCloseDeleteDialog = bool;
    }

    getTasks() {
        return this.tasks;
    }

    getTask() {
        return this.task;
    }

    setTask(task) {
        this.task = task;
    }

    getServerContactErrorMessage() {
        return this.serverContactErrorMessage;
    }

    setServerContactErrorMessage(serverContactErrorMessage) {
        this.serverContactErrorMessage = serverContactErrorMessage;
    }

    getPassword() {
        return this.password;
    }

    setPassword(password) {
        this.password = password;
    }

    validatePassword() {
        if (!this.password) {
            return false;
        }
        return true;
    }
}
