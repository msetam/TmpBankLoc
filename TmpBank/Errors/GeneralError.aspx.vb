Imports System.Web.ModelBinding

Namespace Pages
    Public Class GeneralError
        Inherits System.Web.UI.Page


        Protected Sub Page_Init(sender As Object, args As EventArgs) Handles Me.Load
            SetErrorData()
        End Sub

        Protected Sub SetErrorData()
            Dim errorCode As String = Request.QueryString("ErrorCode")
            Dim description As String = Request.QueryString("Description")
            ErrorCode_View.InnerHtml = If(String.IsNullOrEmpty(errorCode), "404", errorCode)
            ErrorDescription_View.InnerHtml = If(String.IsNullOrEmpty(description), "whoopssy doopsy", description)
        End Sub

    End Class
End Namespace