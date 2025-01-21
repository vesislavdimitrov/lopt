sap.ui.define(["./BaseController"], function (BaseController) {
    "use strict";

    return BaseController.extend(LOPT_CONTROLLER_LAUNCHPAD, {
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
                        thisController.serverNotAvailable(
                            "the server has returned an unexpected response"
                        );
                        return;
                    }
                    thisController.passModel(new LaunchpadObjectModel({}));
                },
                error: function (xhr, status, error) {
                    thisController.serverNotAvailable("the server cannot be reached");
                }
            });
        },

        serverNotAvailable: function (message) {
            const obj = {
                message: "The Lopt REST API is currently unavailable (" + message + ")."
            };
            this.passModel(new LaunchpadObjectModel(obj));
        }
    });
});
