Namespace Controls

    Public Class CustomMarkupContainer
        Inherits Control
        Implements INamingContainer

        Private _randomTest As Integer
        Friend Sub New(ByVal randomTest As Integer)
            Me._randomTest = randomTest
        End Sub

        Public Property Index() As Integer
            Get
                Return _randomTest
            End Get
            Set(ByVal value As Integer)
                _randomTest = value
            End Set
        End Property

    End Class

    Public Class DigitalSig
        Inherits System.Web.UI.UserControl

        Public Property DisableDefaultMarkup() As Boolean = False
        Public Property LoginOptions() As String() = {}
        Public Property Interval() As Integer

        Public Property WrapperId() As String
        Public Property SubmitButtonId As String
        Public Property DebugWaitTime As Integer

        Public Property RequiredInputId As String = ""

        Public Property DebugExpectedResult As DigSigService.DigSigStatus

        Private CustomMarkup As ITemplate = Nothing

        <TemplateContainer(GetType(CustomMarkupContainer))>
        <PersistenceMode(PersistenceMode.InnerProperty)>
        Public Property CustomTemplate() As ITemplate
            Get
                Return CustomMarkup
            End Get
            Set(ByVal value As ITemplate)
                CustomMarkup = value
            End Set
        End Property


        Protected Sub Control_Init() Handles Me.Init
            If CustomMarkup IsNot Nothing Then
                CustomTemplate.InstantiateIn(New CustomMarkupContainer(2))
            End If

            DataBind()
        End Sub


        Protected Overrides Sub OnDataBinding(e As EventArgs)
            MyBase.OnDataBinding(e)
            If SubmitButtonId Is Nothing Then
                SubmitButtonId = Submit_BTN.ClientID
            Else
                Submit_BTN.Visible = False
            End If
            If WrapperId Is Nothing Then
                WrapperId = DigSigWrapper.ClientID
            End If
            If RequiredInputId = "" Then
                RequiredInputId = NationalCode_UC.ClientID
            Else
                NationalCode_UC.Visible = False
            End If

            SetJavascript()
        End Sub

        Public Sub SetJavascript()
            Dim scriptControl = New LiteralControl()
            scriptControl.Text = $"<script> document.addEventListener('DOMContentLoaded', ()=> DigitalSignatureManager.createInstance('{WrapperId}', '{SubmitButtonId}', {Interval}, '{RequiredInputId}', {DirectCast(DebugExpectedResult, Integer)}, {DebugWaitTime}) )</script>"
            NamingContainer.Page.Header.Controls.Add(scriptControl)
        End Sub

    End Class
End Namespace