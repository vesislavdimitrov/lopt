sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
    "use strict";
    return UIComponent.extend(TASK_EXECUTOR_CLIENT_COMPONENT, {
        metadata: ROUTING_METADATA_CONFIG,
        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            this.getRouter().initialize();
        }
    });
});
