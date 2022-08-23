Imports System.ComponentModel
Imports EndUserWebSite.Utils

' AM[Name]AuthMethod, if this auth method has a RequiredInput attribute as well then the corresponding AM[Name]InputView MUST exist
' AM[Name]InputView
Namespace Controls
    Namespace AuthManagerUtils
        Public Enum Action
            DISABLE = 0
            HIDE ' if action is set to HIDE use -wrapper class on whoever is wrapping your INPUT elements
            NONE
        End Enum

        Public Module TagNames
            Public GOOGLE_AUTH = "AMGoogleAuth"
            Public DIGITAL_SIGNATURE = "AMDigitalSig"
            Public PASSWORD = "AMPassword"
        End Module

        Public Class CustomMarkupContainer
            Inherits UserControl

            Public Property BindingTest() As Integer

            Public Sub New(ByVal randomTest As Integer)
                Me.BindingTest = randomTest
                Debug.WriteLine("Container Initialized")
            End Sub
        End Class

        Public Class SubmitEventArgs
            Inherits EventArgs

            Public Property IsDigSigMethodSelected() As Boolean

            Public Sub New(isDigSigMethodSelected As Boolean)
                Me.IsDigSigMethodSelected = isDigSigMethodSelected
            End Sub

        End Class
    End Namespace


    ' The order in which the inputs for our script is defined:
    '   1- template
    '   2- attr
    '   3- default markup
    Public Class AuthManagerControl
        Inherits System.Web.UI.UserControl

        Public Property CssClass() As String = ""
        Public Property DisableDefaultMarkup() As Boolean = False

        Private Const DEFAULT_MARKUP_ATTRIBUTE_NAME = "AuthManagerDefaultMarkup"

        ' if we use a panel and submit button is templated then we cannot use defaultbutton on panel because the button is not visible untill
        ' we render it into our template hence then need for WrappingPanel.
        Public Property WrappingPanel() As Panel
        Public Property Interval() As Integer
        Public Property Action() As AuthManagerUtils.Action = AuthManagerUtils.Action.DISABLE
        Public Property Wrapper() As Control

        ' if outside of control and within the wrapper you had put SubmitView attribute
        Public Property HasReferencedInputs() As Boolean = False

        ' if outside of control and within the wrapper you had put TargetAuthMethod attribute and
        ' a am-wrapper on all of Auth methods radio buttons wrapper
        Public Property HasReferencedAuthMethods() As Boolean = False

        ' if outside of control and within the wrapper you had put RequiredInput or InputView attributes
        Public Property HasReferencedSubmitButton() As Boolean = False

        ' use these properties if you are using a control that generates multiple elements and setting attributes won't work
        '   INPUTS:
        Public Property InputsWrapperClass() As String = "-null-"  ' used for other input methods that are within the same wrapper as other inputs but they are not related to them in any way, we apply [Action.HIDE,..] when auth method changes
        Public Property PasswordInputWrapperClass() As String = "-null-"
        Public Property DigitalSigInputWrapperClass() As String = "-null-"
        Public Property GoogleAuthInputWrapper() As String = "-null-"

        '    AUTH METHODS:
        Public Property AuthMethodsWrapperClass() As String = "-null-"
        Public Property PasswordAuthMethodWrapperClass() As String = "-null-"
        Public Property DigitalSigAuthMethodWrapperClass() As String = "-null-"
        Public Property GoogleAuthMethodWrapper() As String = "-null-"
        Public Property SubmitWrapperClass() As String = "-null-"

        ' If you are referencing a custom user control then your classes could probably use a property that AuthManager is not aware of(we search for CssClass or a property starting with Css), if that's the case
        ' you can disable UserControl class checks with this attribute
        Public Property SkipClassChecks() As Boolean = False


        Protected _CustomEvents As EventHandlerList
        Protected ReadOnly Property CustomEvents As EventHandlerList
            Get
                If _CustomEvents Is Nothing Then
                    _CustomEvents = New EventHandlerList()
                End If
                Return _CustomEvents
            End Get
        End Property

        Private Const _DIGITAL_SIG_SUBMIT_EVENT_NAME = "AUTHMANAGERDigitalSigSubmitClickedEvent"

        Public Custom Event Submit As EventHandler
            AddHandler(value As EventHandler)
                CustomEvents.AddHandler(_DIGITAL_SIG_SUBMIT_EVENT_NAME, value)
            End AddHandler
            RemoveHandler(value As EventHandler)
                CustomEvents.RemoveHandler(_DIGITAL_SIG_SUBMIT_EVENT_NAME, value)
            End RemoveHandler
            RaiseEvent(sender As Object, e As AuthManagerUtils.SubmitEventArgs)
                DirectCast(CustomEvents(_DIGITAL_SIG_SUBMIT_EVENT_NAME), EventHandler)?.Invoke(sender, e)
            End RaiseEvent
        End Event


        Dim WithEvents _container As New AuthManagerUtils.CustomMarkupContainer(2)

        ' Custom Templates
        <TemplateContainer(GetType(AuthManagerUtils.CustomMarkupContainer))>
        <TemplateInstance(TemplateInstance.Single)>
        <Browsable(False)>
        <PersistenceMode(PersistenceMode.InnerProperty)>
        Public Property HeaderMarkupTemplate() As ITemplate

        ' Must include an element that has a AMTargetAuthMethod attribute or a css class with value = TargetAuthMethodWrapperClass
        ' also add a am-wrapper class or a fieldset to whoever is wrapping all auth methods radio buttons
        <TemplateContainer(GetType(AuthManagerUtils.CustomMarkupContainer))>
        <TemplateInstance(TemplateInstance.Single)>
        <Browsable(False)>
        <PersistenceMode(PersistenceMode.InnerProperty)>
        Public Property AuthMethodsTemplate() As ITemplate

        ' Inlcudes all of the inputs for our control(except submit) which should be flagged with AMInputView or a css class with value = InputsWrapperClass
        ' If it has a required input then it should be flaged with adding a AMRequiredInput attribute(InputView is optional) or a css class with value = RequiredInputWrapperClass
        <TemplateContainer(GetType(AuthManagerUtils.CustomMarkupContainer))>
        <TemplateInstance(TemplateInstance.Single)>
        <Browsable(False)>
        <PersistenceMode(PersistenceMode.InnerProperty)>
        Public Property InputsTemplate() As ITemplate


        ' Must include an element thas AMSubmitView attribute or a css class with value = SubmitButtonWrapperClass
        <TemplateContainer(GetType(AuthManagerUtils.CustomMarkupContainer))>
        <TemplateInstance(TemplateInstance.Single)>
        <Browsable(False)>
        <PersistenceMode(PersistenceMode.InnerProperty)>
        Public Property SubmitTemplate() As ITemplate

        <TemplateContainer(GetType(AuthManagerUtils.CustomMarkupContainer))>
        <TemplateInstance(TemplateInstance.Single)>
        <Browsable(False)>
        <PersistenceMode(PersistenceMode.InnerProperty)>
        Public Property FooterMarkupTemplate() As ITemplate

        Protected Sub Control_Init() Handles Me.Init
            DataBind()
        End Sub


        Protected Sub Control_Load() Handles Me.Load
            If IsPostBack Then
                Dim eventTarget As String = Request("__EVENTTARGET")
                If Not String.IsNullOrEmpty(eventTarget) AndAlso eventTarget = AuthManagerWrapper_DIV.ClientID Then
                    Dim isDigitalSigMethodSelected = BasePage.GetPostBackEventArgumnetFor("selectedAuthMethodName")
                    If isDigitalSigMethodSelected IsNot Nothing Then
                        RaiseEvent Submit(Me, New AuthManagerUtils.SubmitEventArgs(isDigitalSigMethodSelected = "true"))
                    End If
                End If
            End If
        End Sub

        Protected Overrides Sub OnDataBinding(e As EventArgs)
            MyBase.OnDataBinding(e)

            If DisableDefaultMarkup Then
                DefaultInputsMarkup.Visible = False
                DefaultAuthMethodsMarkup.Visible = False
                Submit_BTN.Visible = False
            End If

            AuthManagerWrapper_DIV.Attributes("class") = AuthManagerWrapper_DIV.Attributes("class") + " " + CssClass

            ' we call SetDefaultForAttributes before _AddTemplates because _AddTemplates could override default settings
            SetDefaultsForAttributes()
            _AddTemplates()

        End Sub

        Protected Sub SetJavascript()
            Dim scriptControl As New LiteralControl With {
                .Text = $"<script> 
                                    AuthManagerControl.AuthManager.createInstance(
                                        ""{AuthManagerWrapper_DIV.ClientID}"",
                                        ""{Wrapper.ClientID}"", 
                                        {Interval},
                                        {DirectCast(Action, Integer)}, 
                                        "".{PasswordAuthMethodWrapperClass},.{DigitalSigAuthMethodWrapperClass},.{GoogleAuthMethodWrapper}"",
                                        "".{PasswordInputWrapperClass},.{DigitalSigInputWrapperClass},.{GoogleAuthInputWrapper}"",
                                        "".{SubmitWrapperClass}""
                                    );
                         </script>"
            }
            Page.Header.Controls.Add(scriptControl)
        End Sub


        Protected Sub SetDefaultsForAttributes()
            If Wrapper Is Nothing Then
                Wrapper = AuthManagerWrapper_DIV
            End If

            ' these values are set so that we don't call FindControlWithAttribute and FindControlWithClass on these defaults by accident, see _GetControlWithAttributs/Class method in DigSigControl
            ' for instance if we have a reference to an input but the FindControlWithAttribute finds our default input first this could lead into a bug.
            DefaultInputsMarkup.Attributes.Add(DEFAULT_MARKUP_ATTRIBUTE_NAME, "true")
            DefaultAuthMethodsMarkup.Attributes.Add(DEFAULT_MARKUP_ATTRIBUTE_NAME, "true")
            Submit_BTN.Attributes.Add(DEFAULT_MARKUP_ATTRIBUTE_NAME, "true")

        End Sub

        Private Sub _AddTemplates()
            HeaderMarkupTemplate?.InstantiateIn(_container)
            AuthMethodsTemplate?.InstantiateIn(_container)
            InputsTemplate?.InstantiateIn(_container)
            SubmitTemplate?.InstantiateIn(_container)
            FooterMarkupTemplate?.InstantiateIn(_container)

            CustomTemplate_PH.Controls.Add(_container)
        End Sub


        Private Sub _SetupHeader(container As AuthManagerUtils.CustomMarkupContainer)

        End Sub

        ' returns [HasPasswordAuthMethod, HasDigitalSigAuthMethod, HasGoogleAuthMethod]
        Private Function _SetupAuthMethods(container As AuthManagerUtils.CustomMarkupContainer) As Boolean()
            If Constants.IsDebugMode Then
                Dim result = {False, False, False}

                result(0) = _validateAuthMethods(container, AuthManagerUtils.TagNames.PASSWORD + "AuthMethod", DigitalSigAuthMethodWrapperClass) IsNot Nothing OrElse Not _IsClassNameNull(PasswordAuthMethodWrapperClass)
                result(1) = _validateAuthMethods(container, AuthManagerUtils.TagNames.DIGITAL_SIGNATURE + "AuthMethod", DigitalSigAuthMethodWrapperClass) IsNot Nothing OrElse Not _IsClassNameNull(DigitalSigAuthMethodWrapperClass)
                result(2) = _validateAuthMethods(container, AuthManagerUtils.TagNames.GOOGLE_AUTH + "AuthMethod", DigitalSigAuthMethodWrapperClass) IsNot Nothing OrElse Not _IsClassNameNull(GoogleAuthMethodWrapper)

                Return result
            End If
            Return {False, False, False}
        End Function

        ' TODO: test if its htmlcontrol with no id set we can still access UniqueID and it exists
        Private Sub _SetupInputs(container As AuthManagerUtils.CustomMarkupContainer, authMethodsExistanceState As Boolean())
            If Constants.IsDebugMode Then
                _validateTemplate(DefaultInputsMarkup, container, InputsTemplate, InputsWrapperClass, HasReferencedInputs, "AMInputView", Function(numberOfControls) True)
            End If
            If Not HasReferencedInputs AndAlso InputsTemplate Is Nothing Then
                InputsWrapperClass = "am-inputs-wrapper"
            End If
        End Sub

        ' wires up Submit event and creates SubmitTemplate if exists
        Private Sub _SetupSubmitButton(container As AuthManagerUtils.CustomMarkupContainer)
            Dim controlResult = _validateTemplate(Submit_BTN, container, SubmitTemplate, SubmitWrapperClass, HasReferencedSubmitButton, "AMSubmitView", Function(numberOfControls) numberOfControls = 1)
            Dim targetBtn As Button = Submit_BTN
            If controlResult IsNot Nothing Then
                targetBtn = controlResult(0).Control
            End If
            AddHandler targetBtn.Click, AddressOf SubmitBtn_Click
            If WrappingPanel IsNot Nothing Then
                WrappingPanel.DefaultButton = targetBtn.UniqueID
            End If
        End Sub

        Private Sub _SetupFooter(container As AuthManagerUtils.CustomMarkupContainer)

        End Sub

        ' use @Param defaultMarkupSetup when you need to to some setups if there no referenced nor templated views (or in other words we fallback to default template)
        ' returns the controls that it found during validation process,
        ' ******** IMPORTANT: if validation is skipped during Production env then it will return Nothing
        Private Function _validateTemplate(defaultMarkupView As Control, container As AuthManagerUtils.CustomMarkupContainer, template As ITemplate,
                                           wrapperClass As String, hasReferencedView As Boolean, tagName As String,
                                           isNumberOfControlsValid As Func(Of Integer, Boolean),
                                           Optional defaultMarkpSetup As System.Action = Nothing,
                                           Optional stopOnFirstHit As Boolean = True,
                                           Optional getControlWithAttributesFunc As Func(Of Control, String, Boolean, ControlWithAttribute()) = Nothing,
                                           Optional getControlWithClassFunc As Func(Of Control, String, Boolean, ControlWithAttribute()) = Nothing) As ControlWithAttributesAndCss()

            ' if not custom control finders are defined then we set the default control finders
            If getControlWithAttributesFunc Is Nothing Then
                getControlWithAttributesFunc = AddressOf _GetControlsWithAttribute
            End If
            If getControlWithClassFunc Is Nothing Then
                getControlWithClassFunc = AddressOf _GetControlsWithClass
            End If


            Dim controlsArr As ControlWithAttributesAndCss() = Nothing
            If hasReferencedView OrElse template IsNot Nothing Then
                defaultMarkupView.Visible = False
                Dim wrapper = If(hasReferencedView, Me.Wrapper, container)
                ' required input
                ' other inputs are optional so no checks for them unless we have defined InputsWrapperClass
                If _IsClassNameNull(wrapperClass) Then
                    Dim controlsWithAttrArr As Utils.ControlWithAttribute() = getControlWithAttributesFunc(wrapper, tagName, stopOnFirstHit)
                    If hasReferencedView AndAlso isNumberOfControlsValid(controlsWithAttrArr.Count) Then
                        ThrowAttrExpectedException(tagName, $"{template.GetType().Name}/Wrapper")
                    End If
                    controlsArr = controlsWithAttrArr.Select(Of Control)(Function(controlWithAttr) controlWithAttr.Control)
                ElseIf Not SkipClassChecks Then
                    Dim controlsWithCssArr As Utils.ControlWithAttributesAndCss() = getControlWithClassFunc(wrapper, wrapperClass, stopOnFirstHit)
                    If hasReferencedView AndAlso isNumberOfControlsValid(controlsWithCssArr.Count) Then
                        ThrowAttrExpectedException($"CssClass with value = {wrapperClass}", wrapper.ClientID)
                    End If
                    controlsArr = controlsWithCssArr.Select(Of Control)(Function(controlWithClass) controlWithClass.Control)
                End If
            Else
                defaultMarkpSetup?()
            End If
            Return controlsArr
        End Function

        Private Function _validateAuthMethods(container As AuthManagerUtils.CustomMarkupContainer, tagName As String, cssWrapperClass As String) As ControlWithAttributesAndCss()
            Return _validateTemplate(DefaultAuthMethodsMarkup, container, AuthMethodsTemplate, cssWrapperClass,
                                                          HasReferencedAuthMethods, Nothing,
                                                          Function(numberOfControls) True,
                                                          getControlWithAttributesFunc:=Function(wrapper As Control, __tag As String, stopOnFirstHit As Boolean)
                                                                                            Return wrapper.FindControlsByAttribute(Function(ctrlWithAttr)
                                                                                                                                       For Each key In ctrlWithAttr.Attributes.Keys
                                                                                                                                           If key.ToString() = tagName Then
                                                                                                                                               Return True
                                                                                                                                           End If
                                                                                                                                       Next
                                                                                                                                       Return False
                                                                                                                                   End Function)
                                                                                        End Function)
        End Function

        Private Sub CustomMarkupContainer_Init(container As AuthManagerUtils.CustomMarkupContainer, e As EventArgs) Handles _container.Init
            _SetupHeader(container)
            Dim authMethodsExistanceState = _SetupAuthMethods(container)
            _SetupInputs(container, authMethodsExistanceState)
            _SetupSubmitButton(container)
            _SetupFooter(container)

            ' we set javascript after CustomMarkupContainer_Init because only then we have access to our templated element ids
            SetJavascript()
        End Sub

        Private Sub ThrowAttrExpectedException(expectation As String, templateNameOrWrapepr As String)
            Throw New Exception($"{expectation} expected on one of the elements within {templateNameOrWrapepr}")
        End Sub

        Private Sub SubmitBtn_Click()
            RaiseEvent Submit(Me, New AuthManagerUtils.SubmitEventArgs(False))
        End Sub


        Private Function _IsClassNameNull(className As String) As Boolean
            Return className = "-null-"
        End Function



        Private Shared Function _GetControlsWithAttribute(wrapper As Control, attributeName As String, stopOnFirstHit As Boolean) As Utils.ControlWithAttribute()
            Return wrapper.FindControlsByAttribute(Function(controlWithAttribute)
                                                       Return controlWithAttribute.Attributes(DEFAULT_MARKUP_ATTRIBUTE_NAME) Is Nothing AndAlso controlWithAttribute.Attributes(attributeName) IsNot Nothing
                                                   End Function,
                                                  stopOnFirstHit:=stopOnFirstHit).ToArray()
        End Function
        Private Shared Function _GetControlsWithClass(wrapper As Control, className As String, stopOnFirstHit As Boolean) As Utils.ControlWithAttributesAndCss()
            Return wrapper.FindControlsByClass(Function(controlWithClass)
                                                   Return controlWithClass.Attributes?(DEFAULT_MARKUP_ATTRIBUTE_NAME) Is Nothing AndAlso controlWithClass.Css.Contains(className)
                                               End Function,
                                              stopOnFirstHit:=stopOnFirstHit).ToArray()
        End Function

        ' use this method when you perform the postback yourself using the clinet-side performPostBack(element, args)
        Public Function GetSelectedAuthMethodNameInPostBack() As String
            Return BasePage.GetPostBackEventArgumnetFor("selectedAuthMethodName")
        End Function

    End Class
End Namespace