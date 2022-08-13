Namespace Controls
    Public Class LabeldInput
        Inherits System.Web.UI.UserControl

        Public Property Name As String = "input(string)"

        Public Property PlaceHolderText As String = "string only..."

        Public Property InputType As TextBoxMode = TextBoxMode.SingleLine
        Public Property CssClass As String = ""
        Public Property Disabled As Boolean = False
        Public Property Input As TextBox


        Protected Sub Control_Init(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Init
            Input = Input_View
            Label_View.Text = Name
            Input_View.Attributes.Add("placeholder", PlaceHolderText)
            Input_View.Attributes.Add("name", Name.ToLower)
            Wrapper.Attributes("class") = Wrapper.Attributes("class") + " " + CssClass
            If Disabled Then
                Input_View.Attributes.Add("disabled", "")
            End If
            DataBind()
        End Sub

        Protected Overrides Sub OnDataBinding(e As EventArgs)
            MyBase.OnDataBinding(e)
            Input_View.TextMode = InputType
        End Sub

        Public ReadOnly Property Value As String
            Get
                Return Input_View.Text
            End Get
        End Property


    End Class
End Namespace