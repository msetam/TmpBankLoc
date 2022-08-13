Imports TmpBankService

Namespace Pages
    Public Class SignOut
        Inherits System.Web.UI.Page


        Protected Sub Page_PreInit(sender As Object, e As EventArgs) Handles Me.PreInit

            If TmpBankService.Utils.IdentityUtils.IsCurrentUserAuthenticatedStatic Then
                TmpBankService.Utils.IdentityUtils.SignOut()
            End If
            Response.RedirectToRoute("AccountEntry", Nothing)

        End Sub

    End Class
End Namespace