Public Class Account
    Inherits System.Web.UI.MasterPage

    Protected Sub Page_Init(sender As Object, e As EventArgs) Handles Me.Init
        Response.Cache.SetCacheability(HttpCacheability.NoCache)
        Response.Cache.SetExpires(DateTime.UtcNow.AddHours(-1))
        Response.Cache.SetNoStore()
    End Sub
    Protected Sub Page_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load

        Dim username As String = TmpBankService.Utils.IdentityUtils.GetUserName()

        Transactions_View.HRef = GetRouteUrl("AccountTransactions", New With {.UserName = username})
        FindUsers_View.HRef = GetRouteUrl("AccountFindUsers", New With {.UserName = username})

    End Sub

End Class