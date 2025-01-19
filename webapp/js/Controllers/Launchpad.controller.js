sap.ui.define(["./BaseController"], function (BaseController) {
    "use strict";

    return BaseController.extend(TASK_EXECUTOR_CLIENT_CONTROLLER_LAUNCHPAD, {
        pageLoaded: function () {
            this.getView().hideLoading();
            this.checkRestApiAvailability();
        },

        checkRestApiAvailability: function () {
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
                    thisController.passModel(new LaunchpadObjectModel({}));
                },
                error: function (xhr, status, error) {
                    thisController.taskExecutorNotAvailable("the API base URL cannot be reached");
                }
            });
        },

        taskExecutorNotAvailable: function (message) {
            const obj = {
                message: "The TaskExecutor REST API is currently unavailable (" + message + ")."
            };
            this.passModel(new LaunchpadObjectModel(obj));
        }
    });
});
