console.log("DigitalSig loading...");
var DigitalSignature;
(function (DigitalSignature) {
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
            var _this = this;
            this.inputsAndWrappers = [];
            this._isSigMethodSelected = false;
            this._hasInitialized = false;
            this._defaultDigitalSignatureInitRequestData = {
                endpoint: "".concat(DigitalSignatureManager.baseApiUrl, "/InitiateDigSigVerification"),
                data: function () { var _a; return { expectedResult: "".concat(_this.debugExpectedResult), data: "".concat((_a = _this.requiredInput) === null || _a === void 0 ? void 0 : _a.value), waitTime: "".concat(_this.debugWaitTime) }; }
            };
            this._defaultDigitalSignatureCheckStatusRequestData = {
                endpoint: "".concat(DigitalSignatureManager.baseApiUrl, "/CheckDigSigStatus"),
                data: function () { var _a; return { expectedResult: "".concat(_this.debugExpectedResult), data: "".concat((_a = _this.requiredInput) === null || _a === void 0 ? void 0 : _a.value), waitTime: "".concat(_this.debugWaitTime) }; }
            };
        }
        DigitalSignatureManager.createInstance = function (wrapperId, interval, action, hasRequiredInput, authMethodsWrapperClasses, inputsWrapperClasses, submitWrapperClass, debugExpectedResult, debugWaitTime) {
            var instance = new DigitalSignatureManager();
            DigitalSignatureManager.wrapperIdCodeToInstance[wrapperId] = instance;
            instance.wrapperId = wrapperId;
            instance.interval = interval;
            instance.action = action;
            instance.hasRequiredInput = hasRequiredInput;
            instance.authMethodsWrapperClasses = authMethodsWrapperClasses;
            instance.inputsWrapperClasses = inputsWrapperClasses;
            instance.submitWrapperClass = submitWrapperClass;
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
            this.submitBtn = this.wrapper.querySelector(!this.isClassNameNull(this.submitWrapperClass) ? this.submitWrapperClass + " input" : "[submitview]");
            if (!this.submitBtn) {
                this.wrapper.querySelector(this.submitWrapperClass + " button");
            }
            // setting up html inputs that define the sent data
            var sentRequiredInputClassName = this.inputsWrapperClasses.split(",")[1];
            this.requiredInput = this.hasRequiredInput && this.wrapper.querySelector(!this.isClassNameNull(sentRequiredInputClassName) ? sentRequiredInputClassName + " input" : "[requiredinput]");
            var sentInputViewClassName = this.inputsWrapperClasses.split(",")[0];
            this.wrapper.querySelectorAll(!this.isClassNameNull(sentInputViewClassName) ?
                sentInputViewClassName + " input" :
                "[inputview]").forEach(function (inputElement) {
                _this.inputsAndWrappers.push({ input: inputElement, wrapper: _this._getWrapperForElement(inputElement) });
            });
            // setting up html radio button inputs that define the auth method
            var sentTargetAuthMethodClassName = this.authMethodsWrapperClasses.split(",")[0];
            this.targetAuthMethodRb = this.wrapper.querySelector(!this.isClassNameNull(sentTargetAuthMethodClassName) ?
                sentTargetAuthMethodClassName + " input[type=radio]" :
                "[targetauthmethod]");
            this.digSigAuthMethodsWrapper = this._getWrapperForElement(this.targetAuthMethodRb);
            this.setAuthMethodsSelectedListeners();
            this.setSubmitListener();
        };
        DigitalSignatureManager.prototype.setSubmitListener = function () {
            var _this = this;
            var savedOnSubmit = this.submitBtn.onclick;
            this.submitBtn.onclick = null;
            this.submitBtn.addEventListener("click", function (e) {
                var _a, _b;
                var listeners = _this._authManagerListeners;
                if (_this._isSigMethodSelected) {
                    _this.disableWrapper();
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    listeners && typeof listeners.onRequestStarted === 'function' && listeners.onRequestStarted();
                    $.ajax({
                        url: ((_a = _this._digitalSignatureInitRequestData) === null || _a === void 0 ? void 0 : _a.endpoint) ? _this._digitalSignatureInitRequestData.endpoint : _this._defaultDigitalSignatureInitRequestData.endpoint,
                        method: "POST",
                        data: ((_b = _this._digitalSignatureInitRequestData) === null || _b === void 0 ? void 0 : _b.data) ? _this._digitalSignatureInitRequestData.data : _this._defaultDigitalSignatureInitRequestData.data,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (response) {
                            console.log(response.d);
                            _this.requestCode = response.d;
                            listeners && typeof listeners.onRequestTrackingDataReceived === 'function' && listeners.onRequestTrackingDataReceived(response);
                            _this.checkRequestStatus();
                        },
                        error: function (errors) {
                            console.log(errors);
                            _this.enableWrapper();
                        },
                        /*               xhrFields: { withCrendtials: true },*/
                    });
                    return false;
                }
            });
            savedOnSubmit && this.submitBtn.addEventListener("click", function (e) {
                savedOnSubmit.call(e);
            }); //todo: remove later and test if it still works with the new design
            //  savedOnSubmit && this.submitBtn.addEventListener("click", savedOnSubmit);
        };
        DigitalSignatureManager.prototype.setOnAuthEventsListener = function (authEventsImpl) {
            this._authManagerListeners = authEventsImpl;
        };
        DigitalSignatureManager.prototype.setDigitalSignatureInitRequestsData = function (digitalSigRequestsData) {
            this._digitalSignatureInitRequestData = digitalSigRequestsData;
        };
        DigitalSignatureManager.prototype.setDigitalSignatureCheckStatusRequestsData = function (digitalSigRequestsData) {
            this._digitalSignatureCheckStatusRequestData = digitalSigRequestsData;
        };
        DigitalSignatureManager.prototype.setAuthMethodsSelectedListeners = function () {
            var _this = this;
            // setting the initial state
            var authMethodClassName = this.authMethodsWrapperClasses.split(",")[0];
            this.digSigAuthMethodsWrapper.querySelectorAll(!this.isClassNameNull(authMethodClassName) ?
                authMethodClassName + " input[type=radio]" :
                "[authmethod]").forEach(function (element) {
                if (element.checked) {
                    _this.onAuthFieldMethodChanged(_this.targetAuthMethodRb, null, element);
                }
            });
            this.digSigAuthMethodsWrapper.addEventListener("change", function (e) { _this.onAuthFieldMethodChanged(_this.targetAuthMethodRb, e); });
        };
        // for fieldset authmethods html change event
        DigitalSignatureManager.prototype.onAuthFieldMethodChanged = function (digSigRb, e, selectedElement) {
            this._isSigMethodSelected = digSigRb.checked;
            var element = selectedElement ? selectedElement : e.target;
            if (element instanceof HTMLInputElement && element.type === "radio") {
                this._authManagerListeners && typeof this._authManagerListeners.onAuthMethodChanged === 'function'
                    && this._authManagerListeners.onAuthMethodChanged(element);
                if (this.action != Action.NONE) {
                    if (this.hasRequiredInput) {
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
                    }
                    for (var _i = 0, _a = this.inputsAndWrappers; _i < _a.length; _i++) {
                        var _b = _a[_i], input = _b.input, wrapper = _b.wrapper;
                        if (this.action == Action.DISABLE) {
                            if (this._isSigMethodSelected && input !== this.requiredInput) {
                                input.setAttribute("disabled", "true");
                            }
                            else {
                                input.removeAttribute("disabled");
                            }
                        }
                        else if (this.action == Action.HIDE) {
                            if (this._isSigMethodSelected && input !== this.requiredInput) {
                                wrapper.classList.add("display-none");
                            }
                            else {
                                wrapper.classList.remove("display-none");
                            }
                        }
                    }
                }
            }
        };
        // goes up the DOM heierachy till it hits a class with ds-wrapper class or reaches wrapper element
        DigitalSignatureManager.prototype._getWrapperForElement = function (element) {
            var result = element;
            while (result && result != this.wrapper && !result.classList.contains("ds-wrapper")) {
                result = result.parentElement;
            }
            if (!result || !result.classList.contains("ds-wrapper")) {
                throw new Error("'ds-wrapper' class on any of ancestors of this element is expected: ".concat(element));
            }
            return result;
        };
        DigitalSignatureManager.prototype.checkRequestStatus = function () {
            var _this = this;
            var _a, _b;
            $.ajax({
                url: ((_a = this._digitalSignatureCheckStatusRequestData) === null || _a === void 0 ? void 0 : _a.endpoint) ? this._digitalSignatureCheckStatusRequestData.endpoint : this._defaultDigitalSignatureCheckStatusRequestData.endpoint,
                method: "POST",
                data: ((_b = this._digitalSignatureCheckStatusRequestData) === null || _b === void 0 ? void 0 : _b.data) ? this._digitalSignatureCheckStatusRequestData.data : this._defaultDigitalSignatureCheckStatusRequestData.data,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    if (response.d.Status == DigitalSignatureStatus.SUCCEEDED) {
                        _this._authManagerListeners && typeof _this._authManagerListeners.onSuccess === 'function' && _this._authManagerListeners.onSuccess();
                    }
                    else if (response.d.Status == DigitalSignatureStatus.FAILED || response.d.Status == DigitalSignatureStatus.TIMED_OUT) {
                        _this._authManagerListeners && typeof _this._authManagerListeners.onFailed === 'function' && _this._authManagerListeners.onFailed(response.d.Status);
                        _this.enableWrapper();
                    }
                    else {
                        setTimeout(function () { _this.checkRequestStatus(); }, _this.interval);
                        _this._authManagerListeners && typeof _this._authManagerListeners.onRetry === 'function' && _this._authManagerListeners.onRetry(response.d.Status);
                    }
                },
                error: function (errors) { return _this._authManagerListeners && typeof _this._authManagerListeners.onFailed === 'function' && _this._authManagerListeners.onFailed(errors); },
                //xhrFields: {
                //    withCredentials: true
                //}
            });
        };
        DigitalSignatureManager.addDefaultStyle = function () {
            var styleNode = document.createElement("style");
            styleNode.textContent = "";
            document.head.appendChild(styleNode);
        };
        DigitalSignatureManager.isFirstInstance = function () {
            return Object.keys(DigitalSignatureManager.wrapperIdCodeToInstance).length == 0;
        };
        DigitalSignatureManager.prototype.isSigMethodSelected = function () {
            return this._isSigMethodSelected;
        };
        DigitalSignatureManager.prototype.disableWrapper = function () {
            this.submitBtn.setAttribute("disabled", "true");
            this.wrapper.style.opacity = "0.3";
        };
        DigitalSignatureManager.prototype.enableWrapper = function () {
            this.submitBtn.removeAttribute("disabled");
            this.wrapper.style.opacity = "1";
        };
        DigitalSignatureManager.prototype.isClassNameNull = function (className) {
            return className === ".-null-";
        };
        DigitalSignatureManager.baseApiUrl = "http://localhost:5288/DigitalSigService.asmx";
        DigitalSignatureManager.wrapperIdCodeToInstance = {};
        return DigitalSignatureManager;
    }());
    DigitalSignature.DigitalSignatureManager = DigitalSignatureManager;
})(DigitalSignature || (DigitalSignature = {}));
if (DigitalSignature.DigitalSignatureManager.isFirstInstance()) {
    console.log("adding default DigitalSignature control styles");
    DigitalSignature.DigitalSignatureManager.addDefaultStyle();
}
//# sourceMappingURL=DigitalSignatureManger.js.map