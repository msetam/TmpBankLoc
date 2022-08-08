console.log("DigitalSig loading...");
//namespace DigitalSignature {
var DigitalSignatureStatus;
(function (DigitalSignatureStatus) {
    DigitalSignatureStatus[DigitalSignatureStatus["WAITING"] = 0] = "WAITING";
    DigitalSignatureStatus[DigitalSignatureStatus["TIMED_OUT"] = 1] = "TIMED_OUT";
    DigitalSignatureStatus[DigitalSignatureStatus["SUCCEEDED"] = 2] = "SUCCEEDED";
    DigitalSignatureStatus[DigitalSignatureStatus["FAILED"] = 3] = "FAILED";
})(DigitalSignatureStatus || (DigitalSignatureStatus = {}));
var DigitalSignatureManager = /** @class */ (function () {
    function DigitalSignatureManager() {
        this._isSigMethodSelected = false;
    }
    DigitalSignatureManager.createInstance = function (wrapperId, submitBtnId, interval, requeiredInputId, debugExpectedResult, debugWaitTime) {
        var instance = new DigitalSignatureManager();
        DigitalSignatureManager.wrapperIdCodeToInstance[wrapperId] = instance;
        instance.wrapperId = wrapperId;
        instance.requiredInputId = requeiredInputId ? ".-required-input" : requeiredInputId;
        instance.submitBtnId = submitBtnId;
        instance.interval = interval;
        instance.debugWaitTime = debugWaitTime;
        instance.debugExpectedResult = debugExpectedResult;
        instance.init();
    };
    DigitalSignatureManager.prototype.init = function () {
        this.wrapper = document.querySelector("#" + this.wrapperId);
        this.submitBtn = this.wrapper.querySelector("#" + this.submitBtnId);
        this.digSigAuthMethods = this.wrapper.querySelector(".-auth-method-selector");
        this.requiredInput = this.wrapper.querySelector(this.requiredInputId);
        this.setAuthMethodsSelectedListeenrs();
        this.setSubmitListener();
    };
    DigitalSignatureManager.prototype.setSubmitListener = function () {
        var _this = this;
        this.submitBtn.addEventListener("click", function (e) {
            var onRequestStarted = _this.onRequestStarted;
            var debugExpectedResult = _this.debugExpectedResult;
            var requiredInput = _this.requiredInput;
            var waitTime = _this.debugWaitTime;
            _this.disableWrapper();
            if (_this._isSigMethodSelected) {
                e.preventDefault();
                e.stopPropagation();
                $.ajax({
                    url: DigitalSignatureManager.baseApiUrl + "/InitiateDigSigVerification",
                    method: "POST",
                    data: "{ \"expectedResult\": \"".concat(debugExpectedResult, "\", data: \"").concat(requiredInput.value, "\", waitTime: ").concat(waitTime, " }"),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {
                        console.log(response.d);
                        _this.requestCode = response.d;
                        _this.checkRequestStatus();
                        onRequestStarted && typeof onRequestStarted === 'function' && onRequestStarted();
                    },
                    error: function (errors) {
                        console.log(errors);
                        _this.enableWrapper();
                    }
                });
            }
        });
    };
    DigitalSignatureManager.prototype.setAuthMethodsSelectedListeenrs = function () {
        var _this = this;
        var digSigRb = this.digSigAuthMethods.querySelector(".-dig-sig-rb");
        this._isSigMethodSelected = digSigRb.checked;
        this.digSigAuthMethods.addEventListener("change", function (e) {
            _this._isSigMethodSelected = digSigRb.checked;
            var element = e.target;
            if (element instanceof HTMLInputElement && element.type === "radio") {
                _this.onAuthMethodChanged && typeof _this.onAuthMethodChanged === "function" && _this.onAuthMethodChanged(element);
            }
        });
    };
    DigitalSignatureManager.prototype.checkRequestStatus = function () {
        var _this = this;
        var onSuccess = this.onSuccess;
        var onFailed = this.onFailed;
        var onRetry = this.onRetry;
        $.ajax({
            url: DigitalSignatureManager.baseApiUrl + "/CheckDigSigStatus",
            method: "POST",
            data: "{ \"requestCode\": ".concat(this.requestCode, "}"),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                if (response.d.Status == DigitalSignatureStatus.SUCCEEDED) {
                    onSuccess && typeof onSuccess === 'function' && onSuccess();
                }
                else if (response.d.Status == DigitalSignatureStatus.FAILED || response.d.Status == DigitalSignatureStatus.TIMED_OUT) {
                    onFailed && typeof onFailed === 'function' && onFailed(response.d.Status);
                    _this.enableWrapper();
                }
                else {
                    setTimeout(function () { _this.checkRequestStatus(); }, _this.interval);
                    onRetry && typeof onRetry === 'function' && onRetry(response.d.Status);
                }
            },
            error: function (errors) { return onFailed && typeof onFailed === 'function' && onFailed(errors.d); }
        });
    };
    DigitalSignatureManager.getInstance = function (wrapperID) {
        return DigitalSignatureManager.wrapperIdCodeToInstance[wrapperID];
    };
    DigitalSignatureManager.prototype.isSigMethodSelected = function () {
        return this._isSigMethodSelected;
    };
    DigitalSignatureManager.prototype.disableWrapper = function () {
        this.wrapper.style.opacity = "0.3";
    };
    DigitalSignatureManager.prototype.enableWrapper = function () {
        this.wrapper.style.opacity = "1";
    };
    DigitalSignatureManager.baseApiUrl = "http://localhost:5288/DigitalSigService.asmx";
    DigitalSignatureManager.wrapperIdCodeToInstance = {};
    return DigitalSignatureManager;
}());
//}
//# sourceMappingURL=DigitalSignatureManger.js.map