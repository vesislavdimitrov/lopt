class TaskObjectModel {
    constructor(json) {
        this.message = json.message;
        this.submitErrorMessage = json.submitErrorMessage;
        this.isUpdateTaskPage = json.isUpdateTaskPage;
        this.task = {
            id: json.id,
            command: json.command,
            parameters: json.parameters,
            description: json.description,
            environment_vars: json.environment_vars,
            username: json.username
        };
    }

    getMessage() {
        return this.message;
    }

    setMessage(message) {
        this.message = message;
    }

    getSubmitErrorMessage() {
        return this.submitErrorMessage;
    }

    setSubmitErrorMessage(message) {
        this.submitErrorMessage = message;
    }

    getTask() {
        return this.task;
    }

    getId() {
        return this.task.id;
    }

    setId(id) {
        this.task.id = id;
    }

    getCommand() {
        return this.task.command;
    }

    setCommand(command) {
        this.task.command = command;
    }

    getParameters() {
        return this.task.parameters;
    }

    setParameters(parameters) {
        this.task.parameters = parameters;
    }

    getDescription() {
        return this.task.description;
    }

    setDescription(description) {
        this.task.description = description;
    }

    getEnvironmentVars() {
        return this.task.environment_vars;
    }

    setEnvironmentVars(envVars) {
        this.task.environment_vars = envVars;
    }

    getUsername() {
        return this.task.username;
    }

    setUsername(username) {
        this.task.username = username;
    }

    getPassword() {
        return this.password;
    }

    setPassword(password) {
        this.password = password;
    }

    getIsUpdateTaskPage() {
        return Boolean(this.isUpdateTaskPage);
    }

    setIsUpdateTaskPage(bool) {
        this.isUpdateTaskPage = bool;
    }

    validateCommand() {
        if (!this.task.command) {
            return false;
        }
        return true;
    }

    validateDescription() {
        if (!this.task.description) {
            return false;
        }
        return true;
    }

    validateEnvironmentVarKey(key) {
        const regex = new RegExp("^[a-zA-Z_]+[a-zA-Z0-9_]*$");
        return regex.test(key);
    }

    validateEnvironmentVarValue(value) {
        if (!value) {
            return false;
        }
        return true;
    }

    validatePassword() {
        if (!this.password) {
            return false;
        }
        return true;
    }
}
