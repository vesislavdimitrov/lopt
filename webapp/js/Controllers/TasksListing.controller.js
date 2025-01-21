sap.ui.define(["./BaseController"], function (BaseController) {
    "use strict";

    return BaseController.extend(LOPT_CONTROLLER_GET_TASKS, {
        pageLoaded: function () {
            this.checkRestApiAvailability();
        },

        refreshTasksListing: function () {
            this.getView().createTasksListingTable();
            this.fetchAllTasks();
        },

        deleteTask: function () {
            const thisController = this;
            const modelObj = this.getView().getModel().getProperty("/obj");
            const task = modelObj.getTask();
            const deleteTaskDialog = this.globalById("getTasksDeleteTaskDialog");

            $.ajax({
                type: "DELETE",
                url: CONFIG.API_BASE_URL + TASKS_PATH + "/" + task.id,
                success: function (result) {
                    if (deleteTaskDialog.isBusy()) {
                        deleteTaskDialog.setBusy(false);
                        deleteTaskDialog.close();
                    }
                },
                error: function (xhr, status, error) {
                    if (deleteTaskDialog.isBusy()) {
                        deleteTaskDialog.setBusy(false);
                    }

                    if (xhr.readyState != 4) {
                        thisController.serverNotAvailable(
                            "the serer has returned an unexpected response or might be down"
                        );
                        thisController
                            .getView()
                            .getModel()
                            .getProperty("/obj")
                            .setShouldNotFireAfterCloseDeleteDialog(true);
                        deleteTaskDialog.close();
                    } else {
                        // http error
                        const result = JSON.parse(xhr.responseText);
                        modelObj.setServerContactErrorMessage(result.message);
                        thisController.getView().showDeletionErrorMessage();
                    }
                }
            });
        },

        validatePassword: function () {
            const modelObj = this.getView().getModel().getProperty("/obj");
            const passwordInput = this.globalById("getTasksExecuteTaskPasswordInput");

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
            const task = modelObj.getTask();
            const getTasksPage = this.globalById(LOPT_PAGE_GET_TASKS);
            const executeTaskDialog = this.globalById("getTasksExecuteTaskDialog");

            let password = "";
            if (task.username) {
                password = modelObj.getPassword();
            }

            $.ajax({
                type: "POST",
                url: CONFIG.API_BASE_URL + RUNNING_TASK_STATUS_PATH + "/" + task.id,
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
                        if (getTasksPage.isBusy()) {
                            getTasksPage.setBusy(false);
                        }

                        thisController.navTo(NAV_ONGOING_TASK);
                    }
                },
                error: function (xhr, status, error) {
                    if (executeTaskDialog.isBusy()) {
                        executeTaskDialog.setBusy(false);
                        executeTaskDialog.close();
                    }
                    if (getTasksPage.isBusy()) {
                        getTasksPage.setBusy(false);
                    }
                    if (xhr.readyState != 4) {
                        thisController.serverNotAvailable(
                            "the server has returned an unexpected response or might be down"
                        );
                    } else {
                        const result = JSON.parse(xhr.responseText);
                        modelObj.setServerContactErrorMessage(result.message);
                        thisController.getView().showExecutionErrorMessage();
                    }
                }
            });
        },

        navigateToTask: function (taskId) {
            this.navTo(NAV_TASKS, { taskId: taskId });
        },

        navigateToUpdateTask: function (taskId) {
            this.navTo(NAV_UPDATE_TASK, { taskId: taskId });
        },

        onSearchTasksListing: function (oEvent) {
            const query = oEvent.getSource().getValue();
            const table = this.globalById("tasksListingTable");
            const tableItems = table.getItems();
            let tasksShown = 0;
            for (const columnListItem of tableItems) {
                const cells = columnListItem.getCells();
                const taskData = [cells[0].getText(), cells[1].getText()];
                let showRow = false;
                for (const data of taskData) {
                    if (data.match(new RegExp("(" + query + ")+", "i"))) {
                        showRow = true;
                        tasksShown++;
                        break;
                    }
                }
                columnListItem.setVisible(showRow);
            }
            this.getView().changeTasksCount(tasksShown);
        },

        fetchAllTasks: function () {
            const thisController = this;
            $.ajax({
                type: "GET",
                url: CONFIG.API_BASE_URL + TASKS_PATH,
                success: function (result) {
                    thisController.passModel(new TasksListingObjectModel({ tasks: result }));
                },
                error: function (xhr, status, error) {
                    thisController.displayFatalErrorMessage("There are no tasks available.");
                }
            });
        },

        checkRestApiAvailability: function () {
            const thisController = this;
            $.ajax({
                type: "GET",
                url: CONFIG.API_BASE_URL + "/",
                success: function (result) {
                    if (result.message != "Lopt is available") {
                        thisController.serverNotAvailable(
                            "the server has returned an unexpected response"
                        );
                        return;
                    }
                    thisController.getView().hideLoading();
                    thisController.fetchAllTasks();
                },
                error: function (xhr, status, error) {
                    thisController.serverNotAvailable("the server cannot be reached");
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
            this.passModel(new TasksListingObjectModel(obj));
        }
    });
});
