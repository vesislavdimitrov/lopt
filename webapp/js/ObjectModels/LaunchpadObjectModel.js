class LaunchpadObjectModel {
    constructor(json) {
        this.message = json.message;
    }

    getMessage() {
        return this.message;
    }
}
