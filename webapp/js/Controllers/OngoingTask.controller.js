sap.ui.define(["./BaseController"], function (BaseController) {
    "use strict";

    return BaseController.extend(LOPT_CONTROLLER_ONGOING_TASK, {
        pageLoaded: function () {
            this.fetchTaskStatus();
        },

        finishTaskLogReview: function () {
            const thisController = this;
            $.ajax({
                type: "DELETE",
                url: CONFIG.API_BASE_URL + LAST_TASK_LOG_PATH,
                complete: function () {
                    thisController.continueToLaunchpad();
                }
            });
        },

        onRegexFilterChange: function (oEvent) {
            const oInput = oEvent.getSource();
            const oView = this.getView();
            const log = this.getModelObjProperty().getLog();
            const originalLog = log.split("\n").filter((element) => element);

            if (!oInput.getValue().length) {
                oView.changeRegexInputDesign();
                oView.logFiltered(originalLog);
                oView.changeTaskLogTitle(false);
                return;
            }

            try {
                const regex = new RegExp(oInput.getValue(), "i");
                let newLog = originalLog.filter(function (line) {
                    return regex.test(line);
                });
                if (!newLog.length) {
                    oView.changeRegexInputDesign("warning");
                    oView.logFiltered(originalLog);
                    oView.changeTaskLogTitle(false);
                    return;
                }
                oView.changeRegexInputDesign("success");
                oView.logFiltered(newLog);
            } catch (e) {
                oView.changeRegexInputDesign("error");
            }
        },

        onDownloadLogButtonClicked: function () {
            const log = this.getModelObjProperty().getLog();
            const element = document.createElement("a");
            element.setAttribute(
                "href",
                "data:text/plain;charset=utf-8," + encodeURIComponent(log)
            );
            element.setAttribute("download", "task.log");

            element.style.display = "none";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        },

        continueToLaunchpad: function () {
            this.toggleMainPageNav(true);
            this.navToPrevious();
        },

        poll: function () {
            const thisController = this;
            $.ajax({
                type: "GET",
                url: CONFIG.API_BASE_URL + ONGOING_TASK_LOG_PATH,
                data: {},
                dataType: "json",
                processData: false,
                xhrFields: {
                    onprogress: function (e) {
                        if (e.currentTarget.status != 200) {
                            return;
                        }
                        const serverResponse = JSON.parse(e.currentTarget.responseText);
                        thisController.passModel(new OngoingTaskObjectModel(serverResponse));
                        setTimeout(() => {
                            thisController.poll();
                        }, ONGOING_TASK_POLL_INTERVAL);
                    }
                },
                error: function (xhr, status, error) {
                    thisController.checkAndReviewTask(false);
                }
            });
        },

        checkAndReviewTask: function (continueToLaunchpad = true) {
            const thisController = this;
            $.ajax({
                type: "GET",
                url: CONFIG.API_BASE_URL + LAST_TASK_LOG_PATH,
                data: {},
                dataType: "json",
                processData: false,
                xhrFields: {
                    onprogress: function (e) {
                        if (e.currentTarget.status != 200) {
                            return;
                        }
                        const serverResponse = JSON.parse(e.currentTarget.responseText);
                        thisController.passModel(new OngoingTaskObjectModel(serverResponse));
                    }
                },
                error: function (xhr, status, error) {
                    if (xhr.readyState != 4 || continueToLaunchpad) {
                        thisController.continueToLaunchpad();
                    }
                }
            });
        },

        fetchTaskStatus: function (doPoll = true) {
            const thisController = this;
            $.ajax({
                type: "GET",
                url: CONFIG.API_BASE_URL + RUNNING_TASK_STATUS_PATH,
                success: function (result) {
                    if (result.running_task_status > -1) {
                        thisController.passModel(new OngoingTaskObjectModel(result));
                        if (doPoll) {
                            thisController.poll();
                        }
                    } else {
                        thisController.checkAndReviewTask();
                    }
                },
                error: function (xhr, status, error) {
                    thisController.continueToLaunchpad();
                }
            });
        },

        taskAction: function (requestPath) {
            const thisController = this;
            $.ajax({
                type: "POST",
                url: CONFIG.API_BASE_URL + requestPath,
                success: function (result) {
                    if (requestPath === STOP_TASK_PATH) {
                        thisController.checkAndReviewTask(false);
                        return;
                    }
                    thisController.fetchTaskStatus(false);
                },
                error: function (xhr, status, error) {
                    if (xhr.readyState != 4 || xhr.status != 503) {
                        thisController.continueToLaunchpad();
                    }
                }
            });
        }
    });
});
