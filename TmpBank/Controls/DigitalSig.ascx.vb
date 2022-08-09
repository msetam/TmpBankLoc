Imports System.ComponentModel
Imports System.Web.DynamicData
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


Namespace Controls

    Public Enum Action
        DISABLE = 0
        HIDE
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
    Public Class DigitalSig
        Inherits System.Web.UI.UserControl

        Public Property DisableDefaultMarkup() As Boolean = False
        'we cannot use defaultbutton on panel because the button is not visible now till
        'we render it into template  hence then need for WrappingPanel
        Public Property WrappingPanel() As Panel
        Public Property LoginOptions() As String() = {}
        Public Property Interval() As Integer
        Public Property Action() As Action = Action.DISABLE
        Public Property WrapperId() As String
        Public Property SubmitButtonId() As String
        Public Property DebugWaitTime() As Integer
        Public Property RequiredInputId() As String
        Public Property DebugExpectedResult() As DigSigService.DigSigStatus
        Public Property InputsNames() As List(Of String)


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
            ' we call set default attrs before addTemplates because that could override defualt settings
            SetDefaultForAttributes()
            _AddTemplates()
        End Sub

        Protected Sub SetJavascript()
            Dim scriptControl = New LiteralControl()
            scriptControl.Text = $"<script> document.addEventListener('DOMContentLoaded', ()=> DigitalSignatureManager.createInstance('{WrapperId}', '{SubmitButtonId}', {Interval}, {DirectCast(Action, Integer)} , '{RequiredInputId}','{String.Join(",", InputsNames) }' , {DirectCast(DebugExpectedResult, Integer)}, {DebugWaitTime}) )</script>"
            NamingContainer.Page.Header.Controls.Add(scriptControl)
        End Sub


        Private Sub SetDefaultForAttributes()
            If WrapperId Is Nothing Then
                WrapperId = DigSigWrapper_DIV.ClientID
            End If
            If InputsNames Is Nothing Then
                InputsNames = New List(Of String)
            End If
        End Sub

        Private Sub _AddTemplates()
            Dim container = New CustomMarkupContainer(2)
            HeaderMarkupTemplate?.InstantiateIn(container)
            InputsTemplate?.InstantiateIn(container)
            SubmitTemplate?.InstantiateIn(container)
            AuthMethodsTemplate?.InstantiateIn(container)
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
                For Each value In container.FindControlByAttribute("InputView")
                    InputsNames.Add(value.UniqueID)
                Next
                Dim requiredInputArr = container.FindControlByAttribute("RequiredInput").ToArray()
                If requiredInputArr IsNot Nothing AndAlso requiredInputArr.Count <> 0 AndAlso requiredInputArr.Length = 1 Then
                    RequiredInputId = requiredInputArr(0).ClientID
                    NationalCode_UC.Visible = False
                    Return
                End If
                ThrowAttrExpectedException("RequiredInput", "InputsTemplate")
                Return
            ElseIf RequiredInputId IsNot Nothing Then
                NationalCode_UC.Visible = False
            Else
                RequiredInputId = NationalCode_UC.Input.ClientID
            End If

        End Sub


        Private Sub _SetupAuth(container As CustomMarkupContainer)

        End Sub

        Private Sub _SetupFooter(container As CustomMarkupContainer)

        End Sub
        ' sets up SubmitButtonId and creates SubmitTemplate if exists
        Private Sub _SetupSubmitButton(container As CustomMarkupContainer)
            If SubmitTemplate IsNot Nothing Then
                Dim buttons = container.FindControlByAttribute("SubmitView", True).ToArray()
                If buttons.Count() > 0 AndAlso buttons.Count() = 1 Then
                    SubmitButtonId = buttons(0).ClientID
                    Submit_BTN.Visible = False
                    If WrappingPanel IsNot Nothing Then
                        WrappingPanel.DefaultButton = buttons(0).UniqueID
                    End If
                    Return
                End If
                ThrowAttrExpectedException("SubmitView", "SubmitTemplate")
            ElseIf SubmitButtonId IsNot Nothing Then
                Submit_BTN.Visible = False
                If WrappingPanel IsNot Nothing Then
                    WrappingPanel.DefaultButton = SubmitButtonId
                End If
            Else
                SubmitButtonId = Submit_BTN.ClientID
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
            Throw New Exception($"{attributeName} attribute expected on exactly one of the elements within {templateName}")
        End Sub

        Private Sub SubmitBtn_Click() Handles Submit_BTN.Click
            RaiseEvent Submit(Me, New EventArgs())
        End Sub

    End Class
End Namespace