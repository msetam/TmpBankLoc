console.log("DigitalSig loading...");
//namespace DigitalSignature {
var DigitalSignatureStatus;
(function (DigitalSignatureStatus) {
    DigitalSignatureStatus[DigitalSignatureStatus["WAITING"] = 0] = "WAITING";
    DigitalSignatureStatus[DigitalSignatureStatus["TIMED_OUT"] = 1] = "TIMED_OUT";
    DigitalSignatureStatus[DigitalSignatureStatus["SUCCEEDED"] = 2] = "SUCCEEDED";
    DigitalSignatureStatus[DigitalSignatureStatus["FAILED"] = 3] = "FAILED";
})(DigitalSignatureStatus || (DigitalSignatureStatus = {}));
// when switching between different Auth methods what is gonna be the action applied to all inputs provided in inputsNames
var Action;
(function (Action) {
    Action[Action["DISABLE"] = 0] = "DISABLE";
    Action[Action["HIDE"] = 1] = "HIDE";
    Action[Action["NONE"] = 2] = "NONE";
})(Action || (Action = {}));
var DigitalSignatureManager = /** @class */ (function () {
    function DigitalSignatureManager() {
        this._isSigMethodSelected = false;
    }
    DigitalSignatureManager.createInstance = function (wrapperId, submitBtnId, interval, action, requeiredInputId, inputsNames, debugExpectedResult, debugWaitTime) {
        var instance = new DigitalSignatureManager();
        DigitalSignatureManager.wrapperIdCodeToInstance[wrapperId] = instance;
        instance.wrapperId = wrapperId;
        instance.requiredInputId = requeiredInputId ? requeiredInputId : ".-required-input";
        instance.action = action;
        instance.inputsNames = inputsNames === null || inputsNames === void 0 ? void 0 : inputsNames.split(",");
        instance.submitBtnId = submitBtnId;
        instance.interval = interval;
        instance.debugWaitTime = debugWaitTime;
        instance.debugExpectedResult = debugExpectedResult;
        instance.init();
    };
    DigitalSignatureManager.getInstance = function (wrapperID) {
        return DigitalSignatureManager.wrapperIdCodeToInstance[wrapperID];
    };
    DigitalSignatureManager.prototype.init = function () {
        this.wrapper = document.querySelector("#" + this.wrapperId);
        this.submitBtn = this.wrapper.querySelector("#" + this.submitBtnId);
        this.digSigAuthMethods = this.wrapper.querySelector(".-auth-method-selector");
        this.requiredInput = this.wrapper.querySelector(this.requiredInputId[0] === "." ? this.requiredInputId : "#" + this.requiredInputId);
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
        // setting the inital state
        this.digSigAuthMethods.querySelectorAll("input[type = radio]").forEach(function (element) {
            if (element.checked) {
                _this.onAuthFieldMethodChanged(digSigRb, null, element);
            }
        });
        this.digSigAuthMethods.addEventListener("change", function (e) { _this.onAuthFieldMethodChanged(digSigRb, e); });
    };
    // for fieldset authmethods html change event
    DigitalSignatureManager.prototype.onAuthFieldMethodChanged = function (digSigRb, e, selectedElement) {
        var _this = this;
        this._isSigMethodSelected = digSigRb.checked;
        var element = selectedElement ? selectedElement : e.target;
        if (element instanceof HTMLInputElement && element.type === "radio") {
            this.onAuthMethodChanged && typeof this.onAuthMethodChanged === "function" && this.onAuthMethodChanged(element);
            if (this.action != Action.NONE) {
                // first we set the state of requiredInput because it can also be an input for other auth methods(flaggs: RequiredView InputView)
                // so iterating over inputsnames enables it again
                if (this.action == Action.DISABLE) {
                    if (this._isSigMethodSelected) {
                        this.requiredInput.removeAttribute("disabled");
                    }
                    else {
                        this.requiredInput.setAttribute("disabled", "true");
                    }
                }
                else if (this.action == Action.HIDE) {
                    if (this._isSigMethodSelected) {
                        this.requiredInput.classList.remove("display-none");
                    }
                    else {
                        this.requiredInput.classList.add("display-none");
                    }
                }
                this.inputsNames.forEach(function (name) {
                    if (name === "[" || name === "]" || name === "")
                        return;
                    var inputElem = _this.wrapper.querySelector("[name=\"".concat(name, "\"]"));
                    if (_this.action == Action.DISABLE) {
                        if (_this._isSigMethodSelected && inputElem !== _this.requiredInput) {
                            inputElem.setAttribute("disabled", "true");
                        }
                        else {
                            inputElem.removeAttribute("disabled");
                        }
                    }
                    else if (_this.action == Action.HIDE) {
                        if (_this._isSigMethodSelected && inputElem !== _this.requiredInput) {
                            inputElem.classList.add("display-none");
                        }
                        else {
                            inputElem.classList.remove("display-none");
                        }
                    }
                });
            }
        }
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