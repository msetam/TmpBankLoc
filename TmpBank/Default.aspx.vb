Namespace Pages
    Public Class _Default
        Inherits Page

        Protected Sub Page_Load(ByVal sender As Object, ByVal e As EventArgs) Handles Me.Load
            LoginAnchor_View.NavigateUrl = GetRouteUrl("AccountEntry", Nothing)
            TransactionsAnchor_View.NavigateUrl = GetRouteUrl("AccountTransactions",
                                                              New With {.Username = TmpBankService.Utils.IdentityUtils.CurrentUser.UserName})
        End Sub
    End Class
End Namespace