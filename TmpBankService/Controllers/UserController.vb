Imports System.Net
Imports System.Web.Http
Imports TmpBankService

Public Class UserController
    Inherits ApiController




    ' GET api/finduser/{username}
    <HttpGet>
    Public Function FindUser(username As String) As String
        Using userActions As New TmpBankService.Logic.UserActions()
            Dim result = userActions.FindUser(username, True)
            If result IsNot Nothing Then
                Return result.UserName
            End If
            Return $"users starting with {username} not found"
        End Using
    End Function




End Class
