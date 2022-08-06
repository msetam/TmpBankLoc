Namespace Pages
    Public Class Base
        Inherits System.Web.UI.MasterPage


        Protected Sub Page_Load(ByVal sender As Object, ByVal e As EventArgs) Handles Me.Load

            Dim username As String = TmpBankService.Utils.IdentityUtils.GetUserName()

            Login_View.NavigateUrl = GetRouteUrl("AccountEntry", Nothing)

            Transactions_View.NavigateUrl = GetRouteUrl("AccountHome",
                                                        New With {
                                                           .Username = username
                                                           })
            SignOut_View.NavigateUrl = GetRouteUrl("AccountSignOut",
                                                   New With {
                                                      .Username = username})


            If TmpBankService.Utils.IdentityUtils.IsCurrentUserAuthenticated Then
                Login_View.Text = username
            End If

        End Sub

    End Class
End Namespace
