sap.ui.define(["./BaseController"], function (BaseController) {
    "use strict";

    return BaseController.extend(TASK_EXECUTOR_CLIENT_CONTROLLER_TASK_EDITOR, {
        pageLoaded: function (taskId) {
            this.checkRestApiAvailability(taskId);
        },

        initialFetchTaskDetails: function (taskId) {
            const thisController = this;
            $.ajax({
                type: "GET",
                url: CONFIG.API_BASE_URL + TASKS_PATH + "/" + taskId,
                success: function (result) {
                    result.isUpdateTaskPage = true;
                    thisController.passModel(new TaskObjectModel(result));
                },
                error: function (xhr, status, error) {
                    thisController.displayFatalErrorMessage("The selected task cannot be found.");
                }
            });
        },

        saveModel: function () {
            const modelObj = this.getView().getModel().getProperty("/obj");
            const environmentVarsInputItems = this.globalById(
                "taskEditorEnvironmentVariablesInput"
            ).getItems();
            modelObj.setCommand(this.globalById("taskEditorCommandInput").getValue());
            modelObj.setParameters(this.globalById("taskEditorParametersInput").getValue());
            modelObj.setDescription(this.globalById("taskEditorDescriptionInput").getValue());
            const environmentVars = {};
            for (let i = 1; i < environmentVarsInputItems.length - 1; i++) {
                const environmentVariableItems = environmentVarsInputItems[i].getItems();
                const envVarKey = environmentVariableItems[1].getValue();
                const envVarValue = environmentVariableItems[3].getValue();
                environmentVars[envVarKey] = envVarValue;
            }
            modelObj.setEnvironmentVars(environmentVars);
            modelObj.setUsername(this.globalById("taskEditorUsernameInput").getValue());
        },

        submitTask: function () {
            const modelObj = this.getView().getModel().getProperty("/obj");
            const isUpdateTaskPage = modelObj.getIsUpdateTaskPage();
            this.saveModel();
            const validationSuccessful = this.validateTask();
            if (validationSuccessful) {
                this.globalById(TASK_EXECUTOR_CLIENT_PAGE_TASK_EDITOR).setBusy(true);
                if (isUpdateTaskPage) {
                    this.updateTask();
                } else {
                    this.createTask();
                }
                return;
            }
        },

        updateTask: function () {
            const thisController = this;
            const modelObj = this.getView().getModel().getProperty("/obj");
            const taskId = modelObj.getId();
            const taskToSend = modelObj.getTask();
            $.ajax({
                type: "PUT",
                url: CONFIG.API_BASE_URL + TASKS_PATH + "/" + taskId,
                data: JSON.stringify(taskToSend),
                success: function (result) {
                    thisController.globalById(TASK_EXECUTOR_CLIENT_PAGE_TASK_EDITOR).setBusy(false);
                    thisController.getView().showSuccessMessageAndCleanFields();
                },
                error: function (xhr, status, error) {
                    thisController.globalById(TASK_EXECUTOR_CLIENT_PAGE_TASK_EDITOR).setBusy(false);
                    if (xhr.readyState != 4 || (xhr.status != 400 && xhr.status != 404)) {
                        thisController.taskExecutorNotAvailable(
                            "the API has returned an unexpected response or might be down"
                        );
                    } else if (xhr.status == 400) {
                        const result = JSON.parse(xhr.responseText);
                        modelObj.setSubmitErrorMessage(result.message);
                        thisController.getView().showSubmitErrorMessage();
                    } else if (xhr.status == 404) {
                        const result = JSON.parse(xhr.responseText);
                        modelObj.setMessage(result.message);
                        thisController.getView().showFatalErrorMessage(true);
                    }
                }
            });
        },

        createTask: function () {
            const thisController = this;
            const modelObj = this.getView().getModel().getProperty("/obj");
            const taskToSend = modelObj.getTask();
            $.ajax({
                type: "POST",
                url: CONFIG.API_BASE_URL + TASKS_PATH,
                data: JSON.stringify(taskToSend),
                success: function (result) {
                    thisController.globalById(TASK_EXECUTOR_CLIENT_PAGE_TASK_EDITOR).setBusy(false);
                    modelObj.setId(result.id);
                    thisController.getView().showSuccessMessageAndCleanFields();
                },
                error: function (xhr, status, error) {
                    thisController.globalById(TASK_EXECUTOR_CLIENT_PAGE_TASK_EDITOR).setBusy(false);
                    if (xhr.readyState != 4 || xhr.status != 400) {
                        thisController.taskExecutorNotAvailable(
                            "the API has returned an unexpected response or might be down"
                        );
                    } else {
                        const result = JSON.parse(xhr.responseText);
                        modelObj.setSubmitErrorMessage(result.message);
                        thisController.getView().showSubmitErrorMessage();
                    }
                }
            });
        },

        validateTask: function () {
            const modelObj = this.getView().getModel().getProperty("/obj");
            const environmentVarsInputItems = this.globalById(
                "taskEditorEnvironmentVariablesInput"
            ).getItems();
            const commandInput = this.globalById("taskEditorCommandInput");
            const descriptionInput = this.globalById("taskEditorDescriptionInput");
            let validationSuccessful = true;

            if (!modelObj.validateCommand()) {
                commandInput.setValueState(sap.ui.core.ValueState.Error);
                validationSuccessful = false;
            }

            if (!modelObj.validateDescription()) {
                descriptionInput.setValueState(sap.ui.core.ValueState.Error);
                validationSuccessful = false;
            }

            for (let i = 1; i < environmentVarsInputItems.length - 1; i++) {
                const environmentVariableItems = environmentVarsInputItems[i].getItems();
                const envVarKey = environmentVariableItems[1];
                const envVarValue = environmentVariableItems[3];
                if (!modelObj.validateEnvironmentVarKey(envVarKey.getValue())) {
                    envVarKey.setValueState(sap.ui.core.ValueState.Error);
                    validationSuccessful = false;
                }
                if (!modelObj.validateEnvironmentVarValue(envVarValue.getValue())) {
                    envVarValue.setValueState(sap.ui.core.ValueState.Error);
                    validationSuccessful = false;
                }
            }

            return validationSuccessful;
        },

        returnToTasksListing: function () {
            this.navTo(NAV_GET_TASKS);
        },

        checkRestApiAvailability: function (taskId) {
            const thisController = this;
            $.ajax({
                type: "GET",
                url: CONFIG.API_BASE_URL + "/",
                success: function (result) {
                    if (result.message != "Lopt is available") {
                        thisController.taskExecutorNotAvailable(
                            "the API base URL has returned an unexpected response"
                        );
                        return;
                    }
                    thisController.getView().hideLoading();
                    thisController.passModel(new TaskObjectModel({}));
                    if (typeof taskId !== "undefined") {
                        thisController.initialFetchTaskDetails(taskId);
                    }
                },
                error: function (xhr, status, error) {
                    thisController.taskExecutorNotAvailable("the API base URL cannot be reached");
                }
            });
        },

        taskExecutorNotAvailable: function (message) {
            this.passModel(new TaskObjectModel({
                message: "The Lopt REST API is currently unavailable (" + message + ")."
            }));
        },

        displayFatalErrorMessage: function (message) {
            this.passModel(new TaskObjectModel({
                message: message,
                isUpdateTaskPage: true
            }));
        }
    });
});
