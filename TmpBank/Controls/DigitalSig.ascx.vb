Imports System.ComponentModel
Imports TmpBank.Utils

Module Constants
    Public IsDebugMode = True
End Module

Namespace Controls

    Public Enum Action
        DISABLE = 0
        HIDE ' if action is set to HIDE use -wrapper class on whoever is wrapping your INPUT elements
        NONE
    End Enum

    Public Class CustomMarkupContainer
        Inherits UserControl

        Public Property BindingTest() As Integer

        Friend Sub New(ByVal randomTest As Integer)
            Me.BindingTest = randomTest
            Debug.WriteLine("Container Initialized")

        End Sub


    End Class


    ' The order in which the inputs for our script is defined:
    '   1- template
    '   2- attr
    '   3- default markup
    Public Class DigitalSigControl
        Inherits System.Web.UI.UserControl

        Public Property CssClass() As String = ""
        Public Property DisableDefaultMarkup() As Boolean = False

        ' if we use a panel and submit button is templated then we cannot use defaultbutton on panel because the button is not visible untill
        ' we render it into our template hence then need for WrappingPanel.
        Public Property WrappingPanel() As Panel
        Public Property Interval() As Integer
        Public Property Action() As Action = Action.DISABLE
        Public Property Wrapper() As Control

        ' if outside of control and within the wrapper you had put SubmitView attribute
        Public Property HasReferencedInputs() As Boolean = False

        ' if outside of control and within the wrapper you had put TargetAuthMethod attribute and
        ' a ds-wrapper on all of Auth methods radio buttons wrapper
        Public Property HasReferencedAuthMethods() As Boolean = False

        ' if outside of control and within the wrapper you had put RequiredInput or InputView attributes
        Public Property HasReferencedSubmitButton() As Boolean = False

        ' if the server already knows the required input then we can simply omit the input from client
        Public Property HasRequiredInput() As Boolean = False


        ' use these properties if you are using a control that generates multiple elements and setting attributes won't work
        Public Property InputsWrapperClass() As String = "-null-"
        Public Property TargetAuthMethodWrapperClass() As String = "-null-"
        Public Property RequiredInputWrapperClass() As String = "-null-"
        Public Property SubmitButtonWrapperClass() As String = "-null-"

        ' If you are referencing a custom user control then your classes could probably a property which DigitalSig is not aware of(we search for CssClass or a property starting with Css), if that's the case
        ' you can disable UserControl class checks with this attribute
        Public Property SkipClassChecks() As Boolean = False


        Protected _CustomEvents As EventHandlerList
        Private Shared ReadOnly Property _SubmitEventName As String = "submitClickedEvent"


        Protected ReadOnly Property CustomEvents As EventHandlerList
            Get
                If _CustomEvents Is Nothing Then
                    _CustomEvents = New EventHandlerList()
                End If
                Return _CustomEvents
            End Get
        End Property


        Public Custom Event Submit As EventHandler
            AddHandler(value As EventHandler)
                CustomEvents.AddHandler(_SubmitEventName, value)
            End AddHandler
            RemoveHandler(value As EventHandler)
                CustomEvents.RemoveHandler(_SubmitEventName, value)
            End RemoveHandler
            RaiseEvent(sender As Object, e As EventArgs)
                DirectCast(CustomEvents(_SubmitEventName), EventHandler)?.Invoke(sender, e)
            End RaiseEvent
        End Event


        Dim WithEvents _container As New CustomMarkupContainer(2)

        ' Custom Templates
        <TemplateContainer(GetType(CustomMarkupContainer))>
        <TemplateInstance(TemplateInstance.Single)>
        <Browsable(False)>
        <PersistenceMode(PersistenceMode.InnerProperty)>
        Public Property HeaderMarkupTemplate() As ITemplate

        ' Must include an element that has a DSTargetAuthMethod attribute or a css class with value = TargetAuthMethodWrapperClass
        ' also add a ds-wrapper class or a fieldset to whoever is wrapping all auth methods radio buttons
        <TemplateContainer(GetType(CustomMarkupContainer))>
        <TemplateInstance(TemplateInstance.Single)>
        <Browsable(False)>
        <PersistenceMode(PersistenceMode.InnerProperty)>
        Public Property AuthMethodsTemplate() As ITemplate

        ' Inlcudes all of the inputs for our control(except submit) which should be flagged with DSInputView or a css class with value = InputsWrapperClass
        ' If it has a required input then it should be flaged with adding a DSRequiredInput attribute(InputView is optional) or a css class with value = RequiredInputWrapperClass
        <TemplateContainer(GetType(CustomMarkupContainer))>
        <TemplateInstance(TemplateInstance.Single)>
        <Browsable(False)>
        <PersistenceMode(PersistenceMode.InnerProperty)>
        Public Property InputsTemplate() As ITemplate


        ' Must include an element thas DSSubmitView attribute or a css class with value = SubmitButtonWrapperClass
        <TemplateContainer(GetType(CustomMarkupContainer))>
        <TemplateInstance(TemplateInstance.Single)>
        <Browsable(False)>
        <PersistenceMode(PersistenceMode.InnerProperty)>
        Public Property SubmitTemplate() As ITemplate

        <TemplateContainer(GetType(CustomMarkupContainer))>
        <TemplateInstance(TemplateInstance.Single)>
        <Browsable(False)>
        <PersistenceMode(PersistenceMode.InnerProperty)>
        Public Property FooterMarkupTemplate() As ITemplate

        Protected Sub Control_Init() Handles Me.Init
            DataBind()
        End Sub


        Protected Overrides Sub OnDataBinding(e As EventArgs)
            MyBase.OnDataBinding(e)

            If DisableDefaultMarkup Then
                DefaultMarkup_DIV.Visible = False
            End If

            If RequiredInputWrapperClass <> "-null-" Then
                HasRequiredInput = True
            End If

            DigSigWrapper_DIV.Attributes("class") = DigSigWrapper_DIV.Attributes("class") + " " + CssClass

            ' we call SetDefaultForAttributes before _AddTemplates because _AddTemplates could override default settings
            SetDefaultsForAttributes()
            _AddTemplates()

        End Sub

        Protected Sub SetJavascript()
            Dim scriptControl = New LiteralControl()
            scriptControl.Text = $"<script> 
                                     DigitalSignature.DigitalSignatureManager.createInstance(
                                        ""{Wrapper.ClientID}"", 
                                        {Interval},
                                        {DirectCast(Action, Integer)}, 
                                        {If(HasRequiredInput, "true", "false")},
                                        "".{TargetAuthMethodWrapperClass}"",
                                        "".{InputsWrapperClass},.{RequiredInputWrapperClass}"",
                                        "".{SubmitButtonWrapperClass}""
                                    );
                                </script>"
            Page.Header.Controls.Add(scriptControl)
        End Sub


        Protected Sub SetDefaultsForAttributes()
            If Wrapper Is Nothing Then
                Wrapper = DigSigWrapper_DIV
            End If
        End Sub

        Private Sub _AddTemplates()
            HeaderMarkupTemplate?.InstantiateIn(_container)
            AuthMethodsTemplate?.InstantiateIn(_container)
            InputsTemplate?.InstantiateIn(_container)
            SubmitTemplate?.InstantiateIn(_container)
            FooterMarkupTemplate?.InstantiateIn(_container)

            CustomTemplate_PH.Controls.Add(_container)
        End Sub


        Private Sub _SetupHeader(container As CustomMarkupContainer)

        End Sub

        Private Sub _SetupAuthMethods(container As CustomMarkupContainer)

            If HasReferencedAuthMethods Or AuthMethodsTemplate IsNot Nothing Then
                DefaultAuthMethodsMarkup.Visible = False
                If Constants.IsDebugMode Then

                    Dim wrapper = If(HasReferencedAuthMethods, Me.Wrapper, container)
                    ' checking target auth method
                    If _IsClassNameNull(TargetAuthMethodWrapperClass) Then
                        Dim targetAuthMethods As Utils.ControlWithAttribute() = wrapper.FindControlByAttribute("DSTargetAuthMethod", stopOnFirstHit:=True).ToArray()
                        If targetAuthMethods.Count <> 1 Then
                            ThrowAttrExpectedException("DSTargetAuthMethod", "AuthMethodsTemplate")
                        End If
                    ElseIf Not SkipClassChecks Then
                        Dim targetAuthMethods As Utils.ControlWithCssClass() = _GetControlsWithClass(wrapper, TargetAuthMethodWrapperClass, True)
                        If targetAuthMethods.Count <> 1 Then
                            ThrowAttrExpectedException($"CssClass with value = {TargetAuthMethodWrapperClass}", wrapper.ClientID)
                        End If
                    End If

                End If

            End If
        End Sub

        ' Todo: test if its htmlcontrol with no id set we can still access UniqueID and it exists

        Private Sub _SetupInputs(container As CustomMarkupContainer)

            If HasReferencedInputs Or InputsTemplate IsNot Nothing Then
                DefaultInputsMarkup.Visible = False
                If Constants.IsDebugMode Then
                    Dim wrapper = If(HasReferencedInputs, Me.Wrapper, container)
                    ' required input
                    ' other inputs are optional so no checks for them unless we have defined InputsWrapperClass
                    If _IsClassNameNull(RequiredInputWrapperClass) Then
                        Dim requiredInputsArr As Utils.ControlWithAttribute() = wrapper.FindControlByAttribute("DSRequiredInput", stopOnFirstHit:=True).ToArray()
                        If HasRequiredInput AndAlso requiredInputsArr.Count <> 1 Then
                            ThrowAttrExpectedException("DSRequiredInput", "InputsTemplate")
                        End If
                    ElseIf Not SkipClassChecks Then
                        Dim inputsArr As Utils.ControlWithCssClass() = _GetControlsWithClass(wrapper, RequiredInputWrapperClass, True)
                        If HasRequiredInput AndAlso inputsArr.Count <> 1 Then
                            ThrowAttrExpectedException($"CssClass with value = {RequiredInputWrapperClass}", wrapper.ClientID)
                        End If
                    End If

                    ' defined InputsWrapperClass checks
                    If Not SkipClassChecks AndAlso Not _IsClassNameNull(InputsWrapperClass) Then
                        Dim inputsArr As Utils.ControlWithCssClass() = _GetControlsWithClass(wrapper, InputsWrapperClass, True)
                        If inputsArr.Count = 0 Then
                            ThrowAttrExpectedException($"CssClass with value = {InputsWrapperClass}", wrapper.ClientID)
                        End If
                    End If
                End If
            Else
                RequiredInputWrapperClass = "ds-required-input-wrapper"
                InputsWrapperClass = "ds-inputs-wrapper"
            End If

        End Sub

        ' wires up Submit event and creates SubmitTemplate if exists
        Private Sub _SetupSubmitButton(container As CustomMarkupContainer)
            Dim targetBtn As Button = Submit_BTN
            If HasReferencedSubmitButton Or SubmitTemplate IsNot Nothing Then
                Submit_BTN.Visible = False

                Dim wrapper = If(HasReferencedSubmitButton, Me.Wrapper, container)
                If _IsClassNameNull(SubmitButtonWrapperClass) Then
                    Dim submitButtonArr = wrapper.FindControlByAttribute("DSSubmitView", stopOnFirstHit:=True).ToArray()
                    If submitButtonArr.Count() <> 1 Then
                        ThrowAttrExpectedException("DSSubmitView", "SubmitTemplate")
                    End If
                    targetBtn = DirectCast(submitButtonArr(0).Control, Button)
                ElseIf Not SkipClassChecks Then
                    Dim submitButtonArr = _GetControlsWithClass(wrapper, SubmitButtonWrapperClass, True)
                    If submitButtonArr.Count <> 1 Then
                        ThrowAttrExpectedException($"CssClass with value = {SubmitButtonWrapperClass}", wrapper.ClientID)
                    End If
                    targetBtn = DirectCast(submitButtonArr(0).Control, Button)
                End If
            End If

            If targetBtn.Visible Then
                AddHandler targetBtn.Click, AddressOf SubmitBtn_Click
                If WrappingPanel IsNot Nothing Then
                    WrappingPanel.DefaultButton = targetBtn.UniqueID
                End If
            End If
        End Sub

        Private Sub _SetupFooter(container As CustomMarkupContainer)

        End Sub


        Private Sub CustomMarkupContainer_Init(container As CustomMarkupContainer, e As EventArgs) Handles _container.Init
            _SetupHeader(container)
            _SetupInputs(container)
            _SetupSubmitButton(container)
            _SetupAuthMethods(container)
            _SetupFooter(container)

            ' we set javascript after CustomMarkupContainer_Init because only then we have access to our templated element ids
            SetJavascript()
        End Sub

        Private Sub ThrowAttrExpectedException(expectation As String, templateName As String)
            Throw New Exception($"{expectation} expected on one of the elements within {templateName}")
        End Sub

        Private Sub SubmitBtn_Click()
            RaiseEvent Submit(Me, New EventArgs())
        End Sub


        Private Function _IsClassNameNull(className As String) As Boolean
            Return className = "-null-"
        End Function


        Private Function _GetControlsWithClass(wrapper As Control, className As String, stopOnFirstHit As Boolean) As Utils.ControlWithCssClass()
            Return wrapper.FindControlByClass(Function(value) value.Contains(className), stopOnFirstHit:=stopOnFirstHit).ToArray()
        End Function
    End Class
End Namespace