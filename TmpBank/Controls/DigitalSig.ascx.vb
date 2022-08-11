Imports System.ComponentModel
Imports TmpBank.Utils


'DigSigControl
'   - needs NationalCode therefor has default input for it which can be disabled(if disabled u need to specify the id of neccasary input)
'   - can have CUSTOM html inputs
'   - has the ability to disable inputs on submit
'   - exposes events for(with server/js)
'           submit
'           registersucessed
'           resgisterfailed
'           registerrequest
'           dig-sig method selected
'           dig-sig method unselected
'   - can putup loading screen default (optional)
'   - has a radio button list which on selecting dig-sig method event can disable/hide specified elements(in control we can specify action And id of the wrapper Or elements to apply action on)
'   - we have to be able to specify the wrapper place of radio-button-list/necessary-input
'   - can specify the interval of request
'   -* we add a schema to control that anyone adding a path to schema file the elements within our template Is validated against that


'Use this to control for authentication/authorization and client-side automation which exposes some apis to manage your workflow
'you get a onAuthMethodChanged(selectedAuthInputElement) event based on selecting an auth method radio button
'how to use:
'    * this control's markup and js and are wired up based on:
'        1- templates
'        2- attributes
'        3- default markup
'    in the order specified.
'        1- if template is defiend then attrs and default markup are disabled and ingonred
'        2- if template is not defiened and attrs are defined then default markup is disabled and ingonred
'        3- if nor template and attrs are defined then default markup is generated and js is wired up to those elements

'    **example usage with templates:
'            ''
'             <uc:DigitalSignatureManager runat="server"
'                ID="DigitalSig1"
'                Interval="1000"
'                Wrapper="<%# Wrapper_View %>"
'                WrappingPanel="<%# LoginWrapper3_PNL%>"
'                DebugWaitTime="10000"
'                DebugExpectedResult="<%# TmpBank.DigSigService.DigSigStatus.SUCCEEDED %>">
'                <InputsTemplate>
'                    <input ... InputView>
'                    <input ... InputView>
'                    <input ... InputView InputView RequiredInput >
'                </InputsTemplate>
'                <SubmitTemplate>
'                    my submit  template
'                    <asp:Button ID="Button1" runat="server" CssClass="btn btn-light" Text="Login" SubmitView />
'                </SubmitTemplate>
'             </uc:DigitalSignatureManager>
'            ''
'        Wrapper is the control which wraps all of our inputs related to this control. We 'Wrapper's control id to disabled/enable it on starting/ending requests and do elements queries within it.
'        WrapperPanel is used here because if we use SubmitTemplate then <asp:Button> is not visible to our <asp:Panel> when we try to set the DefaultButton attribute therefor we get a compilation error.
'        we pass it to our control which then sets the correct button to asp:Panel automatically.
'        Interval sets the interval of our request, which fires onRetry on client-side on every request. If its not set we just send the request once and fire onSuccess or onFailed
'        based on the status of request.
'        As you might have noticed there are two additional attributes defined on our controls like 'InputView', 'RequiredInput' and 'SubmitView'. In DigitalSignatureManager class These attributes are used
'        to find these elements and wire up some events.

