sap.ui.define(["./BaseController"], function (BaseController) {
    "use strict";

    return BaseController.extend(LOPT_CONTROLLER_TASK_DETAILS, {
        pageLoaded: function (taskId) {
            this.checkRestApiAvailability(taskId);
        },

        deleteTask: function () {
            const thisController = this;
            const modelObj = this.getView().getModel().getProperty("/obj");
            const taskId = modelObj.getId();
            const deleteTaskDialog = this.globalById("taskDetailsDeleteTaskDialog");

            $.ajax({
                type: "DELETE",
                url: CONFIG.API_BASE_URL + TASKS_PATH + "/" + taskId,
                success: function (result) {
                    thisController.returnToTasksListing();
                },
                error: function (xhr, status, error) {
                    if (deleteTaskDialog.isBusy()) {
                        deleteTaskDialog.setBusy(false);
                        deleteTaskDialog.close();
                    }

                    if (xhr.readyState != 4) {
                        thisController.serverNotAvailable(
                            "the serer has returned an unexpected response or might be down"
                        );
                    } else {
                        const result = JSON.parse(xhr.responseText);
                        modelObj.setSubmitErrorMessage(result.message);
                        thisController.getView().showDeletionErrorMessage();
                    }
                },
                complete: function () {
                    if (deleteTaskDialog.isBusy()) {
                        deleteTaskDialog.setBusy(false);
                        deleteTaskDialog.close();
                    }
                }
            });
        },

        navigateToUpdateTask: function (taskId) {
            this.navTo(NAV_UPDATE_TASK, { taskId: taskId });
        },

        validatePassword: function () {
            const modelObj = this.getView().getModel().getProperty("/obj");
            const passwordInput = this.globalById("taskDetailsExecuteTaskPasswordInput");

            modelObj.setPassword(passwordInput.getValue());

            if (!modelObj.validatePassword()) {
                passwordInput.setValueState(sap.ui.core.ValueState.Error);
                return false;
            }
            return true;
        },

        executeTask: function () {
            const thisController = this;
            const modelObj = this.getView().getModel().getProperty("/obj");
            const taskUsername = modelObj.getUsername();
            const taskUserPassword = modelObj.getPassword();
            const taskId = modelObj.getId();
            const taskDetailsPage = this.globalById(LOPT_PAGE_TASK_DETAILS);
            const executeTaskDialog = this.globalById("taskDetailsExecuteTaskDialog");

            let password = "";
            if (taskUsername) {
                password = taskUserPassword;
            }

            $.ajax({
                type: "POST",
                url: CONFIG.API_BASE_URL + RUNNING_TASK_STATUS_PATH + "/" + taskId,
                data: JSON.stringify({ password: password }),
                dataType: "json",
                processData: false,
                xhrFields: {
                    onprogress: function (e) {
                        if (e.currentTarget.status != 200) {
                            return;
                        }
                        if (executeTaskDialog.isBusy()) {
                            executeTaskDialog.setBusy(false);
                            executeTaskDialog.close();
                        }

                        if (taskDetailsPage.isBusy()) {
                            taskDetailsPage.setBusy(false);
                        }

                        thisController.navTo(NAV_ONGOING_TASK);
                    }
                },
                error: function (xhr, status, error) {
                    if (executeTaskDialog.isBusy()) {
                        executeTaskDialog.setBusy(false);
                        executeTaskDialog.close();
                    }

                    if (taskDetailsPage.isBusy()) {
                        taskDetailsPage.setBusy(false);
                    }

                    if (xhr.readyState != 4) {
                        thisController.serverNotAvailable(
                            "the serer has returned an unexpected response or might be down"
                        );
                    } else {
                        const result = JSON.parse(xhr.responseText);
                        modelObj.setSubmitErrorMessage(result.message);
                        thisController.getView().showExecutionErrorMessage();
                    }
                }
            });
        },

        returnToTasksListing: function () {
            this.navTo(NAV_GET_TASKS);
        },

        fetchTaskDetails: function (taskId) {
            const thisController = this;
            $.ajax({
                type: "GET",
                url: CONFIG.API_BASE_URL + TASKS_PATH + "/" + taskId,
                success: function (result) {
                    thisController.passModel(new TaskObjectModel(result));
                },
                error: function (xhr, status, error) {
                    thisController.displayFatalErrorMessage("The selected task cannot be found.");
                }
            });
        },

        checkRestApiAvailability: function (taskId) {
            const thisController = this;
            $.ajax({
                type: "GET",
                url: CONFIG.API_BASE_URL + "/",
                success: function (result) {
                    if (result.message != "Lopt is available") {
                        thisController.serverNotAvailable(
                            "the serer has returned an unexpected response"
                        );
                        return;
                    }
                    thisController.getView().hideLoading();
                    thisController.passModel(new TaskObjectModel({}));
                    thisController.fetchTaskDetails(taskId);
                },
                error: function (xhr, status, error) {
                    thisController.serverNotAvailable("the serer cannot be reached");
                }
            });
        },

        serverNotAvailable: function (message) {
            this.displayFatalErrorMessage(
                "The Lopt REST API is currently unavailable (" + message + ")."
            );
        },

        displayFatalErrorMessage: function (message) {
            const obj = {
                message: message
            };
            this.passModel(new TaskObjectModel(obj));
        }
    });
});
