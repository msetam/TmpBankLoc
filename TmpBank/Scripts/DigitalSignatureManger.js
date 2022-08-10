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
        this.inputsAndWrappers = {};
        this._isSigMethodSelected = false;
        this._hasInitialized = false;
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
    };
    DigitalSignatureManager.getInstance = function (wrapperID) {
        var instance = DigitalSignatureManager.wrapperIdCodeToInstance[wrapperID];
        instance.init();
        return instance;
    };
    DigitalSignatureManager.prototype.init = function () {
        var _this = this;
        if (this._hasInitialized) {
            return;
        }
        this._hasInitialized = true;
        this.wrapper = document.querySelector("#" + this.wrapperId);
        this.submitBtn = this.wrapper.querySelector("#" + this.submitBtnId);
        this.digSigAuthMethodsField = this.wrapper.querySelector(".-auth-method-selector");
        this.requiredInput = this.wrapper.querySelector(this.requiredInputId[0] === "." ? this.requiredInputId : "#" + this.requiredInputId);
        this.inputsNames.forEach(function (name) {
            if (name === "[" || name === "]" || name === "")
                return;
            var inputElem = _this.wrapper.querySelector("[name^=\"".concat(name, "\"]"));
            _this.inputsAndWrappers[name] = { input: inputElem, wrapper: _this._getWrapperForElement(inputElem) };
        });
        this.setAuthMethodsSelectedListeenrs();
        this.setSubmitListener();
    };
    DigitalSignatureManager.prototype.setSubmitListener = function () {
        var _this = this;
        var savedOnSubmit = this.submitBtn.onclick;
        this.submitBtn.onclick = null;
        this.submitBtn.addEventListener("click", function (e) {
            var onRequestStarted = _this.onRequestStarted;
            var debugExpectedResult = _this.debugExpectedResult;
            var requiredInput = _this.requiredInput;
            var waitTime = _this.debugWaitTime;
            if (_this._isSigMethodSelected) {
                _this.disableWrapper();
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
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
                return false;
            }
        });
        savedOnSubmit && this.submitBtn.addEventListener("click", function (e) {
            savedOnSubmit.call(e);
        });
        //  savedOnSubmit && this.submitBtn.addEventListener("click", savedOnSubmit);
    };
    DigitalSignatureManager.prototype.setAuthMethodsSelectedListeenrs = function () {
        var _this = this;
        var digSigRb = this.digSigAuthMethodsField.querySelector(".-dig-sig-rb");
        // setting the inital state
        this.digSigAuthMethodsField.querySelectorAll("input[type = radio]").forEach(function (element) {
            if (element.checked) {
                _this.onAuthFieldMethodChanged(digSigRb, null, element);
            }
        });
        this.digSigAuthMethodsField.addEventListener("change", function (e) { _this.onAuthFieldMethodChanged(digSigRb, e); });
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
                    var elementWrapper = this._getWrapperForElement(this.requiredInput);
                    if (this._isSigMethodSelected) {
                        elementWrapper.classList.remove("display-none");
                    }
                    else {
                        elementWrapper.classList.add("display-none");
                    }
                }
                this.inputsNames.forEach(function (name) {
                    if (name === "[" || name === "]" || name === "")
                        return;
                    var inputAndWraper = _this.inputsAndWrappers[name];
                    if (_this.action == Action.DISABLE) {
                        if (_this._isSigMethodSelected && inputAndWraper.input !== _this.requiredInput) {
                            inputAndWraper.input.setAttribute("disabled", "true");
                        }
                        else {
                            inputAndWraper.input.removeAttribute("disabled");
                        }
                    }
                    else if (_this.action == Action.HIDE) {
                        if (_this._isSigMethodSelected && inputAndWraper.input !== _this.requiredInput) {
                            inputAndWraper.wrapper.classList.add("display-none");
                        }
                        else {
                            inputAndWraper.wrapper.classList.remove("display-none");
                        }
                    }
                });
            }
        }
    };
    // goes up the DOM heierachy till it hits a class with -wrapper class or reaches wrapper element
    DigitalSignatureManager.prototype._getWrapperForElement = function (element) {
        var result = element;
        while (result && result != this.wrapper && !result.classList.contains("-wrapper")) {
            result = result.parentElement;
        }
        if (!result || !result.classList.contains("-wrapper")) {
            throw new DOMException("if action is set to HIDE then '-wrapper' class on any of ancestors of this element is expected: ".concat(element));
        }
        return result;
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
    DigitalSignatureManager.prototype.hasRequiredInput = function () {
        return this.requiredInputId !== "-null-";
    };
    DigitalSignatureManager.baseApiUrl = "http://localhost:5288/DigitalSigService.asmx";
    DigitalSignatureManager.wrapperIdCodeToInstance = {};
    return DigitalSignatureManager;
}());
//}
//# sourceMappingURL=DigitalSignatureManger.js.map