'        If you are using a control that generates multiple controls, the additional attribute might not add to the view you wanted(or not get added at all), if that's the case we can use the control like:
'            ''
'             <uc:DigitalSignatureManager runat="server"
'                ID="DigitalSig1"
'                Interval="1000"
'                Wrapper="<%# Wrapper_View %>"
'                WrappingPanel="<%# LoginWrapper3_PNL%>"
'                InputsWrapperClass="inputs-wrapper"
'                RequiredInputClass="required-input" <!-- default value for RequiredInputClass is '-ds-requierd-input', 'im' stands for DigitalSignatureManager -->
'                SubmitButtonWrapperClass="submit-input" <!-- default value for SubmitButtonClass is '-ds-submit-input', 'im' stands for DigitalSignatureManager -->
'                DebugWaitTime="10000"
'                DebugExpectedResult="<%# TmpBank.DigSigService.DigSigStatus.SUCCEEDED %>">
'                <InputsTemplate>
'                    <LabelAndInput ... CssClass="inputs-wrapper" />
'                    <LabelAndInput ... CssClass="inputs-wrapper required-input" />
'                    <input ... InputView>
'                </InputsTemplate>
'                <SubmitTemplate>
'                    my submit  template
'                    <asp:ButtonComposite ID="Button1" runat="server" CssClass="btn btn-light submit-wrapper" Text="Login" SubmitView />
'                </SubmitTemplate>
'             </uc:DigitalSignatureManager>
'            ''
'        This way our AuthManger class will search within these classes to find our elements(recursily till it finds input with type=[button/submit] in SubmitTemplate or any type of input in InputsTemplate)
'        ** examples with attribtutes and default submit button markup 
'           ''
'            <asp:Panel runat="server" ID="LoginWrapper2_PNL">
'                <div class="login table-bordered form-horizontal">
'                    <h2 class="h2">Login with default markup
'                    </h2>
'                    <uc:LabledInput ID="UserNameLogin2_View" Name="Username" PlaceHolderText="username..." runat="server" CssClass="-required-input" />
'                    <uc:LabledInput ID="LabledInput4" Name="Password" InputType="<%# TextBoxMode.Password %>" PlaceHolderText="password..." runat="server" />

'                    <uc:DigitalSig runat="server"
'                        ID="DigSig2_UC"
'                        Interval="1000"
'                        Wrapper="<%# LoginWrapper2_PNL %>"
'                        RequiredInputId="<%# UserNameLogin2_View.Input.ClientID %>"
'                        WrappingPanel="<%# LoginWrapper2_PNL %>"
'                        DebugWaitTime="10000"
'                        DebugExpectedResult="<%# TmpBank.DigSigService.DigSigStatus.FAILED %>">
'                    </uc:DigitalSig>
'            ....
'            ''


