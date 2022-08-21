console.log("DigitalSig loading...");
// todo: typescript tsconfig errors are not on point
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
    var ActionsToEfects = /** @class */ (function () {
        function ActionsToEfects(_digitalSigManager) {
            var _a;
            var _this = this;
            this._digitalSigManager = _digitalSigManager;
            this._actionsToEffects = (_a = {},
                _a[Action.NONE] = function (currentSelectedAuthMethod) { },
                _a[Action.DISABLE] = function (currentSelectedAuthMethod) { return _this._disableAction(currentSelectedAuthMethod); },
                _a[Action.HIDE] = function (currentSelectedAuthMethod) { return _this._hideAction(currentSelectedAuthMethod); },
                _a);
        }
        ActionsToEfects.prototype._hideAction = function (currentSelectedAuthMethod) {
            if (this._digitalSigManager.hasRequiredInput()) {
                // first we set the state of requiredInput because it can also be an input for other auth methods(flaggs: RequiredView InputView)
                // so iterating over inputsnames enables it again
                var elementWrapper = this._digitalSigManager.getWrapperForElementWithClass(this._digitalSigManager.getRequiredInput());
                if (this._digitalSigManager.isDigSigMethodSelected()) {
                    elementWrapper.classList.remove("ds-display-none");
                }
                else {
                    elementWrapper.classList.add("ds-display-none");
                }
            }
            for (var _i = 0, _a = this._digitalSigManager.getInputsAndWrappers(); _i < _a.length; _i++) {
                var _b = _a[_i], input = _b.input, wrapper = _b.wrapper;
                if (this._digitalSigManager.isDigSigMethodSelected() && input !== this._digitalSigManager.getRequiredInput()) {
                    wrapper.classList.add("ds-display-none");
                }
                else {
                    wrapper.classList.remove("ds-display-none");
                }
            }
        };
        ActionsToEfects.prototype._disableAction = function (currentSelectedAuthMethod) {
            if (this._digitalSigManager.hasRequiredInput()) {
                // first we set the state of requiredInput because it can also be an input for other auth methods(flaggs: RequiredView InputView)
                // so iterating over inputsnames enables it again
                var elementWrapper = this._digitalSigManager.getWrapperForElementWithClass(this._digitalSigManager.getRequiredInput());
                if (this._digitalSigManager.isDigSigMethodSelected()) {
                    elementWrapper.classList.remove("ds-display-none");
                }
                else {
                    elementWrapper.classList.add("ds-display-none");
                }
            }
            for (var _i = 0, _a = this._digitalSigManager.getInputsAndWrappers(); _i < _a.length; _i++) {
                var _b = _a[_i], input = _b.input, wrapper = _b.wrapper;
                if (this._digitalSigManager.isDigSigMethodSelected() && input !== this._digitalSigManager.getRequiredInput()) {
                    input.setAttribute("disabled", "true");
                }
                else {
                    input.removeAttribute("disabled");
                }
            }
        };
        ActionsToEfects.prototype.apply = function (currentSelectedAuthMethod) {
            var effect = this._actionsToEffects[this._digitalSigManager.getCurrentAction()];
            if (effect) {
                return effect(currentSelectedAuthMethod);
            }
            return null;
        };
        return ActionsToEfects;
    }());
    DigitalSignature.ActionsToEfects = ActionsToEfects;
    var DigitalSignatureManager = /** @class */ (function () {
        function DigitalSignatureManager() {
            this._inputsAndWrappers = [];
            this._isDigSigMethodSelected = false;
            this._hasInitialized = false;
            this._defaultDigitalSignatureInitRequestData = {
                endpoint: function () { return "".concat(DigitalSignatureManager._baseApiUrl, "/digitalsig/init"); },
                data: function () { return {}; }
            };
            this._defaultDigitalSignatureCheckStatusRequestData = {
                endpoint: function () { return "".concat(DigitalSignatureManager._baseApiUrl, "/digitalsig/check"); },
                data: function () { return {}; }
            };
        }
        DigitalSignatureManager.createInstance = function (wrapperId, interval, action, hasRequiredInput, authMethodsWrapperClasses, inputsWrapperClasses, submitWrapperClass) {
            var instance = new DigitalSignatureManager();
            DigitalSignatureManager._wrapperIdToDigSigManagerInstance[wrapperId] = instance;
            instance._wrapperId = wrapperId;
            instance._interval = interval;
            instance._currentAction = action;
            instance._hasRequiredInput = hasRequiredInput;
            instance._targetAuthMethodWrapperClass = authMethodsWrapperClasses;
            instance._inputsWrapperClasses = inputsWrapperClasses;
            instance._submitWrapperClass = submitWrapperClass;
        };
        DigitalSignatureManager.getInstance = function (wrapperID) {
            var instance = DigitalSignatureManager._wrapperIdToDigSigManagerInstance[wrapperID];
            return instance;
        };
        DigitalSignatureManager.prototype.init = function () {
            var _this = this;
            if (this._hasInitialized) {
                return;
            }
            this._hasInitialized = true;
            this._actionsToEffects = new ActionsToEfects(this);
            this._wrapper = document.querySelector("#" + this._wrapperId);
            this._submitBtn = this._wrapper.querySelector(!this._isClassNameNull(this._submitWrapperClass) ? this._submitWrapperClass + " input" : "[dssubmitview]");
            if (!this._submitBtn) {
                this._wrapper.querySelector(this._submitWrapperClass + " button");
            }
            // setting up html inputs that define the sent data
            var sentRequiredInputClassName = this._inputsWrapperClasses.split(",")[1];
            if (this._hasRequiredInput) {
                this._requiredInput = this._wrapper.querySelector(!this._isClassNameNull(sentRequiredInputClassName) ? sentRequiredInputClassName + " input" : "[dsrequiredinput]");
            }
            var sentInputViewClassName = this._inputsWrapperClasses.split(",")[0];
            Array.prototype.forEach.call(this._wrapper.querySelectorAll(!this._isClassNameNull(sentInputViewClassName) ?
                sentInputViewClassName + " input" :
                "[dsinputview]"), function (inputElement) {
                _this._inputsAndWrappers.push({ input: inputElement, wrapper: _this.getWrapperForElementWithClass(inputElement) });
            });
            // setting up html radio button inputs that define the auth method
            this._targetAuthMethodRb = this._wrapper.querySelector(!this._isClassNameNull(this._targetAuthMethodWrapperClass) ?
                this._targetAuthMethodWrapperClass + " input[type=radio]" :
                "[dstargetauthmethod]");
            this._setAuthMethodsRadioBtnListeners();
            this._setSubmitListener();
        };
        DigitalSignatureManager.prototype._setSubmitListener = function () {
            var _this = this;
            var savedOnClick = this._submitBtn.onclick;
            this._submitBtn.onclick = null;
            savedOnClick && this._submitBtn.removeEventListener("click", savedOnClick);
            this._submitBtn.addEventListener("click", function (e) {
                if (_this._isDigSigMethodSelected) {
                    _this.disableWrapper();
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    _this._startDigitalSigProcess();
                    return false;
                }
            });
            savedOnClick && (this._submitBtn.onclick = savedOnClick);
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
        DigitalSignatureManager.prototype._startDigitalSigProcess = function () {
            var _this = this;
            var _a, _b, _c, _d;
            this._authManagerListeners && typeof this._authManagerListeners.onRequestStarting === 'function' && this._authManagerListeners.onRequestStarting();
            $.ajax({
                url: (_b = (_a = this._digitalSignatureInitRequestData) === null || _a === void 0 ? void 0 : _a.endpoint()) !== null && _b !== void 0 ? _b : this._defaultDigitalSignatureInitRequestData.endpoint(),
                method: "POST",
                data: JSON.stringify((_d = (_c = this._digitalSignatureInitRequestData) === null || _c === void 0 ? void 0 : _c.data) !== null && _d !== void 0 ? _d : this._defaultDigitalSignatureInitRequestData.data),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    _this._requestCode = response.Code;
                    _this._authManagerListeners && typeof _this._authManagerListeners.onRequestTrackingDataReceived === 'function' && _this._authManagerListeners.onRequestTrackingDataReceived(response);
                    _this._checkRequestStatus();
                },
                error: function (errors) {
                    _this.enableWrapper();
                    _this._authManagerListeners && typeof _this._authManagerListeners.onFailed === 'function' && _this._authManagerListeners.onFailed(errors);
                },
                xhrFields: {
                    withCredentials: true
                }
            });
        };
        // listens to changes in a wrapper that is the closest ancestor with a node.type=fieldset and if that doesn't exist, it will search for the closest ancestor with className="ds-wrapper"
        DigitalSignatureManager.prototype._setAuthMethodsRadioBtnListeners = function () {
            var _this = this;
            var _a;
            if (!this._targetAuthMethodRb) {
                return;
            }
            // setting the initial state
            var allAuthMethodsWrapper = (_a = this.getWrapperForElementWithNodeName(this._targetAuthMethodRb, "fieldset")) !== null && _a !== void 0 ? _a : this.getWrapperForElementWithClass(this._targetAuthMethodRb, "ds-wrapper");
            Array.prototype.some.call(allAuthMethodsWrapper.querySelectorAll("input[type=radio]"), function (element) {
                if (element.checked) {
                    _this._onAuthFieldMethodChanged(_this._targetAuthMethodRb, null, element);
                    return true;
                }
                return false;
            });
            allAuthMethodsWrapper.addEventListener("change", function (e) { _this._onAuthFieldMethodChanged(_this._targetAuthMethodRb, e); });
        };
        // for fieldset/div[class has AuthMethodsWrapperClass] html change event
        DigitalSignatureManager.prototype._onAuthFieldMethodChanged = function (digSigRb, e, selectedElement) {
            this._isDigSigMethodSelected = digSigRb.checked;
            var element = selectedElement ? selectedElement : e.target;
            if (element instanceof HTMLInputElement && element.type === "radio") {
                // we check the nullability of the event as well because inital call to this function is not an actual event caused by clicking: see _setAuthMethodsRadioBtnListeners
                e && this._authManagerListeners && typeof this._authManagerListeners.onAuthMethodChanged === 'function'
                    && this._authManagerListeners.onAuthMethodChanged(element, this._lastSelectedAuthMethodRb);
                this._lastSelectedAuthMethodRb = element;
                this._actionsToEffects.apply(selectedElement);
            }
        };
        DigitalSignatureManager.prototype._checkRequestStatus = function () {
            var _this = this;
            var _a, _b, _c, _d;
            $.ajax({
                url: (_b = (_a = this._digitalSignatureCheckStatusRequestData) === null || _a === void 0 ? void 0 : _a.endpoint()) !== null && _b !== void 0 ? _b : this._defaultDigitalSignatureCheckStatusRequestData.endpoint(),
                method: "POST",
                data: JSON.stringify((_d = (_c = this._digitalSignatureCheckStatusRequestData) === null || _c === void 0 ? void 0 : _c.data) !== null && _d !== void 0 ? _d : this._defaultDigitalSignatureCheckStatusRequestData.data),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    if (response.Status == DigitalSignatureStatus.SUCCEEDED) {
                        _this.enableWrapper();
                        _this._authManagerListeners && typeof _this._authManagerListeners.onSuccess === 'function' && _this._authManagerListeners.onSuccess(response);
                    }
                    else if (response.Status == DigitalSignatureStatus.FAILED || response.Status == DigitalSignatureStatus.TIMED_OUT) {
                        _this.enableWrapper();
                        _this._authManagerListeners && typeof _this._authManagerListeners.onFailed === 'function' && _this._authManagerListeners.onFailed(response);
                    }
                    else {
                        _this._authManagerListeners && typeof _this._authManagerListeners.onCheckingRequestStatus === 'function' && _this._authManagerListeners.onCheckingRequestStatus(response.Status);
                        setTimeout(function () { _this._checkRequestStatus(); }, _this._interval);
                    }
                },
                error: function (errors) {
                    _this.enableWrapper();
                    _this._authManagerListeners && typeof _this._authManagerListeners.onFailed === 'function' && _this._authManagerListeners.onFailed(errors);
                },
                xhrFields: {
                    withCredentials: true
                }
            });
        };
        DigitalSignatureManager.prototype._isClassNameNull = function (className) {
            return className === ".-null-";
        };
        // goes up the DOM heierachy till it hits a class with ds-wrapper class or reaches wrapper element
        DigitalSignatureManager.prototype.getWrapperForElementWithClass = function (element, className) {
            if (className === void 0) { className = "ds-wrapper"; }
            if (!element) {
                throw new Error("element searching for ".concat(className, " does not exist. you may have wrong referenced/template structure"));
            }
            var result = element;
            while (result && result != this._wrapper && !result.classList.contains(className)) {
                result = result.parentElement;
            }
            if (!result || !result.classList.contains("ds-wrapper")) {
                throw new Error("".concat(className, " class on any of ancestors of this element is expected: ").concat(element));
            }
            return result;
        };
        // goes up the DOM heierachy till it hits an element same as param elementName
        DigitalSignatureManager.prototype.getWrapperForElementWithNodeName = function (element, wrapperNodeName) {
            wrapperNodeName = wrapperNodeName.toUpperCase();
            if (!element) {
                throw new Error("element searching for node type: ".concat(wrapperNodeName, " does not exist. you may have wrong referenced/template structure"));
            }
            var result = element;
            while (result && result != this._wrapper && result.nodeName != wrapperNodeName) {
                result = result.parentElement;
            }
            if (!result || result.nodeName != wrapperNodeName) {
                throw new Error("node type number: ".concat(wrapperNodeName, " on any of ancestors of this element is expected: ").concat(element));
            }
            return result;
        };
        DigitalSignatureManager.addDefaultStyle = function () {
            if (this.isFirstInstance()) {
                var styleNode = document.createElement("style");
                styleNode.textContent = ""; // or add a src 
                document.head.appendChild(styleNode);
            }
        };
        DigitalSignatureManager.isFirstInstance = function () {
            return Object.keys(DigitalSignatureManager._wrapperIdToDigSigManagerInstance).length == 0;
        };
        DigitalSignatureManager.prototype.isDigSigMethodSelected = function () {
            return this._isDigSigMethodSelected;
        };
        DigitalSignatureManager.prototype.disableWrapper = function () {
            // @ts-ignore
            // backgroundPopupCommon();
            this._wrapper.style.opacity = "0.3";
        };
        DigitalSignatureManager.prototype.enableWrapper = function () {
            // setTimeout(() => {
            //     console.warn("remove timeout for enableWrapper in production");
            //     // @ts-ignore
            ////     UndobackgroundPopup();
            //     this._wrapper.style.opacity = 1;
            // }, 5000);
            this._wrapper.style.opacity = "1";
        };
        DigitalSignatureManager.prototype.setAction = function (action) {
            this._currentAction = action;
        };
        DigitalSignatureManager.prototype.getCurrentAction = function () {
            return this._currentAction;
        };
        DigitalSignatureManager.prototype.getRequiredInput = function () {
            return this._requiredInput;
        };
        DigitalSignatureManager.prototype.getInputsAndWrappers = function () {
            return this._inputsAndWrappers;
        };
        DigitalSignatureManager.prototype.hasRequiredInput = function () {
            return this._hasRequiredInput;
        };
        DigitalSignatureManager._baseApiUrl = "http://localhost:5288/api";
        DigitalSignatureManager._wrapperIdToDigSigManagerInstance = {};
        return DigitalSignatureManager;
    }());
    DigitalSignature.DigitalSignatureManager = DigitalSignatureManager;
})(DigitalSignature || (DigitalSignature = {}));
//# sourceMappingURL=DigitalSignatureManger.js.map