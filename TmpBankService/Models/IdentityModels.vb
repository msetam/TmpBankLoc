
Imports Microsoft.AspNet.Identity
Imports Microsoft.AspNet.Identity.EntityFramework
Imports Microsoft.Owin.Security

Namespace Models

    '    Public Class ApplicationUser
    '        Inherits IdentityUser
    '    End Class

    '    Public Class ApplicationDbContext
    '        Inherits IdentityDbContext(Of ApplicationUser)

    '        Public Sub New()
    '            MyBase.New("DefaultConnection")
    '        End Sub

    '    End Class


    '    Public Class CustomUserManager
    '        Inherits UserManager(Of ApplicationUser)
    '        Public Sub New()
    '            MyBase.New(New UserStore(Of ApplicationUser)(New ApplicationDbContext))
    '        End Sub
    '    End Class

    'End Namespace


    'Public Module IdentityHelper
    '    Dim XSRFKey As String = "XsrfSomething"
    '    Public Sub SignIn(ByVal manager As Models.CustomUserManager, ByVal user As Models.ApplicationUser, ByVal isPersistent As Boolean)
    '        Dim authenticationManager As IAuthenticationManager = HttpContext.Current.GetOwinContext().Authentication
    '        authenticationManager.SignOut(DefaultAuthenticationTypes.ExternalCookie)
    '        Dim identity = manager.CreateIdentity(user, DefaultAuthenticationTypes.ApplicationCookie)
    '        authenticationManager.SignIn(New AuthenticationProperties() With {
    '            .IsPersistent = isPersistent
    '        }, identity)
    '    End Sub

    '    Public Const ProviderNameKey As String = "providerName"

    '    Public Function GetProviderNameFromRequest(ByVal request As HttpRequest) As String
    '        Return request(ProviderNameKey)
    '    End Function
    '    Private Function IsLocalUrl(ByVal url As String) As Boolean
    '        Return Not String.IsNullOrEmpty(url) AndAlso ((url(0) = "/"c AndAlso (url.Length = 1 OrElse (url(1) <> "/"c AndAlso url(1) <> "\"c))) OrElse (url.Length > 1 AndAlso url(0) = "~"c AndAlso url(1) = "/"c))
    '    End Function

    '    Public Sub RedirectToReturnUrl(ByVal returnUrl As String, ByVal response As HttpResponse)
    '        If Not String.IsNullOrEmpty(returnUrl) AndAlso IsLocalUrl(returnUrl) Then
    '            response.Redirect(returnUrl)
    '        Else
    '            response.Redirect("~/")
    '        End If
    '    End Sub
    ' End Module
End Namespace