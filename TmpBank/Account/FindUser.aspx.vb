Imports TmpBankService.Models
Imports TmpBankService.Utils

Namespace Pages

    Public Class FindUser
        Inherits Utils.RestrictedPage

        Protected Overrides ReadOnly Property AcceptedRoles As RoleType()
            Get
                Return {RoleType.ADMIN}
            End Get
        End Property

        Protected Sub UsernameChangedSubmit(sender As Object, e As EventArgs) Handles Submit_View.Click
            Dim result = New ServiceHost.UserFinderService().FindUser(Username_View.Text)

            If result IsNot Nothing Then
                Result_View.Text = result.Result

                HistoryList_View.DataSource = result.History
                HistoryList_View.DataBind()

                Username_View.Focus()
            End If

        End Sub
    End Class
End Namespace