Namespace Controls

    Public Enum Action
        DISABLE = 0
        HIDE ' if action is set to HIDE use -wrapper class on whoever is wrapping your INPUT elements
        NONE
    End Enum

    Public Class CustomMarkupContainer
        Inherits UserControl
        Implements INamingContainer

        Private _randomTest As Integer
        Friend Sub New(ByVal randomTest As Integer)
            Me._randomTest = randomTest
            Debug.WriteLine("Container Initialized")

        End Sub

        Public Property Index() As Integer
    End Class


    ' The order in which the inputs for script are defined are as followed
    '   1- template
    '   2- attr
    '   3- default html
    Public Class DigitalSigControl
        Inherits System.Web.UI.UserControl

        Public Property CssClass() As String = ""
        Public Property DisableDefaultMarkup() As Boolean = False
        'we cannot use defaultbutton on panel because the button is not visible now till
        'we render it into template  hence then need for WrappingPanel
        Public Property WrappingPanel() As Panel
        Public Property Interval() As Integer
        Public Property Action() As Action = Action.DISABLE
        Public Property Wrapper() As Control
        ' if outside of control and within the wrapper you had put RequiredInput or InputView attributes
        Public Property HasReferencedSubmitButton() As Boolean = False
        ' if outside of control and within the wrapper you had put SubmitView attribute
        Public Property HasReferencedInputs() As Boolean = False
        ' if outside of control and within the wrapper you had put TargetAuthMethod attribute and
        ' a ds-wrapper on all of Auth methods radio buttons wrapper
        Public Property HasReferencedAuthMethods() As Boolean = False

        ' if the server already knows the required input then we can simply omit the input from client
        Public Property HasRequiredInput() As Boolean = False


        ' use these properties if you are using a control that generates multiple elements and setting attributes won't work
        Public Property InputsWrapperClass() As String = "-null-"
        Public Property RequiredWrapperInputClass() As String = "-null-"
        Public Property AuthMethodsWrapperClass() As String = "-null-"
        Public Property TargetAuthMethodWrapperClass() As String = "-null-"
        Public Property SubmitButtonWrapperClass() As String = "-null-"

        Protected _CustomEvents As EventHandlerList
        Protected Shared ReadOnly Property _ValueChangedEventOwner As New Object()


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
                CustomEvents.AddHandler(_ValueChangedEventOwner, value)
            End AddHandler
            RemoveHandler(value As EventHandler)
                CustomEvents.RemoveHandler(_ValueChangedEventOwner, value)
            End RemoveHandler
            RaiseEvent(sender As Object, e As EventArgs)
                DirectCast(Events(_ValueChangedEventOwner), EventHandler)?.Invoke(sender, e)
            End RaiseEvent
        End Event


        ' Custom Templates
        <TemplateContainer(GetType(CustomMarkupContainer))>
        <TemplateInstance(TemplateInstance.Single)>
        <Browsable(True)>
        <PersistenceMode(PersistenceMode.InnerProperty)>
        Public Property HeaderMarkupTemplate() As ITemplate


        ' Inlcudes all of the inputs for our control(except submit) which should be flagged with InputView
        ' Required input id should be flaged with adding RequiredInput attribute(optinal InputView)
        <TemplateContainer(GetType(CustomMarkupContainer))>
        <TemplateInstance(TemplateInstance.Single)>
        <Browsable(True)>
        <PersistenceMode(PersistenceMode.InnerProperty)>
        Public Property InputsTemplate() As ITemplate


        ' Must include a server control that has an element with SubmitView attribute
        <TemplateContainer(GetType(CustomMarkupContainer))>
        <TemplateInstance(TemplateInstance.Single)>
        <Browsable(True)>
        <PersistenceMode(PersistenceMode.InnerProperty)>
        Public Property SubmitTemplate() As ITemplate

        ' Must include a server control that has an element with MaintAuthMethod attribute
        ' also add a -wrapper class to whoever is wrapping all auth-methods radio buttons
        <TemplateContainer(GetType(CustomMarkupContainer))>
        <TemplateInstance(TemplateInstance.Single)>
        <Browsable(True)>
        <PersistenceMode(PersistenceMode.InnerProperty)>
        Public Property AuthMethodsTemplate() As ITemplate

        <TemplateContainer(GetType(CustomMarkupContainer))>
        <TemplateInstance(TemplateInstance.Single)>
        <Browsable(True)>
        <PersistenceMode(PersistenceMode.InnerProperty)>
        Public Property FooterMarkupTemplate() As ITemplate

        Protected Sub Control_Init() Handles Me.Init
            If DisableDefaultMarkup Then
                DefaultMarkup_DIV.Visible = False
            End If
            DataBind()

        End Sub


        Protected Overrides Sub OnDataBinding(e As EventArgs)
            MyBase.OnDataBinding(e)
            DigSigWrapper_DIV.Attributes("class") = DigSigWrapper_DIV.Attributes("class") + " " + CssClass
            ' we call set default attrs before addTemplates because that could override defualt settings
            SetDefaultForAttributes()
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
                                        "".{AuthMethodsWrapperClass},.{TargetAuthMethodWrapperClass}"",
                                        "".{InputsWrapperClass},.{RequiredWrapperInputClass}"",
                                        "".{SubmitButtonWrapperClass}"",
                                        {2},
                                        {10000}
                                    )
                                </script>"
            Page.Header.Controls.Add(scriptControl)
        End Sub


        Private Sub SetDefaultForAttributes()
            If Wrapper Is Nothing Then
                Wrapper = DigSigWrapper_DIV
            End If
        End Sub

        Private Sub _AddTemplates()
            Dim container = New CustomMarkupContainer(2)
            HeaderMarkupTemplate?.InstantiateIn(container)
            AuthMethodsTemplate?.InstantiateIn(container)
            InputsTemplate?.InstantiateIn(container)
            SubmitTemplate?.InstantiateIn(container)
            FooterMarkupTemplate?.InstantiateIn(container)
            AddHandler container.Init, AddressOf CustomMarkupContainer_Init
            CustomTemplate_PH.Controls.Add(container)
        End Sub


        ' all setup methods are ran at CustomMarkupContainer.PreRender because if we call any control within that container and
        ' ask for its ID we are not gonna get the FULL qualified id.
        Private Sub _SetupHeader(container As CustomMarkupContainer)

        End Sub



        ' Todo: test if its htmlcontrol with no id set we can still access UniqueID and it exists
        ' todo: requiredinput is not necessary to exist in InputsTemplate this could only be other auth methods inputs
        Private Sub _SetupInputs(container As CustomMarkupContainer)

            If InputsTemplate IsNot Nothing Then
                Dim requiredInputArr = container.FindControlByAttribute("RequiredInput").ToArray()
                If requiredInputArr IsNot Nothing AndAlso requiredInputArr.Count <> 0 AndAlso requiredInputArr.Length = 1 Then
                    NationalCode_UC.Visible = False
                ElseIf Not HasRequiredInput Then
                    ThrowAttrExpectedException("RequiredInput", "InputsTemplate")
                End If
            ElseIf HasReferencedInputs Then
                NationalCode_UC.Visible = False
            Else
                NationalCode_UC.Visible = False
            End If

        End Sub


        Private Sub _SetupAuth(container As CustomMarkupContainer)
            If AuthMethodsTemplate IsNot Nothing Then
                DefaultAuthMethodsMarkup.Visible = False
                ' only the target radio button
                Dim targetAuthMethods = container.FindControlByAttribute("TargetAuthMethod").ToArray()
                If targetAuthMethods.Count <> 1 Then
                    ThrowAttrExpectedException("TargetAuthMethod", "AuthMethodsTemplate")
                End If
            ElseIf HasReferencedAuthMethods Then
                DefaultAuthMethodsMarkup.Visible = False
            End If
        End Sub

        Private Sub _SetupFooter(container As CustomMarkupContainer)

        End Sub
        ' sets up SubmitButtonId and creates SubmitTemplate if exists
        Private Sub _SetupSubmitButton(container As CustomMarkupContainer)
            If SubmitTemplate IsNot Nothing Then
                Dim buttons = container.FindControlByAttribute("SubmitView", True).ToArray()
                If buttons.Count() > 0 AndAlso buttons.Count() = 1 Then
                    Submit_BTN.Visible = False
                    If WrappingPanel IsNot Nothing Then
                        WrappingPanel.DefaultButton = buttons(0).UniqueID
                    End If
                Else
                    ThrowAttrExpectedException("SubmitView", "SubmitTemplate")
                End If
            ElseIf HasReferencedSubmitButton Then
                Submit_BTN.Visible = False
                If WrappingPanel IsNot Nothing Then
                    Dim buttons = container.FindControlByAttribute("SubmitView", True).ToArray()
                    If buttons.Count() > 0 AndAlso buttons.Count() = 1 Then
                        WrappingPanel.DefaultButton = Wrapper.FindControlByAttribute("SubmitView").ToArray()(0).UniqueID
                    Else
                        ThrowAttrExpectedException("SubmitView", "SubmitTemplate")
                    End If
                End If
            Else
                If WrappingPanel IsNot Nothing Then
                    WrappingPanel.DefaultButton = Submit_BTN.UniqueID
                End If
            End If

        End Sub

        ' we set javascript after CustomMarkupContainer_Init because only then we have access to templated elements ids
        Private Sub CustomMarkupContainer_Init(container As CustomMarkupContainer, e As EventArgs)

            _SetupHeader(container)
            _SetupInputs(container)
            _SetupSubmitButton(container)
            _SetupAuth(container)
            _SetupFooter(container)

            SetJavascript()

        End Sub

        Private Sub ThrowAttrExpectedException(attributeName As String, templateName As String)
            Throw New Exception($"{attributeName} attribute expected on one of the elements within {templateName}")
        End Sub

        Private Sub SubmitBtn_Click() Handles Submit_BTN.Click
            RaiseEvent Submit(Me, New EventArgs())
        End Sub

    End Class
End Namespace